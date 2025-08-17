'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useIsSignedIn, useEvmAddress } from '@coinbase/cdp-hooks';

interface ServerWalletBalance {
  eth: string;
  usdc: string;
  address: string;
}

interface ServerWallet {
  address: string;
  name: string;
  isNew: boolean;
  balance: ServerWalletBalance;
}

interface ServerWalletContextType {
  serverWallet: ServerWallet | null;
  loading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
  createOrGetWallet: () => Promise<void>;
  isCreating: boolean;
}

const ServerWalletContext = createContext<ServerWalletContextType | null>(null);

export function ServerWalletProvider({ children }: { children: ReactNode }) {
  const isSignedIn = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  
  const [serverWallet, setServerWallet] = useState<ServerWallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  useEffect(() => {
    console.log(serverWallet?.balance);
  }, [serverWallet]);
  const createOrGetWallet = async () => {
    if (!evmAddress || isCreating || serverWallet || !isSignedIn) return;

    setIsCreating(true);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/server-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getOrCreate',
          userAddress: evmAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create server wallet');
      }

      const data = await response.json();
      
      if (data.success) {
        setServerWallet(data.wallet);
        console.log('Server wallet created or retrieved:', data.wallet);
        console.log('Balance in context after setting:', data.wallet.balance);
        // If this is a new wallet, refresh balance after creation
        if (data.wallet.isNew) {
          setTimeout(async () => {
            console.log('Refreshing balance for new wallet...');
            // Call refresh balance directly with the wallet address instead of relying on state
            try {
              const response = await fetch(`/api/server-wallet?address=${data.wallet.address}`);
              
              if (!response.ok) {
                throw new Error('Failed to fetch balance');
              }

              const balanceData = await response.json();
              
              if (balanceData.success) {
                console.log('Balance refresh response for new wallet:', balanceData.balance);
                setServerWallet(prev => {
                  const updated = prev ? {
                    ...prev,
                    balance: balanceData.balance
                  } : null;
                  console.log('Updated serverWallet state after new wallet refresh:', updated);
                  return updated;
                });
              }
            } catch (err) {
              console.error('Error refreshing balance for new wallet:', err);
            }
          }, 5000);
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error creating server wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to create server wallet');
    } finally {
      setLoading(false);
      setIsCreating(false);
      setHasInitialized(true);
    }
  };

  const refreshBalance = async () => {
    if (!serverWallet?.address) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/server-wallet?address=${serverWallet.address}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Balance refresh response:', data.balance);
        setServerWallet(prev => {
          const updated = prev ? {
            ...prev,
            balance: data.balance
          } : null;
          console.log('Updated serverWallet state:', updated);
          return updated;
        });
      } else {
        throw new Error(data.error || 'Failed to fetch balance');
      }
    } catch (err) {
      console.error('Error refreshing balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh balance');
    } finally {
      setLoading(false);
    }
  };

  // Initialize wallet only once when user signs in
  useEffect(() => {
    if (isSignedIn && evmAddress && !hasInitialized && !serverWallet && !loading && !isCreating) {
      createOrGetWallet();
    } else if (!isSignedIn) {
      // Reset state when user signs out
      setServerWallet(null);
      setHasInitialized(false);
      setError(null);
    }
  }, [isSignedIn, evmAddress, hasInitialized]);

  const value: ServerWalletContextType = {
    serverWallet,
    loading,
    error,
    refreshBalance,
    createOrGetWallet,
    isCreating,
  };

  return (
    <ServerWalletContext.Provider value={value}>
      {children}
    </ServerWalletContext.Provider>
  );
}

export function useServerWalletContext(): ServerWalletContextType {
  const context = useContext(ServerWalletContext);
  if (!context) {
    throw new Error('useServerWalletContext must be used within a ServerWalletProvider');
  }
  return context;
}
