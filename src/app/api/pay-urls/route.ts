import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateServerWallet, sendUSDC } from '@/lib/server-wallet';

// Hardcoded payment configuration
const URL_PAYMENTS: Record<string, { address: string; amount: string }> = {
  'wikipedia.org': {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Hardcoded recipient address
    amount: '0.001' // 0.001 USDC
  }
  // Add more URLs and their payment configs here
};

interface URLPaymentRequest {
  userAddress: string;
  urls: string[];
}

interface URLPaymentResult {
  url: string;
  paid: boolean;
  amount: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userAddress, urls }: URLPaymentRequest = await request.json();

    if (!userAddress || !urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { success: false, error: 'userAddress and urls array are required' },
        { status: 400 }
      );
    }

    console.log(`Processing URL payments for user: ${userAddress}`);
    console.log(`URLs to check: ${urls.join(', ')}`);

    const results: URLPaymentResult[] = [];

    for (const url of urls) {
      try {
        // Extract domain from URL
        const domain = extractDomain(url);
        console.log(`Domain: ${domain}`);
        const paymentConfig = URL_PAYMENTS[domain];

        if (paymentConfig) {
          console.log(`💰 Found payment config for ${domain}: ${paymentConfig.amount} USDC`);

          // Get user's server wallet
          const serverWallet = await getOrCreateServerWallet(userAddress);
          
          // Send actual USDC payment
          try {
            const transferResult = await sendUSDC(
              serverWallet.name,
              paymentConfig.address,
              paymentConfig.amount
            );

            if (transferResult.success) {
              results.push({
                url,
                paid: true,
                amount: paymentConfig.amount
              });
              console.log(`✅ Payment successful: ${paymentConfig.amount} USDC to ${paymentConfig.address}`);
            } else {
              results.push({
                url,
                paid: false,
                amount: paymentConfig.amount,
                error: 'Transfer failed'
              });
            }
          } catch (transferError) {
            console.error(`❌ Payment transfer failed for ${domain}:`, transferError);
            results.push({
              url,
              paid: false,
              amount: paymentConfig.amount,
              error: transferError instanceof Error ? transferError.message : 'Transfer failed'
            });
          }
        } else {
          // No payment required for this URL
          console.log(`ℹ️ No payment config found for domain: ${domain}`);
          results.push({
            url,
            paid: false,
            amount: '0'
          });
        }
      } catch (error) {
        console.error(`Error processing payment for ${url}:`, error);
        results.push({
          url,
          paid: false,
          amount: '0',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results: results
    });

  } catch (error) {
    console.error('Error in pay-urls API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment processing failed' 
      },
      { status: 500 }
    );
  }
}

/**
 * Extract domain from URL and normalize for payment matching
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    let hostname = urlObj.hostname.replace(/^www\./, ''); // Remove www. prefix
    
    // Normalize Wikipedia subdomains (en.wikipedia.org → wikipedia.org)
    if (hostname.includes('.wikipedia.org')) {
      hostname = 'wikipedia.org';
    }
    
    return hostname;
  } catch {
    // If URL parsing fails, try to extract domain from string
    let domain = url.replace(/^https?:\/\/(www\.)?|\/.*$/g, '');
    
    // Normalize Wikipedia subdomains for string extraction too
    if (domain.includes('.wikipedia.org')) {
      domain = 'wikipedia.org';
    }
    
    return domain;
  }
}


