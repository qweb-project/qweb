import { CdpClient } from "@coinbase/cdp-sdk";
import { createHash } from "crypto";
import { toAccount } from "viem/accounts";
import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";

// Initialize CDP client for server wallet operations
let cdpClient: CdpClient | null = null;

export function getCdpClient() {
  if (!cdpClient) {
    // Initialize with environment variables
    // These should be set in your .env.local file:
    // CDP_API_KEY_ID=your-api-key-id
    // CDP_API_KEY_SECRET=your-api-key-secret  
    // CDP_WALLET_SECRET=your-wallet-secret
    cdpClient = new CdpClient();
  }
  return cdpClient;
}

/**
 * Generate a deterministic account name from user's embedded wallet address
 */
function generateAccountName(userAddress: string): string {
  // Use SHA-256 to create a deterministic but obscured identifier
  const hash = createHash('sha256').update(userAddress.toLowerCase()).digest('hex');
  return `qweb-user-${hash.slice(0, 16)}`;
}

/**
 * Create or retrieve a server wallet for a user based on their embedded wallet address
 */
export async function getOrCreateServerWallet(userAddress: string) {
  try {
    const cdp = getCdpClient();
    const accountName = generateAccountName(userAddress);
    
    try {
      // Try to get existing account first
      const existingAccount = await cdp.evm.getAccount({
        name: accountName
      });
      
      console.log(`Retrieved existing server wallet for user: ${existingAccount.address}`);

      // Fund the wallet automatically with testnet tokens
      // Run funding in background, don't wait for it
    //   fundWalletIfNeeded(existingAccount.address).catch(error => {
    //     console.error('Background funding failed:', error);
    //   });
      
      return {
        address: existingAccount.address,
        name: accountName,
        isNew: false
      };
    } catch (error: any) {
      // Account doesn't exist, try to create a new one
      try {
        console.log(`Creating new server wallet for user address: ${userAddress}`);
        
        const newAccount = await cdp.evm.createAccount({
          name: accountName
        });
        
        console.log(`Created new server wallet: ${newAccount.address}`);
        
        // Fund the wallet automatically with testnet tokens
        // Run funding in background, don't wait for it
        fundWalletIfNeeded(newAccount.address).catch(error => {
          console.error('Background funding failed:', error);
        });
        
        return {
          address: newAccount.address,
          name: accountName,
          isNew: true
        };
      } catch (createError: any) {
        // If creation failed because account already exists (race condition),
        // try to get the existing account one more time
        if (createError.errorType === 'already_exists') {
          console.log(`Account was created by another request, retrieving existing account...`);
          try {
            const existingAccount = await cdp.evm.getAccount({
              name: accountName
            });

            // Fund the wallet automatically with testnet tokens
            // Run funding in background, don't wait for it
            // fundWalletIfNeeded(existingAccount.address).catch(error => {
            //   console.error('Background funding failed:', error);
            // });
            
            return {
              address: existingAccount.address,
              name: accountName,
              isNew: false
            };
          } catch (getError) {
            console.error('Failed to retrieve account after creation conflict:', getError);
            throw getError;
          }
        }
        throw createError;
      }
    }
  } catch (error) {
    console.error('Error creating/retrieving server wallet:', error);
    throw new Error('Failed to create server wallet');
  }
}

/**
 * Fund wallet with testnet tokens if balance is 0
 */
async function fundWalletIfNeeded(walletAddress: string) {
  try {
    const cdp = getCdpClient();
    
    console.log(`Funding wallet ${walletAddress} with testnet tokens...`);
    //check for wallet balance
    const balance = await getWalletBalance(walletAddress);
    // console.log(`Balance fetched for ${walletAddress}:`, balance);
    // Fund with ETH first (needed for gas)
    try {
        // if (parseFloat(balance.eth) < 0.0001) {
      const ethFaucetResult = await cdp.evm.requestFaucet({
        address: walletAddress,
        network: "base-sepolia",
        token: "eth",
      });
      console.log(`✅ ETH faucet transaction: ${ethFaucetResult.transactionHash}`);
    // }
      // Wait a moment before requesting USDC
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error('❌ Error funding with ETH:', error?.errorMessage || error);
    }
    
    // Fund with USDC  
    try {
        // if (parseFloat(balance.usdc) < 0.1) {
      const usdcFaucetResult = await cdp.evm.requestFaucet({
        address: walletAddress,
        network: "base-sepolia", 
        token: "usdc",
      });
      console.log(`✅ USDC faucet transaction: ${usdcFaucetResult.transactionHash}`);
    // }
    } catch (error: any) {
      console.error('❌ Error funding with USDC:', error?.errorMessage || error);
    }
    
  } catch (error) {
    console.error('Error in fundWalletIfNeeded:', error);
    // Don't throw error here, as this is optional funding
  }
}

/**
 * Get wallet balance for ETH and USDC using CDP Token Balance API
 */
