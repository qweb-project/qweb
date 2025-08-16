import { NextRequest, NextResponse } from 'next/server';
import { getAllRegisteredWebsites, findRegisteredWebsite } from '@/lib/website-registry';

/**
 * Test endpoint to verify smart contract integration
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const testUrl = url.searchParams.get('url');
    
    if (testUrl) {
      // Test specific website
      console.log(`Testing website: ${testUrl}`);
      
      // Use smart matching to find registered website
      const websiteInfo = await findRegisteredWebsite(testUrl);
      
      return NextResponse.json({
        testUrl,
        matchFound: !!websiteInfo,
        websiteInfo: websiteInfo ? {
          registeredUrl: websiteInfo.url, // Show what URL is actually registered
          owner: websiteInfo.owner,
          paywall: websiteInfo.paywall.toString(),
          paywallUsdc: (Number(websiteInfo.paywall) / 1000000).toString()
        } : null
      });
    } else {
      // Get all websites
      console.log('Getting all registered websites');
      
      const allWebsites = await getAllRegisteredWebsites();
      
      return NextResponse.json({
        totalWebsites: allWebsites.length,
        websites: allWebsites.map(site => ({
          url: site.url,
          owner: site.owner,
          paywall: site.paywall.toString(),
          paywallUsdc: (Number(site.paywall) / 1000000).toString()
        }))
      });
    }
  } catch (error) {
    console.error('Error in test-contract API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Contract test failed' 
      },
      { status: 500 }
    );
  }
}
