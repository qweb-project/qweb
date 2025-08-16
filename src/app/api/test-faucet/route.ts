import { NextRequest, NextResponse } from 'next/server';
import { CdpClient } from "@coinbase/cdp-sdk";

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    console.log(`Testing faucet funding for wallet: ${walletAddress}`);
    
    const cdp = new CdpClient();
    const results = [];

    // Test ETH faucet
    try {
      console.log('Requesting ETH from faucet...');
      const ethResult = await cdp.evm.requestFaucet({
        address: walletAddress,
        network: "base-sepolia",
        token: "eth",
      });
      
      results.push({
        token: 'ETH',
        success: true,
        transactionHash: ethResult.transactionHash,
        message: 'ETH faucet request successful'
      });
      
      console.log(`✅ ETH faucet success: ${ethResult.transactionHash}`);
    } catch (error: any) {
      results.push({
        token: 'ETH',
        success: false,
        error: error?.errorMessage || error?.message || 'Unknown error',
        errorType: error?.errorType,
        statusCode: error?.statusCode
      });
      
      console.error('❌ ETH faucet error:', error);
    }

    // Wait a moment before USDC request
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test USDC faucet
    try {
      console.log('Requesting USDC from faucet...');
      const usdcResult = await cdp.evm.requestFaucet({
        address: walletAddress,
        network: "base-sepolia",
        token: "usdc",
      });
      
      results.push({
        token: 'USDC',
        success: true,
        transactionHash: usdcResult.transactionHash,
        message: 'USDC faucet request successful'
      });
      
      console.log(`✅ USDC faucet success: ${usdcResult.transactionHash}`);
    } catch (error: any) {
      results.push({
        token: 'USDC',
        success: false,
        error: error?.errorMessage || error?.message || 'Unknown error',
        errorType: error?.errorType,
        statusCode: error?.statusCode
      });
      
      console.error('❌ USDC faucet error:', error);
    }

    return NextResponse.json({
      success: true,
      walletAddress,
      results,
      message: 'Faucet test completed'
    });

  } catch (error: any) {
    console.error('Test faucet API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
