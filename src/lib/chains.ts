// Chain configurations for CCTP V2 cross-chain transfers
import { 
  sepolia, 
  arbitrumSepolia, 
  baseSepolia, 
  optimismSepolia,
  avalancheFuji,
  polygonAmoy
} from 'viem/chains';
import { defineChain } from 'viem';

// Supported chain IDs for CCTP
export enum SupportedChainId {
  ETH_SEPOLIA = 11155111,
  ARB_SEPOLIA = 421614,
  BASE_SEPOLIA = 84532,
  OP_SEPOLIA = 11155420,
  AVAX_FUJI = 43113,
  POLYGON_AMOY = 80002,
}

// USDC contract addresses for each chain
export const CHAIN_IDS_TO_USDC_ADDRESSES: Record<number, string> = {
  [SupportedChainId.ETH_SEPOLIA]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  [SupportedChainId.ARB_SEPOLIA]: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  [SupportedChainId.BASE_SEPOLIA]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  [SupportedChainId.OP_SEPOLIA]: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
  [SupportedChainId.AVAX_FUJI]: '0x5425890298aed601595a70AB815c96711a31Bc65',
  [SupportedChainId.POLYGON_AMOY]: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
};

// TokenMessenger contract addresses for each chain (for burning)
export const CHAIN_IDS_TO_TOKEN_MESSENGER: Record<number, string> = {
  [SupportedChainId.ETH_SEPOLIA]: '0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa',
  [SupportedChainId.ARB_SEPOLIA]: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
  [SupportedChainId.BASE_SEPOLIA]: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
  [SupportedChainId.OP_SEPOLIA]: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
  [SupportedChainId.AVAX_FUJI]: '0xa9f510a2371f635227ae4a045f0ba9ec0db679e8',
  [SupportedChainId.POLYGON_AMOY]: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
};

// MessageTransmitter contract addresses for each chain (for minting)
export const CHAIN_IDS_TO_MESSAGE_TRANSMITTER: Record<number, string> = {
  [SupportedChainId.ETH_SEPOLIA]: '0x7865fafc2db2093669d92c0f33aeef291086bBBc',
  [SupportedChainId.ARB_SEPOLIA]: '0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca',
  [SupportedChainId.BASE_SEPOLIA]: '0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca',
  [SupportedChainId.OP_SEPOLIA]: '0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca',
  [SupportedChainId.AVAX_FUJI]: '0xa9d0c0e124f4908081a04d8c2567dd434d32c831',
  [SupportedChainId.POLYGON_AMOY]: '0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca',
};

// Destination domain mappings for CCTP
export const DESTINATION_DOMAINS: Record<number, number> = {
  [SupportedChainId.ETH_SEPOLIA]: 0,
  [SupportedChainId.ARB_SEPOLIA]: 3,
  [SupportedChainId.BASE_SEPOLIA]: 6,
  [SupportedChainId.OP_SEPOLIA]: 2,
  [SupportedChainId.AVAX_FUJI]: 1,
  [SupportedChainId.POLYGON_AMOY]: 7,
};

// Chain display names
export const CHAIN_TO_CHAIN_NAME: Record<number, string> = {
  [SupportedChainId.ETH_SEPOLIA]: 'Ethereum Sepolia',
  [SupportedChainId.ARB_SEPOLIA]: 'Arbitrum Sepolia',
  [SupportedChainId.BASE_SEPOLIA]: 'Base Sepolia',
  [SupportedChainId.OP_SEPOLIA]: 'Optimism Sepolia',
  [SupportedChainId.AVAX_FUJI]: 'Avalanche Fuji',
  [SupportedChainId.POLYGON_AMOY]: 'Polygon Amoy',
};

// Viem chain configurations
export const chains = {
  [SupportedChainId.ETH_SEPOLIA]: sepolia,
  [SupportedChainId.ARB_SEPOLIA]: arbitrumSepolia,
  [SupportedChainId.BASE_SEPOLIA]: baseSepolia,
  [SupportedChainId.OP_SEPOLIA]: optimismSepolia,
  [SupportedChainId.AVAX_FUJI]: avalancheFuji,
  [SupportedChainId.POLYGON_AMOY]: polygonAmoy,
};

// Circle's Iris API for attestations
export const IRIS_API_URL = 'https://iris-api-sandbox.circle.com';

// Chain logos for UI (using Chainlist URLs)
export const CHAIN_LOGOS: Record<number, string> = {
  [SupportedChainId.ETH_SEPOLIA]: 'https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg',
  [SupportedChainId.ARB_SEPOLIA]: 'https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg',
  [SupportedChainId.BASE_SEPOLIA]: 'https://icons.llamao.fi/icons/chains/rsz_base.jpg',
  [SupportedChainId.OP_SEPOLIA]: 'https://icons.llamao.fi/icons/chains/rsz_optimism.jpg',
  [SupportedChainId.AVAX_FUJI]: 'https://icons.llamao.fi/icons/chains/rsz_avalanche.jpg',
  [SupportedChainId.POLYGON_AMOY]: 'https://icons.llamao.fi/icons/chains/rsz_polygon.jpg',
};

// Block explorer URLs for transactions
export const BLOCK_EXPLORERS: Record<number, string> = {
  [SupportedChainId.ETH_SEPOLIA]: 'https://sepolia.etherscan.io',
  [SupportedChainId.ARB_SEPOLIA]: 'https://sepolia.arbiscan.io',
  [SupportedChainId.BASE_SEPOLIA]: 'https://sepolia.basescan.org',
  [SupportedChainId.OP_SEPOLIA]: 'https://sepolia-optimism.etherscan.io',
  [SupportedChainId.AVAX_FUJI]: 'https://testnet.snowtrace.io',
  [SupportedChainId.POLYGON_AMOY]: 'https://amoy.polygonscan.com',
};

// Default chain for transfers (Base Sepolia)
export const DEFAULT_CHAIN_ID = SupportedChainId.BASE_SEPOLIA;

// Helper function to get chain info
export function getChainInfo(chainId: number) {
  return {
    id: chainId,
    name: CHAIN_TO_CHAIN_NAME[chainId],
    logo: CHAIN_LOGOS[chainId],
    usdcAddress: CHAIN_IDS_TO_USDC_ADDRESSES[chainId],
    tokenMessenger: CHAIN_IDS_TO_TOKEN_MESSENGER[chainId],
    messageTransmitter: CHAIN_IDS_TO_MESSAGE_TRANSMITTER[chainId],
    destinationDomain: DESTINATION_DOMAINS[chainId],
    blockExplorer: BLOCK_EXPLORERS[chainId],
    viemChain: chains[chainId as keyof typeof chains],
  };
}

// Get list of supported chains for UI
export function getSupportedChains() {
  return Object.values(SupportedChainId)
    .filter((value): value is number => typeof value === 'number')
    .map(getChainInfo);
}
