// Helper function for URL payment processing in chat API
// This is a copy of the function from search API to use in chat API

/**
 * Process URL payments for sources
 */
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

export async function processURLPayments(sources: any[], userAddress: string) {
  try {
    // Extract URLs from sources
    const urls = sources.map(source => source.metadata?.url).filter(Boolean);
    
    if (urls.length === 0) {
      return sources;
    }

    console.log(`🔍 Processing payments for ${urls.length} URLs:`, urls);

    // Call payment API
    const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/pay-urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAddress,
        urls
      }),
    });

    if (!paymentResponse.ok) {
      throw new Error('Payment API request failed');
    }

    const paymentData = await paymentResponse.json();
    
    if (!paymentData.success) {
      throw new Error(paymentData.error || 'Payment processing failed');
    }

    // Add payment info to sources
    const sourcesWithPayments = sources.map(source => {
      const sourceUrl = source.metadata?.url;
      const paymentInfo = paymentData.payments.find((p: any) => p.url === sourceUrl);
      
      if (paymentInfo) {
        return {
          ...source,
          metadata: {
            ...source.metadata,
            payment: {
              paid: paymentInfo.paid,
              amount: paymentInfo.amount,
              error: paymentInfo.error
            }
          }
        };
      }
      
      return source;
    });

    console.log(`✅ Payment processing completed`);
    return sourcesWithPayments;

  } catch (error) {
    console.error('Error in processURLPayments:', error);
    throw error;
  }
}