export async function getWalletBalance(walletAddress: string) {
  try {
    const cdp = getCdpClient();
    
    console.log(`Fetching real balance for wallet: ${walletAddress}`);
    
    // Fetch token balances for Base Sepolia network
    const result = await cdp.evm.listTokenBalances({
      address: walletAddress as `0x${string}`,
      network: "base-sepolia",
    });

    let ethBalance = '0';
    let usdcBalance = '0';

    // Process each token balance
    result.balances.forEach((item) => {
      // Convert from wei/smallest unit to human-readable amount
      const readableAmount = Number(item.amount.amount) / Math.pow(10, item.amount.decimals);
      
      // ETH (native token) has this special contract address
      if (item.token.contractAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        ethBalance = readableAmount.toFixed(6);
        console.log(`✅ ETH balance: ${ethBalance}`);
      } 
      // USDC token - check by symbol 
      else if (item.token.symbol === 'USDC') {
        usdcBalance = readableAmount.toFixed(6);
        console.log(`✅ USDC balance: ${usdcBalance}`);
      }
      
      // Log all tokens for debugging
      console.log(`Token found: ${item.token.symbol} = ${readableAmount.toFixed(6)} (${item.token.contractAddress})`);
    });

    return {
      eth: ethBalance,
      usdc: usdcBalance,
      address: walletAddress
    };
  } catch (error: any) {
    console.error('Error fetching wallet balance:', error?.errorMessage || error);
    return {
      eth: '0',
      usdc: '0',
      address: walletAddress
    };
  }
}

/**
 * Send USDC from server wallet to another address
 */
export async function sendUSDC(fromAccountName: string, toAddress: string, amount: string) {
  try {
    const cdp = getCdpClient();
    
    console.log(`🔍 sendUSDC: Sending ${amount} USDC from account ${fromAccountName} to ${toAddress}`);
    
    // Get the account by name
    const account = await cdp.evm.getAccount({ name: fromAccountName });
    
    // Use the transfer method to send USDC
    const transferResult = await account.transfer({
      to: toAddress as `0x${string}`,
      amount: BigInt(parseFloat(amount) * 1000000), // Convert to USDC units (6 decimals) as BigInt
      token: "usdc",
      network: "base-sepolia"
    });
    
    console.log(`✅ USDC transfer successful: ${transferResult.transactionHash}`);
    
    return {
      success: true,
      transactionHash: transferResult.transactionHash,
      amount
    };
  } catch (error: any) {
    console.error('Error sending USDC:', error?.errorMessage || error);
    throw error;
  }
}

/**
 * Make x402 payment using server wallet
 */
export async function makeX402Payment(url: string, userAddress: string) {
  try {
    // Get or create server wallet for the user
    const walletInfo = await getOrCreateServerWallet(userAddress);
    
    console.log(`💼 Using server wallet: ${walletInfo.address} (${walletInfo.name})`);
    
    // Get the CDP account by name
    const cdp = getCdpClient();
    const serverAccount = await cdp.evm.getAccount({ name: walletInfo.name });
    
    // Convert to viem account for x402-fetch
    const account = toAccount(serverAccount);
    const fetchWithPayment = wrapFetchWithPayment(fetch, account);
    
    // Call the x402 server on port 3001
    const serverUrl = `http://localhost:3001/api/pay/${encodeURIComponent(url)}`;
    
    console.log(`🔄 Making x402 payment request to: ${serverUrl}`);

    const response = await fetchWithPayment(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    });

    // Extract payment response information
    const paymentResponseHeader = response.headers.get("x-payment-response");
    let paymentResponse = null;
    
    if (paymentResponseHeader) {
      paymentResponse = decodeXPaymentResponse(paymentResponseHeader);
      console.log(`✅ Payment response:`, paymentResponse);
    }

    const responseData = await response.json();

    return {
      success: true,
      statusCode: response.status,
      data: responseData,
      paymentResponse,
      serverWallet: walletInfo.address,
      walletName: walletInfo.name,
      url
    };

  } catch (error: any) {
    console.error(`❌ x402 payment failed for ${url}:`, error);
    
    return {
      success: false,
      error: error.message,
      url
    };
  }
}

/**
 * Check payment info from x402 server
 */
export async function checkPaymentInfo(url: string) {
  try {
    const serverUrl = `http://localhost:3001/api/payment-info/${encodeURIComponent(url)}`;
    
    console.log(`🔍 Checking payment info: ${serverUrl}`);

    const response = await fetch(serverUrl);
    const data = await response.json();

    return {
      success: true,
      data
    };

  } catch (error: any) {
    console.error(`❌ Failed to check payment info for ${url}:`, error);
    
    return {
      success: false,
      error: error.message,
      url
    };
  }
}

/**
 * Process complete x402 payment flow for a URL
 */
export async function processUrlPayment(url: string, userAddress: string) {
  try {
    console.log(`🚀 Starting x402 payment flow for: ${url}`);
    
    // 1. Check payment info
    console.log('📋 Checking payment requirements...');
    const paymentInfo = await checkPaymentInfo(url);
    
    if (!paymentInfo.success) {
      return {
        success: false,
        error: "Failed to get payment info",
        step: "payment_info"
      };
    }

    if (!paymentInfo.data.paymentRequired) {
      return {
        success: true,
        message: "No payment required for this URL",
        data: paymentInfo.data,
        step: "no_payment_needed"
      };
    }

    console.log(`💰 Payment required: ${paymentInfo.data.price} to ${paymentInfo.data.payTo}`);
    
    // 2. Check wallet balance
    console.log('💼 Checking server wallet balance...');
    const walletInfo = await getOrCreateServerWallet(userAddress);
    const balance = await getWalletBalance(walletInfo.address);
    console.log(`Wallet balance - ETH: ${balance.eth}, USDC: ${balance.usdc}`);
    
    // 3. Make payment
    console.log('💳 Making x402 payment...');
    const paymentResult = await makeX402Payment(url, userAddress);
    
    return {
      success: paymentResult.success,
      paymentInfo: paymentInfo.data,
      balance,
      paymentResult,
      step: "completed"
    };
    
  } catch (error: any) {
    console.error('❌ Payment flow failed:', error);
    return {
      success: false,
      error: error.message,
      step: "error"
    };
  }
}
