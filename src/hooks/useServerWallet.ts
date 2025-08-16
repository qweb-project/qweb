'use client';

import { useState, useEffect, useCallback } from 'react';

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

interface UseServerWalletReturn {
  serverWallet: ServerWallet | null;
  loading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
  createOrGetWallet: () => Promise<void>;
  isCreating: boolean;
}

export function useServerWallet(userAddress: string | null): UseServerWalletReturn {
  const [serverWallet, setServerWallet] = useState<ServerWallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrGetWallet = useCallback(async () => {
    if (!userAddress || isCreating) return;

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
          userAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create server wallet');
      }

      const data = await response.json();
      
      if (data.success) {
        setServerWallet(data.wallet);
        console.log('Server wallet loaded:', data.wallet);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error creating server wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to create server wallet');
    } finally {
      setLoading(false);
      setIsCreating(false);
    }
  }, [userAddress, isCreating]);

  const refreshBalance = useCallback(async () => {
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
        setServerWallet(prev => prev ? {
          ...prev,
          balance: data.balance
        } : null);
        console.log('Balance refreshed:', data.balance);
      } else {
        throw new Error(data.error || 'Failed to fetch balance');
      }
    } catch (err) {
      console.error('Error refreshing balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh balance');
    } finally {
      setLoading(false);
    }
  }, [serverWallet?.address]);

  // Auto-create wallet when user address is available
  useEffect(() => {
    if (userAddress && !serverWallet && !loading && !isCreating) {
      createOrGetWallet();
    }
  }, [userAddress, serverWallet, loading, isCreating, createOrGetWallet]);

  return {
    serverWallet,
    loading,
    error,
    refreshBalance,
    createOrGetWallet,
    isCreating,
  };
}
