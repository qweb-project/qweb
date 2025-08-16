import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateServerWallet, sendUSDC } from '@/lib/server-wallet';
import { findRegisteredWebsite } from '@/lib/website-registry';

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
        console.log(`Processing URL: ${url}`);
        
        // Use smart matching to find registered website (handles subdomains)
        const websiteInfo = await findRegisteredWebsite(url);

        if (websiteInfo) {
          // Convert paywall amount from wei-like units to USDC
          const paywallAmountUsdc = Number(websiteInfo.paywall) / 1000000;
          const paywallAmountStr = paywallAmountUsdc.toString();
          
          console.log(`💰 Found registered website ${websiteInfo.url}: ${paywallAmountStr} USDC to ${websiteInfo.owner}`);

          // Get user's server wallet
          const serverWallet = await getOrCreateServerWallet(userAddress);
          
          // Send actual USDC payment to the owner address from the contract
          try {
            const transferResult = await sendUSDC(
              serverWallet.name,
              websiteInfo.owner, // This is the address that gets paid
              paywallAmountStr
            );

            if (transferResult.success) {
              results.push({
                url,
                paid: true,
                amount: paywallAmountStr
              });
              console.log(`✅ Payment successful: ${paywallAmountStr} USDC to ${websiteInfo.owner}`);
            } else {
              results.push({
                url,
                paid: false,
                amount: paywallAmountStr,
                error: 'Transfer failed'
              });
            }
          } catch (transferError) {
            console.error(`❌ Payment transfer failed for ${websiteInfo.url}:`, transferError);
            results.push({
              url,
              paid: false,
              amount: paywallAmountStr,
              error: transferError instanceof Error ? transferError.message : 'Transfer failed'
            });
          }
        } else {
          // No payment required for this URL (not registered in contract)
          console.log(`ℹ️ No registered website found for URL: ${url}`);
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

    console.log(`📊 Payment results:`, results);
    
    return NextResponse.json({
      success: true,
      payments: results
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


