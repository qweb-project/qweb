"use client";

import { useState, useCallback } from "react";
import {
  createPublicClient,
  http,
  encodeFunctionData,
  parseUnits,
  formatUnits,
  type Hex,
} from "viem";
import { useEvmAddress, useSendEvmTransaction } from "@coinbase/cdp-hooks";
import axios from "axios";
import {
  SupportedChainId,
  CHAIN_IDS_TO_USDC_ADDRESSES,
  CHAIN_IDS_TO_TOKEN_MESSENGER,
  CHAIN_IDS_TO_MESSAGE_TRANSMITTER,
  DESTINATION_DOMAINS,
  chains,
  IRIS_API_URL,
} from "@/lib/chains";

export type TransferStep =
  | "idle"
  | "checking-balance" 
  | "approving"
  | "burning"
  | "waiting-attestation"
  | "minting"
  | "completed"
  | "error";

interface TransferLog {
  timestamp: Date;
  message: string;
  type: "info" | "success" | "error" | "warning";
}

interface TransferState {
  currentStep: TransferStep;
  logs: TransferLog[];
  error: string | null;
  burnTxHash: string | null;
  mintTxHash: string | null;
}

const DEFAULT_DECIMALS = 6;

// Helper function to get network name for CDP
// Note: CDP hooks currently only support base-sepolia and ethereum-sepolia
function getNetworkFromChainId(chainId: SupportedChainId) {
  switch (chainId) {
    case SupportedChainId.ETH_SEPOLIA:
      return 'ethereum-sepolia' as const;
    case SupportedChainId.BASE_SEPOLIA:
      return 'base-sepolia' as const;
    case SupportedChainId.ARB_SEPOLIA:
    case SupportedChainId.OP_SEPOLIA:
    case SupportedChainId.AVAX_FUJI:
    case SupportedChainId.POLYGON_AMOY:
    default:
      // Fallback to base-sepolia for unsupported networks
      return 'base-sepolia' as const;
  }
}

// ERC-20 ABI functions
const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// TokenMessenger ABI for depositForBurn
const TOKEN_MESSENGER_ABI = [
  {
    type: "function",
    name: "depositForBurn",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "destinationDomain", type: "uint32" },
      { name: "mintRecipient", type: "bytes32" },
      { name: "burnToken", type: "address" },
      { name: "destinationCaller", type: "bytes32" },
      { name: "maxFee", type: "uint256" },
      { name: "minFinalityThreshold", type: "uint32" },
    ],
    outputs: [],
  },
] as const;

