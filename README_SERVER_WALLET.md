# Server Wallet Integration

This document explains the Coinbase Server Wallet integration added to Qweb.

## Overview

In addition to the embedded wallet that users connect to in the UI, each user now gets an associated **server wallet** that's created and managed automatically by the backend. This server wallet:

1. **Creates automatically** when a user connects their embedded wallet
2. **Uses deterministic naming** based on the user's embedded wallet address
3. **Funds automatically** with testnet tokens when created (if balance is 0)
4. **Displays USDC balance** in the wallet connection header

## How It Works

### 1. Deterministic Wallet Creation

When a user connects their embedded wallet, the system:
- Takes their wallet address (e.g., `0x123...abc`)
- Creates a SHA-256 hash of the address
- Uses this hash to generate a unique account name: `qweb-user-{hash16chars}`
- Creates a server wallet with this name (or retrieves if it already exists)

### 2. Automatic Funding

New server wallets are automatically funded with:
- **Testnet ETH** for gas fees
- **Testnet USDC** for transactions

This happens via CDP Faucet API calls when the wallet balance is detected as 0.

### 3. Balance Display

The UI shows the server wallet's USDC balance next to the embedded wallet connection info.

## Implementation Details

### Backend Components

#### `src/lib/server-wallet.ts`
- Core server wallet service
- Handles wallet creation, funding, and balance checking
- Uses CDP v2 Server Wallet SDK

#### `src/app/api/server-wallet/route.ts`
- Next.js API routes for wallet operations
- Supports POST and GET requests
- Handles wallet creation and balance queries

### Frontend Components

#### `src/components/wallet/ServerWalletInfo.tsx`
- React component that displays server wallet USDC balance
- Shows loading states and error handling
- Automatically creates wallet when user connects embedded wallet

#### Updated `WalletConnection.tsx`
- Now includes `ServerWalletInfo` component
- Displays both embedded wallet info and server wallet balance

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# CDP Server Wallet API Keys (get from https://portal.cdp.coinbase.com)
CDP_API_KEY_ID=your-api-key-id-here
CDP_API_KEY_SECRET=your-api-key-secret-here
CDP_WALLET_SECRET=your-wallet-secret-here
```

## Setup Instructions

1. **Get CDP API Keys**:
   - Visit [CDP Portal](https://portal.cdp.coinbase.com)
   - Create a new project or use existing
   - Generate API keys and Wallet Secret
   - Add them to `.env.local`

2. **The integration is already complete** - server wallets will be created automatically when users connect their embedded wallets.

## Security Features

- **Deterministic but Secure**: Uses SHA-256 hashing so user addresses aren't exposed
- **TEE Security**: Private keys are secured in AWS Nitro Enclave Trusted Execution Environment
- **No Client Exposure**: All server wallet operations happen on the backend only

## UI Flow

1. User visits Qweb → sees sign-in button
2. User signs in with embedded wallet → embedded wallet address shown in top-right
3. **Automatically**: Server wallet created in background using their address as seed
4. **USDC balance** appears next to embedded wallet info (e.g., "$100.00 USDC")
5. If new wallet → shows "(New!)" indicator briefly

## Cost Considerations

- **Wallet Creation**: $0.005 per wallet operation (one-time per user)
- **Faucet Funding**: Free on testnets
- **Balance Queries**: Free (read operations)

## Networks Supported

- **Base Sepolia** (testnet) - for development/testing
- **Base Mainnet** - for production (when configured)

## Future Enhancements

This foundation enables:
- USDC transfers between users
- Payment processing
- Reward distributions
- DeFi integrations
- All powered by secure server wallets
