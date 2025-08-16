// Helper function for URL payment processing in chat API
// Uses smart contract to fetch payment information instead of hardcoded values

/**
 * Process URL payments for sources using on-chain data
 */

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
    console.log(`📊 Received payment data:`, paymentData);
    
    if (!paymentData.success) {
      throw new Error(paymentData.error || 'Payment processing failed');
    }

    // Add payment info to sources
    const sourcesWithPayments = sources.map(source => {
      const sourceUrl = source.metadata?.url;
      const paymentInfo = paymentData.payments.find((p: any) => p.url === sourceUrl);
      
      return {
        ...source,
        metadata: {
          ...source.metadata,
          payment: {
            paid: paymentInfo?.paid || false,
            amount: paymentInfo?.amount || '0',
            error: paymentInfo?.error || undefined
          }
        }
      };
    });

    console.log(`✅ Payment processing completed`);
    console.log(`📊 Sources with payment metadata:`, sourcesWithPayments.map(s => ({
      url: s.metadata?.url,
      payment: s.metadata?.payment
    })));
    return sourcesWithPayments;

  } catch (error) {
    console.error('Error in processURLPayments:', error);
    throw error;
  }
}
