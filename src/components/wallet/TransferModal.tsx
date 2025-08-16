'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useEvmAddress, useSendEvmTransaction } from '@coinbase/cdp-hooks';
import { parseUnits, encodeFunctionData } from 'viem';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverWalletAddress: string;
  onTransferComplete: () => void;
}

type TransactionState = 'idle' | 'pending' | 'success' | 'error';

// USDC Contract Address will be fetched dynamically from Coinbase API
let USDC_CONTRACT_ADDRESS: string | null = null;

// ERC-20 Transfer Function ABI
const ERC20_TRANSFER_ABI = {
  name: 'transfer',
  type: 'function',
  inputs: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' }
  ],
  outputs: [{ name: '', type: 'bool' }]
} as const;

/**
 * Fetch USDC contract address dynamically from Coinbase Token Balance API
 */
async function fetchUSDCContractAddress(userAddress: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/usdc-contract-address?address=${userAddress}`);
    const data = await response.json();
    
    if (data.success && data.contractAddress) {
      return data.contractAddress;
    }
    
    console.warn('Could not fetch USDC contract address from API, using fallback');
    return '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Fallback
  } catch (error) {
    console.error('Error fetching USDC contract address:', error);
    return '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Fallback
  }
}

export default function TransferModal({ 
  isOpen, 
  onClose, 
  serverWalletAddress, 
  onTransferComplete 
}: TransferModalProps) {
  const { evmAddress } = useEvmAddress();
  const { sendEvmTransaction } = useSendEvmTransaction();
  const [amount, setAmount] = useState('');
  const [transactionState, setTransactionState] = useState<TransactionState>('idle');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [usdcContractAddress, setUsdcContractAddress] = useState<string | null>(null);

  // Fetch USDC contract address when modal opens
  useEffect(() => {
    if (isOpen && evmAddress && !usdcContractAddress) {
      fetchUSDCContractAddress(evmAddress).then(setUsdcContractAddress);
    }
  }, [isOpen, evmAddress, usdcContractAddress]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !evmAddress || !usdcContractAddress) {
      if (!usdcContractAddress) {
        setError('USDC contract address not loaded. Please try again.');
      }
      return;
    }

    setTransactionState('pending');
    setError('');
    setTransactionHash('');

    try {
      // Convert amount to USDC units (6 decimals)
      const amountInWei = parseUnits(amount, 6);
      
      // Encode the transfer function call
      const data = encodeFunctionData({
        abi: [ERC20_TRANSFER_ABI],
        functionName: 'transfer',
        args: [serverWalletAddress as `0x${string}`, amountInWei]
      });

      console.log('Initiating USDC transfer:', {
        from: evmAddress,
        to: serverWalletAddress,
        amount: amount,
        amountInWei: amountInWei.toString(),
        usdcContract: usdcContractAddress
      });

      // Send the transaction using the embedded wallet
      const result = await sendEvmTransaction({
        evmAccount: evmAddress,
        network: 'base-sepolia',
        transaction: {
          to: usdcContractAddress as `0x${string}`,
          data: data,
          chainId: 84532, // Base Sepolia chain ID
          type: 'eip1559' as const
        }
      });

      console.log('Transaction sent:', result);
      
      setTransactionHash(result.transactionHash);
      setTransactionState('success');
      setAmount('');
      
      // Delay to allow blockchain to update before refreshing balance
      setTimeout(() => {
        onTransferComplete();
      }, 2000);

    } catch (err: any) {
      console.error('Transfer error:', err);
      setError(err.message || 'Transfer failed');
      setTransactionState('error');
    }
  };

  const handleClose = () => {
    if (transactionState !== 'pending') {
      setTransactionState('idle');
      setError('');
      setTransactionHash('');
      setAmount('');
      onClose();
    }
  };

  const canSubmit = amount && parseFloat(amount) > 0 && transactionState !== 'pending' && usdcContractAddress;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transfer USDC
          </h2>
          <button
            onClick={handleClose}
            disabled={transactionState === 'pending'}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Transaction States */}
        {transactionState === 'success' && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Transfer Successful!</span>
            </div>
            {transactionHash && (
              <div className="mt-2">
                <p className="text-xs text-green-600 dark:text-green-400">
                  Transaction Hash:
                </p>
                <a
                  href={`https://sepolia.basescan.org/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors cursor-pointer block"
                >
                  {transactionHash.slice(0, 20)}... (View on Explorer)
                </a>
              </div>
            )}
          </div>
        )}

        {transactionState === 'error' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <AlertCircle size={16} />
              <span className="text-sm font-medium">Transfer Failed</span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {error}
            </p>
          </div>
        )}

        {/* Transfer Info */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">From:</span>
            <span className="font-mono text-xs">
              {evmAddress?.slice(0, 6)}...{evmAddress?.slice(-4)}
            </span>
          </div>
          
          <div className="flex items-center justify-center">
            <ArrowRight size={16} className="text-gray-400" />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">To:</span>
            <span className="font-mono text-xs">
              {serverWalletAddress.slice(0, 6)}...{serverWalletAddress.slice(-4)}
            </span>
          </div>
        </div>

        {/* Transfer Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (USDC)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={transactionState === 'pending'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={transactionState === 'pending'}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {transactionState === 'pending' && <Loader2 size={16} className="animate-spin" />}
              <span>
                {!usdcContractAddress ? 'Loading...' : 
                 transactionState === 'pending' ? 'Transferring...' : 'Transfer'}
              </span>
            </button>
          </div>
        </form>

        {/* Quick Amount Buttons */}
        {transactionState === 'idle' && (
          <div className="mt-4 flex space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 self-center">Quick:</span>
            {['1', '5', '10', '25'].map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount)}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded border text-gray-700 dark:text-gray-300 transition-colors"
              >
                ${quickAmount}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
