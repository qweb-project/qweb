'use client';

import { useIsSignedIn, useEvmAddress } from "@coinbase/cdp-hooks";
import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";
import { Wallet, Copy, Check } from "lucide-react";
import { useState } from "react";
import ServerWalletInfo from "./ServerWalletInfo";

interface WalletConnectionProps {
  showFullInterface?: boolean;
}

export default function WalletConnection({ showFullInterface = false }: WalletConnectionProps) {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const [isCopied, setIsCopied] = useState(false);

  const copyAddress = async () => {
    if (evmAddress) {
      await navigator.clipboard.writeText(evmAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2 text-black/70 dark:text-white/70">
          <Wallet size={20} />
          <span className="text-sm">Connect your wallet to start chatting</span>
        </div>
        {showFullInterface && (
          <div className="bg-light-secondary dark:bg-dark-secondary p-6 rounded-lg border border-light-200 dark:border-dark-200 max-w-md w-full">
            <h3 className="text-lg font-medium text-black dark:text-white mb-4 text-center">
              Connect Your Wallet
            </h3>
                          <p className="text-sm text-black/70 dark:text-white/70 mb-6 text-center">
                To use Qweb&apos;s advanced AI features, please connect your wallet. It&apos;s quick and secure!
              </p>
            <div className="flex justify-center">
              <AuthButton />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (showFullInterface) {
    return (
      <div className="flex items-center space-x-3 bg-light-secondary dark:bg-dark-secondary px-4 py-2 rounded-lg border border-light-200 dark:border-dark-200">
        <Wallet size={16} className="text-[#24A0ED]" />
        <button 
          onClick={copyAddress}
          className="flex items-center space-x-2 text-sm text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
        >
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
          <span>{evmAddress?.slice(0, 6)}...{evmAddress?.slice(-4)}</span>
        </button>
        <AuthButton />
      </div>
    );
  }

  return null;
}

export function WalletConnectionHeader() {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const [isCopied, setIsCopied] = useState(false);

  const copyAddress = async () => {
    if (evmAddress) {
      await navigator.clipboard.writeText(evmAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  if (!isSignedIn) {
    return (
      <div className="flex items-center space-x-2">
        <AuthButton />
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-2">
      <ServerWalletInfo />
      <div className="flex items-center space-x-1.5 bg-[#24A0ED]/10 dark:bg-[#24A0ED]/20 px-2 py-1 rounded-full border border-[#24A0ED]/20">
        <Wallet size={12} className="text-[#24A0ED]" />
        <button 
          onClick={copyAddress}
          className="flex items-center space-x-1 text-xs font-medium text-[#24A0ED] hover:text-[#1e88d4] transition-colors"
          title="Click to copy wallet address"
        >
          {isCopied ? <Check size={10} /> : <Copy size={10} />}
          <span>{evmAddress?.slice(0, 4)}...{evmAddress?.slice(-4)}</span>
        </button>
        <div className="h-3 w-px bg-[#24A0ED]/30"></div>
        <AuthButton />
      </div>
    </div>
  );
}