// MessageTransmitter ABI for receiveMessage
const MESSAGE_TRANSMITTER_ABI = [
  {
    type: "function",
    name: "receiveMessage",
    stateMutability: "nonpayable",
    inputs: [
      { name: "message", type: "bytes" },
      { name: "attestation", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

export function useCrossChainTransfer() {
  const { evmAddress } = useEvmAddress();
  const { sendEvmTransaction } = useSendEvmTransaction();
  
  const [state, setState] = useState<TransferState>({
    currentStep: "idle",
    logs: [],
    error: null,
    burnTxHash: null,
    mintTxHash: null,
  });

  const addLog = useCallback((message: string, type: TransferLog["type"] = "info") => {
    setState(prev => ({
      ...prev,
      logs: [
        ...prev.logs,
        {
          timestamp: new Date(),
          message,
          type,
        },
      ],
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error,
      currentStep: "error",
    }));
    addLog(error, "error");
  }, [addLog]);

  const setStep = useCallback((step: TransferStep) => {
    setState(prev => ({
      ...prev,
      currentStep: step,
      error: step === "idle" ? null : prev.error,
    }));
  }, []);

  // Get public client for a specific chain
  const getPublicClient = useCallback((chainId: SupportedChainId) => {
    return createPublicClient({
      chain: chains[chainId],
      transport: http(),
    });
  }, []);

  // Wait for transaction confirmation
  const waitForTransactionConfirmation = useCallback(async (
    txHash: string,
    chainId: SupportedChainId,
    confirmations: number = 1
  ): Promise<void> => {
    const publicClient = getPublicClient(chainId);
    
    addLog(`Waiting for transaction confirmation: ${txHash}`);
    
    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash as Hex,
        confirmations,
      });
      
      if (receipt.status === 'success') {
        addLog(`Transaction confirmed: ${txHash}`, "success");
      } else {
        throw new Error(`Transaction failed: ${txHash}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Transaction confirmation failed: ${errorMsg}`);
    }
  }, [getPublicClient, addLog]);

  // Check USDC balance
  const checkBalance = useCallback(async (
    chainId: SupportedChainId,
    userAddress: string
  ): Promise<string> => {
    const publicClient = getPublicClient(chainId);
    const usdcAddress = CHAIN_IDS_TO_USDC_ADDRESSES[chainId];

    try {
      const balance = await publicClient.readContract({
        address: usdcAddress as Hex,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [userAddress as Hex],
      });

      return formatUnits(balance, DEFAULT_DECIMALS);
    } catch (error) {
      console.error("Error checking balance:", error);
      return "0";
    }
  }, [getPublicClient]);

  // Check allowance
  const checkAllowance = useCallback(async (
    chainId: SupportedChainId,
    userAddress: string
  ): Promise<bigint> => {
    const publicClient = getPublicClient(chainId);
    const usdcAddress = CHAIN_IDS_TO_USDC_ADDRESSES[chainId];
    const tokenMessenger = CHAIN_IDS_TO_TOKEN_MESSENGER[chainId];

    try {
      const allowance = await publicClient.readContract({
        address: usdcAddress as Hex,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [userAddress as Hex, tokenMessenger as Hex],
      });

      return allowance;
    } catch (error) {
      console.error("Error checking allowance:", error);
      return BigInt(0);
    }
  }, [getPublicClient]);

  // Approve USDC spending
  const approveUSDC = useCallback(async (
    chainId: SupportedChainId,
    amount: bigint
  ): Promise<string> => {
    if (!evmAddress) {
      throw new Error("Wallet not connected");
    }

    const usdcAddress = CHAIN_IDS_TO_USDC_ADDRESSES[chainId];
    const tokenMessenger = CHAIN_IDS_TO_TOKEN_MESSENGER[chainId];

    addLog("Approving USDC for cross-chain transfer...");

    try {
      const result = await sendEvmTransaction({
        evmAccount: evmAddress,
        network: getNetworkFromChainId(chainId),
        transaction: {
          to: usdcAddress as Hex,
          data: encodeFunctionData({
            abi: ERC20_ABI,
            functionName: "approve",
            args: [tokenMessenger as Hex, amount],
          }),
          chainId: chainId,
          type: 'eip1559' as const
        }
      });

      addLog(`Approval transaction sent: ${result.transactionHash}`, "success");
      
      // Wait for approval transaction to be confirmed
      await waitForTransactionConfirmation(result.transactionHash, chainId);
      
      addLog("USDC approval confirmed", "success");
      return result.transactionHash;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Approval failed: ${errorMsg}`);
    }
  }, [evmAddress, sendEvmTransaction, addLog, waitForTransactionConfirmation]);

  // Burn USDC on source chain
  const burnUSDC = useCallback(async (
    sourceChainId: SupportedChainId,
    destinationChainId: SupportedChainId,
    amount: bigint,
    destinationAddress: string,
    transferType: "fast" | "standard" = "standard"
  ): Promise<string> => {
    if (!evmAddress) {
      throw new Error("Wallet not connected");
    }

    const tokenMessenger = CHAIN_IDS_TO_TOKEN_MESSENGER[sourceChainId];
    const usdcAddress = CHAIN_IDS_TO_USDC_ADDRESSES[sourceChainId];
    const destinationDomain = DESTINATION_DOMAINS[destinationChainId];

    addLog("Burning USDC on source chain...");

    try {
      // Format destination address as bytes32
      const mintRecipient = `0x000000000000000000000000${destinationAddress.slice(2)}` as Hex;
      const destinationCaller = "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex;
      
      // Set fees and finality threshold based on transfer type
      const maxFee = amount / BigInt(1000); // 0.1% fee
      const minFinalityThreshold = transferType === "fast" ? 1000 : 2000;

      const result = await sendEvmTransaction({
        evmAccount: evmAddress,
        network: getNetworkFromChainId(sourceChainId),
        transaction: {
          to: tokenMessenger as Hex,
          data: encodeFunctionData({
            abi: TOKEN_MESSENGER_ABI,
            functionName: "depositForBurn",
            args: [
              amount,
              destinationDomain,
              mintRecipient,
              usdcAddress as Hex,
              destinationCaller,
              maxFee,
              minFinalityThreshold,
            ],
          }),
          chainId: sourceChainId,
          type: 'eip1559' as const
        }
      });

      addLog(`Burn transaction sent: ${result.transactionHash}`, "success");
      
      // Wait for burn transaction to be confirmed
      await waitForTransactionConfirmation(result.transactionHash, sourceChainId);
      
      addLog("USDC burn confirmed on source chain", "success");
      return result.transactionHash;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Burn failed: ${errorMsg}`);
    }
  }, [evmAddress, sendEvmTransaction, addLog, waitForTransactionConfirmation]);

  // Retrieve attestation from Circle's API using CCTP V2
  const retrieveAttestation = useCallback(async (
    txHash: string,
    sourceChainId: SupportedChainId
  ): Promise<{ message: string; attestation: string }> => {
    addLog("Retrieving attestation from Circle...");

    const sourceDomain = DESTINATION_DOMAINS[sourceChainId];
    const url = `${IRIS_API_URL}/v2/messages/${sourceDomain}?transactionHash=${txHash}`;

    let attempts = 0;
    const maxAttempts = 120; // 10 minutes with 5-second intervals

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(url);
        
        if (response.data?.messages?.[0]?.status === "complete") {
          const message = response.data.messages[0];
          addLog("Attestation retrieved successfully!", "success");
          return {
            message: message.message,
            attestation: message.attestation,
          };
        }

        // Check if we have a message but it's still pending
        if (response.data?.messages?.[0]?.status === "pending_confirmations") {
          addLog(`Attestation pending block confirmations... (${attempts + 1}/${maxAttempts})`);
        } else if (response.data?.messages?.[0]) {
          addLog(`Message found, waiting for attestation... (${attempts + 1}/${maxAttempts})`);
        } else {
          addLog(`Waiting for transaction to be processed... (${attempts + 1}/${maxAttempts})`);
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            // Transaction not found yet, continue waiting
            attempts++;
            addLog(`Transaction not found yet, waiting... (${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            continue;
          } else if (error.response?.status === 429) {
            // Rate limited - wait longer
            addLog("Rate limited, waiting longer...", "warning");
            await new Promise(resolve => setTimeout(resolve, 15000));
            continue;
          }
        }
        addLog(`Error fetching attestation: ${error}`, "error");
        throw error;
      }
    }

    throw new Error("Attestation retrieval timed out after 10 minutes. This may indicate a network issue or the transaction may not have been processed correctly.");
  }, [addLog]);

  // Mint USDC on destination chain
  const mintUSDC = useCallback(async (
    destinationChainId: SupportedChainId,
    message: string,
    attestation: string
  ): Promise<string> => {
    if (!evmAddress) {
      throw new Error("Wallet not connected");
    }

    const messageTransmitter = CHAIN_IDS_TO_MESSAGE_TRANSMITTER[destinationChainId];

    addLog("Minting USDC on destination chain...");

    try {
      const result = await sendEvmTransaction({
        evmAccount: evmAddress,
        network: getNetworkFromChainId(destinationChainId),
        transaction: {
          to: messageTransmitter as Hex,
          data: encodeFunctionData({
            abi: MESSAGE_TRANSMITTER_ABI,
            functionName: "receiveMessage",
            args: [message as Hex, attestation as Hex],
          }),
          chainId: destinationChainId,
          type: 'eip1559' as const
        }
      });

      addLog(`Mint transaction sent: ${result.transactionHash}`, "success");
      
      // Wait for mint transaction to be confirmed
      await waitForTransactionConfirmation(result.transactionHash, destinationChainId);
      
      addLog("USDC minted successfully on destination chain!", "success");
      return result.transactionHash;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Mint failed: ${errorMsg}`);
    }
  }, [evmAddress, sendEvmTransaction, addLog, waitForTransactionConfirmation]);

  // Execute complete cross-chain transfer
  const executeTransfer = useCallback(async (
    sourceChainId: SupportedChainId,
    destinationChainId: SupportedChainId,
    amount: string,
    destinationAddress: string,
    transferType: "fast" | "standard" = "standard"
  ) => {
    if (!evmAddress) {
      throw new Error("Wallet not connected");
    }

    try {
      setStep("checking-balance");
      
      const amountBigInt = parseUnits(amount, DEFAULT_DECIMALS);

      // Check balance
      const balance = await checkBalance(sourceChainId, evmAddress);
      const balanceBigInt = parseUnits(balance, DEFAULT_DECIMALS);
      
      if (balanceBigInt < amountBigInt) {
        throw new Error(`Insufficient USDC balance. Available: ${balance}, Required: ${amount}`);
      }

      addLog(`Balance check passed: ${balance} USDC available`, "success");

      // Check allowance and approve if needed
      setStep("approving");
      const currentAllowance = await checkAllowance(sourceChainId, evmAddress);
      
      if (currentAllowance < amountBigInt) {
        await approveUSDC(sourceChainId, amountBigInt);
      } else {
        addLog("Sufficient allowance already exists", "info");
      }

      // Burn USDC
      setStep("burning");
      const burnTxHash = await burnUSDC(
        sourceChainId,
        destinationChainId,
        amountBigInt,
        destinationAddress,
        transferType
      );

      setState(prev => ({ ...prev, burnTxHash }));

      // Wait for attestation
      setStep("waiting-attestation");
      const { message, attestation } = await retrieveAttestation(burnTxHash, sourceChainId);

      // Mint USDC
      setStep("minting");
      const mintTxHash = await mintUSDC(destinationChainId, message, attestation);

      setState(prev => ({ ...prev, mintTxHash }));
      setStep("completed");
      
      addLog(`Cross-chain transfer completed successfully!`, "success");
      addLog(`Amount: ${amount} USDC`, "info");
      addLog(`From: ${chains[sourceChainId].name}`, "info");
      addLog(`To: ${chains[destinationChainId].name}`, "info");

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMsg);
    }
  }, [
    evmAddress,
    setStep,
    checkBalance,
    checkAllowance,
    approveUSDC,
    burnUSDC,
    retrieveAttestation,
    mintUSDC,
    addLog,
    setError,
  ]);

  // Reset transfer state
  const reset = useCallback(() => {
    setState({
      currentStep: "idle",
      logs: [],
      error: null,
      burnTxHash: null,
      mintTxHash: null,
    });
  }, []);

  return {
    ...state,
    executeTransfer,
    checkBalance,
    reset,
  };
}
