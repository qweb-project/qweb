import { CdpClient } from "@coinbase/cdp-sdk";
import { createHash } from "crypto";

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
    // Fund with ETH first (needed for gas)
    try {
        if (parseFloat(balance.eth) < 0.0001) {
      const ethFaucetResult = await cdp.evm.requestFaucet({
        address: walletAddress,
        network: "base-sepolia",
        token: "eth",
      });
      console.log(`✅ ETH faucet transaction: ${ethFaucetResult.transactionHash}`);
    }
      // Wait a moment before requesting USDC
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error('❌ Error funding with ETH:', error?.errorMessage || error);
    }
    
    // Fund with USDC  
    try {
        if (parseFloat(balance.usdc) < 0.1) {
      const usdcFaucetResult = await cdp.evm.requestFaucet({
        address: walletAddress,
        network: "base-sepolia", 
        token: "usdc",
      });
      console.log(`✅ USDC faucet transaction: ${usdcFaucetResult.transactionHash}`);
    }
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
        usdcBalance = readableAmount.toFixed(2);
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
export async function sendUSDC(fromAddress: string, toAddress: string, amount: string) {
  try {
    const cdp = getCdpClient();
    
    // This would be implemented using CDP's transaction sending capabilities
    // For now, returning a placeholder response
    
    return {
      success: true,
      transactionHash: '0x...',
      message: 'USDC transfer initiated'
    };
  } catch (error) {
    console.error('Error sending USDC:', error);
    throw new Error('Failed to send USDC');
  }
}
