'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, Loader2, AlertCircle, CheckCircle, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useEvmAddress, useSendEvmTransaction } from '@coinbase/cdp-hooks';
import { parseUnits, encodeFunctionData } from 'viem';
import { useCrossChainTransfer, TransferStep } from '@/hooks/useCrossChainTransfer';
import { 
  SupportedChainId, 
  getSupportedChains, 
  CHAIN_TO_CHAIN_NAME,
  CHAIN_LOGOS,
  BLOCK_EXPLORERS,
  DEFAULT_CHAIN_ID,
  CHAIN_IDS_TO_USDC_ADDRESSES 
} from '@/lib/chains';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverWalletAddress: string;
  onTransferComplete: () => void;
}

interface ChainSelectProps {
  label: string;
  selectedChainId: SupportedChainId;
  onChainSelect: (chainId: SupportedChainId) => void;
  excludeChainId?: SupportedChainId;
}

function ChainSelect({ label, selectedChainId, onChainSelect, excludeChainId }: ChainSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const supportedChains = getSupportedChains().filter(chain => chain.id !== excludeChainId);
  const selectedChain = supportedChains.find(chain => chain.id === selectedChainId);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {selectedChain && (
            <>
              <img 
                src={selectedChain.logo} 
                alt={selectedChain.name}
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-gray-900 dark:text-white">{selectedChain.name}</span>
            </>
          )}
        </div>
        <ChevronDown size={16} className="text-gray-500" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {supportedChains.map((chain) => (
            <button
              key={chain.id}
              type="button"
              onClick={() => {
                onChainSelect(chain.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <img 
                src={chain.logo} 
                alt={chain.name}
                className="w-6 h-6 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-gray-900 dark:text-white">{chain.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TransferStepIndicator({ currentStep }: { currentStep: TransferStep }) {
  const steps = [
    { key: 'checking-balance', label: 'Checking Balance' },
    { key: 'approving', label: 'Approving' },
    { key: 'burning', label: 'Burning USDC' },
    { key: 'waiting-attestation', label: 'Waiting for Attestation' },
    { key: 'minting', label: 'Minting USDC' },
    { key: 'completed', label: 'Completed' },
  ];

  const getCurrentStepIndex = () => {
    const index = steps.findIndex(step => step.key === currentStep);
    return index >= 0 ? index : 0;
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              index < currentIndex 
                ? 'bg-green-500 text-white' 
                : index === currentIndex 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
            }`}>
              {index < currentIndex ? '✓' : index + 1}
            </div>
            <span className={`text-xs mt-1 text-center ${
              index <= currentIndex 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex mt-2">
        {steps.map((_, index) => (
          <div 
            key={index}
            className={`flex-1 h-1 ${index === 0 ? 'ml-3' : ''} ${index === steps.length - 1 ? 'mr-3' : ''} ${
              index < currentIndex ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function TransferModal({ 
  isOpen, 
  onClose, 
  serverWalletAddress, 
  onTransferComplete 
}: TransferModalProps) {
  const { evmAddress } = useEvmAddress();
  const { sendEvmTransaction } = useSendEvmTransaction();
  const crossChainTransfer = useCrossChainTransfer();
  
  const [amount, setAmount] = useState('');
  const [sourceChainId, setSourceChainId] = useState<SupportedChainId>(SupportedChainId.BASE_SEPOLIA);
  const [destinationChainId, setDestinationChainId] = useState<SupportedChainId>(SupportedChainId.BASE_SEPOLIA);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [transferType, setTransferType] = useState<'fast' | 'standard'>('standard');
  const [balance, setBalance] = useState<string>('0');
  const [isCrossChain, setIsCrossChain] = useState(false);
  const [simpleTransferState, setSimpleTransferState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState('');

  // Check if transfer is cross-chain
  useEffect(() => {
    setIsCrossChain(sourceChainId !== destinationChainId);
  }, [sourceChainId, destinationChainId]);

  // Check balance when chain or address changes
  useEffect(() => {
    if (evmAddress && isOpen) {
      crossChainTransfer.checkBalance(sourceChainId, evmAddress)
        .then(setBalance)
        .catch(console.error);
    }
  }, [sourceChainId, evmAddress, isOpen, crossChainTransfer]);

  // Set default destination address to server wallet
  useEffect(() => {
    if (serverWalletAddress && !destinationAddress) {
      setDestinationAddress(serverWalletAddress);
    }
  }, [serverWalletAddress, destinationAddress]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !destinationAddress || !evmAddress) {
      return;
    }

    // For same-chain transfers to server wallet, use simple transfer
    if (!isCrossChain && destinationAddress === serverWalletAddress) {
      return handleSimpleTransfer();
    }

    // Execute cross-chain transfer
    try {
      crossChainTransfer.reset();
      await crossChainTransfer.executeTransfer(
        sourceChainId,
        destinationChainId,
        amount,
        destinationAddress,
        transferType
      );
      
      if (crossChainTransfer.currentStep === 'completed') {
        setTimeout(() => {
          onTransferComplete();
        }, 2000);
      }
    } catch (error) {
      console.error('Cross-chain transfer failed:', error);
    }
  };

  const handleSimpleTransfer = async () => {
    try {
      setSimpleTransferState('pending');
      setError('');
      
      const parsedAmount = parseUnits(amount, 6);
      const usdcAddress = CHAIN_IDS_TO_USDC_ADDRESSES[sourceChainId];
      
      const transactionData = encodeFunctionData({
        abi: [{
          name: 'transfer',
          type: 'function',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' }
          ],
          outputs: [{ name: '', type: 'bool' }]
        }],
        functionName: 'transfer',
        args: [serverWalletAddress as `0x${string}`, parsedAmount]
      });

      const result = await sendEvmTransaction({
        evmAccount: evmAddress!,
        network: 'base-sepolia',
        transaction: {
          to: usdcAddress as `0x${string}`,
          data: transactionData,
          chainId: sourceChainId,
          type: 'eip1559' as const
        }
      });

      setTransactionHash(result.transactionHash);
      setSimpleTransferState('success');
      
      setTimeout(() => {
        onTransferComplete();
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Transfer failed');
      setSimpleTransferState('error');
    }
  };

  const handleClose = () => {
    const isTransferInProgress = isCrossChain 
      ? crossChainTransfer.currentStep !== 'idle' && crossChainTransfer.currentStep !== 'completed' && crossChainTransfer.currentStep !== 'error'
      : simpleTransferState === 'pending';
      
    if (!isTransferInProgress) {
      crossChainTransfer.reset();
      setSimpleTransferState('idle');
      setError('');
      setTransactionHash('');
      setAmount('');
      setDestinationAddress('');
      onClose();
    }
  };

  const canSubmit = amount && parseFloat(amount) > 0 && destinationAddress && evmAddress &&
    (isCrossChain ? crossChainTransfer.currentStep === 'idle' : simpleTransferState !== 'pending');

  const currentError = crossChainTransfer.error || error;
  const isCompleted = crossChainTransfer.currentStep === 'completed' || simpleTransferState === 'success';
  const isInProgress = isCrossChain 
    ? crossChainTransfer.currentStep !== 'idle' && crossChainTransfer.currentStep !== 'completed' && crossChainTransfer.currentStep !== 'error'
    : simpleTransferState === 'pending';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isCrossChain ? 'Cross-Chain USDC Transfer' : 'Transfer USDC'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isInProgress}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Indicator for Cross-Chain Transfers */}
        {isCrossChain && crossChainTransfer.currentStep !== 'idle' && (
          <TransferStepIndicator currentStep={crossChainTransfer.currentStep} />
        )}

        {/* Success State */}
        {isCompleted && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">
                {isCrossChain ? 'Cross-Chain Transfer Completed!' : 'Transfer Successful!'}
              </span>
            </div>
            {(crossChainTransfer.burnTxHash || transactionHash) && (
              <div className="mt-2 space-y-2">
                {crossChainTransfer.burnTxHash && (
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400">Burn Transaction:</p>
                    <a
                      href={`${BLOCK_EXPLORERS[sourceChainId]}/tx/${crossChainTransfer.burnTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors cursor-pointer block break-all"
                    >
                      {crossChainTransfer.burnTxHash.slice(0, 20)}... (View on {CHAIN_TO_CHAIN_NAME[sourceChainId]} Explorer)
                    </a>
                  </div>
                )}
                {crossChainTransfer.mintTxHash && (
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400">Mint Transaction:</p>
                    <a
                      href={`${BLOCK_EXPLORERS[destinationChainId]}/tx/${crossChainTransfer.mintTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors cursor-pointer block break-all"
                    >
                      {crossChainTransfer.mintTxHash.slice(0, 20)}... (View on {CHAIN_TO_CHAIN_NAME[destinationChainId]} Explorer)
                    </a>
                  </div>
                )}
                {transactionHash && !crossChainTransfer.burnTxHash && (
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400">Transaction Hash:</p>
                    <a
                      href={`${BLOCK_EXPLORERS[sourceChainId]}/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors cursor-pointer block break-all"
                    >
                      {transactionHash.slice(0, 20)}... (View on Explorer)
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {currentError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <AlertCircle size={16} />
              <span className="text-sm font-medium">Transfer Failed</span>
            </div>
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{currentError}</p>
          </div>
        )}

        {/* Transfer Logs for Cross-Chain */}
        {isCrossChain && crossChainTransfer.logs.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-600 max-h-32 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transfer Progress</h4>
            <div className="space-y-1">
              {crossChainTransfer.logs.map((log, index) => (
                <div key={index} className="text-xs flex items-center space-x-2">
                  <span className="text-gray-500 dark:text-gray-400">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className={`${
                    log.type === 'success' ? 'text-green-600 dark:text-green-400' :
                    log.type === 'error' ? 'text-red-600 dark:text-red-400' :
                    log.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chain Selection */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChainSelect
                label="From Chain"
                selectedChainId={sourceChainId}
                onChainSelect={setSourceChainId}
              />
              
              <ChainSelect
                label="To Chain"
                selectedChainId={destinationChainId}
                onChainSelect={setDestinationChainId}
              />
            </div>
            
            {/* Swap Button - Positioned between the two dropdowns */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
              <button
                type="button"
                onClick={() => {
                  const temp = sourceChainId;
                  setSourceChainId(destinationChainId);
                  setDestinationChainId(temp);
                }}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full p-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-md"
                disabled={isInProgress}
                title="Swap chains"
              >
                <ArrowUpDown size={16} className="text-gray-500" />
              </button>
            </div>
            
            {/* Mobile Swap Button */}
            <div className="flex justify-center mt-2 md:hidden">
              <button
                type="button"
                onClick={() => {
                  const temp = sourceChainId;
                  setSourceChainId(destinationChainId);
                  setDestinationChainId(temp);
                }}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full p-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                disabled={isInProgress}
                title="Swap chains"
              >
                <ArrowUpDown size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Cross-Chain Transfer Type */}
          {isCrossChain && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transfer Speed
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="standard"
                    checked={transferType === 'standard'}
                    onChange={(e) => setTransferType(e.target.value as 'fast' | 'standard')}
                    disabled={isInProgress}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Standard (~5-10 min)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="fast"
                    checked={transferType === 'fast'}
                    onChange={(e) => setTransferType(e.target.value as 'fast' | 'standard')}
                    disabled={isInProgress}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Fast (~2-5 min)</span>
                </label>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (USDC)
            </label>
            <div className="relative">
              <input
                id="amount"
                type="number"
                step="0.000001"
                min="0"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isInProgress}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
              <div className="absolute right-3 top-2 text-sm text-gray-500 dark:text-gray-400">
                Balance: {balance}
              </div>
            </div>
          </div>

          {/* Destination Server Wallet */}
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Destination Server Wallet
            </label>
            <input
              id="destination"
              type="text"
              placeholder="0x..."
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              disabled={isInProgress}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            />
            {destinationAddress === serverWalletAddress && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                ✓ Transferring to server wallet
              </p>
            )}
          </div>

          {/* Wallet Connection Info */}
          {isCrossChain && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Using Connected Wallet</span>
              </div>
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                Cross-chain transfer will use your connected wallet for signing transactions on both chains.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isInProgress}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isInProgress && <Loader2 size={16} className="animate-spin" />}
              <span>
                {isInProgress ? (
                  isCrossChain ? 
                    crossChainTransfer.currentStep.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) + '...' :
                    'Transferring...'
                ) : (
                  isCrossChain ? 'Start Cross-Chain Transfer' : 'Transfer'
                )}
              </span>
            </button>
          </div>
        </form>

        {/* Quick Amount Buttons */}
        {!isInProgress && !isCompleted && (
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
