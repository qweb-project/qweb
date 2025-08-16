import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateServerWallet, getWalletBalance } from '@/lib/server-wallet';

export async function POST(request: NextRequest) {
  try {
    const { action, userAddress, ...params } = await request.json();
    
    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'getOrCreate':
        const walletInfo = await getOrCreateServerWallet(userAddress);
        
        // Fetch real balance from blockchain
        const balance = await getWalletBalance(walletInfo.address);
        console.log(`Balance fetched for ${walletInfo.address}:`, balance);
        
        return NextResponse.json({
          success: true,
          wallet: {
            ...walletInfo,
            balance
          }
        });

      case 'getBalance':
        const { walletAddress } = params;
        if (!walletAddress) {
          return NextResponse.json(
            { error: 'Wallet address is required for balance check' },
            { status: 400 }
          );
        }
        
        const walletBalance = await getWalletBalance(walletAddress);
        return NextResponse.json({
          success: true,
          balance: walletBalance
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Server wallet API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('address');
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }
    
    const balance = await getWalletBalance(walletAddress);
    return NextResponse.json({
      success: true,
      balance
    });
  } catch (error) {
    console.error('Server wallet balance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
