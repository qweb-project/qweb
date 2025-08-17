'use client';

import { useState } from 'react';
import { useIsSignedIn } from "@coinbase/cdp-hooks";
import { DollarSign, Loader2, Plus } from "lucide-react";
import { useServerWalletContext } from "@/context/ServerWalletContext";
import FaucetTestButton from "./FaucetTestButton";
import BalanceRefreshButton from "./BalanceRefreshButton";
import TransferModal from "./TransferModal";

export default function ServerWalletInfo() {
  const isSignedIn = useIsSignedIn();
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  const {
    serverWallet,
    loading,
    error,
    refreshBalance,
    createOrGetWallet,
    isCreating
  } = useServerWalletContext();

  if (!isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-xs text-black/70 dark:text-white/70">
        <Loader2 size={12} className="animate-spin" />
        <span>Setting up wallet...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-xs text-red-500">
        <DollarSign size={12} />
        <span>Wallet error</span>
      </div>
    );
  }

  if (!serverWallet) {
    return null;
  }

  const handleTransferComplete = () => {
    // Refresh balance after successful transfer
    refreshBalance();
    setShowTransferModal(false);
  };

  return (
    <>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md border border-green-200 dark:border-green-800">
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center justify-center w-4 h-4 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400 rounded-full transition-colors"
            title="Transfer USDC to server wallet"
          >
            <Plus size={8} className="text-white" />
          </button>
          <DollarSign size={12} className="text-green-600 dark:text-green-400" />
          <span className="text-xs font-medium text-green-700 dark:text-green-300">
            ${parseFloat(serverWallet.balance.usdc).toFixed(4)} USDC
          </span>
          {serverWallet.isNew && (
            <span className="text-xs text-green-600 dark:text-green-400">
              (New!)
            </span>
          )}
        </div>
      
      {/* Balance controls */}
      <div className="flex items-center justify-between">
        <BalanceRefreshButton 
          onRefresh={refreshBalance}
          loading={loading}
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ETH: {parseFloat(serverWallet.balance.eth).toFixed(4)}
        </span>
      </div>
      
        {/* Debug: Show faucet test button for new wallets */}
        {/* {process.env.NODE_ENV === 'development' && serverWallet.isNew && (
          <FaucetTestButton />
        )} */}
      </div>

      {/* Transfer Modal */}
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        serverWalletAddress={serverWallet.address}
        onTransferComplete={handleTransferComplete}
      />
    </>
  );
}