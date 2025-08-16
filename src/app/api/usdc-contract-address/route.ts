import { NextRequest, NextResponse } from 'next/server';
import { getCdpClient } from '@/lib/server-wallet';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    const cdp = getCdpClient();
    
    console.log(`Fetching USDC contract address for: ${address}`);
    
    // Fetch token balances to find USDC contract address
    const result = await cdp.evm.listTokenBalances({
      address: address as `0x${string}`,
      network: "base-sepolia",
    });

    // Look for USDC token in the balances
    let usdcContractAddress: string | null = null;
    
    result.balances.forEach((item) => {
      // Find USDC by symbol
      if (item.token.symbol === 'USDC') {
        usdcContractAddress = item.token.contractAddress;
        console.log(`✅ Found USDC contract address: ${usdcContractAddress}`);
      }
    });

    if (!usdcContractAddress) {
      // If USDC is not found in balances, user might not have any USDC
      // Return the known Base Sepolia USDC address as fallback
      console.log('USDC not found in user balances, using known Base Sepolia USDC address');
      usdcContractAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
    }

    return NextResponse.json({
      success: true,
      contractAddress: usdcContractAddress,
      network: 'base-sepolia'
    });

  } catch (error: any) {
    console.error('Error fetching USDC contract address:', error?.errorMessage || error);
    
    // Return fallback address on error
    return NextResponse.json({
      success: true,
      contractAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Fallback
      network: 'base-sepolia',
      note: 'Fallback address used due to API error'
    });
  }
}
