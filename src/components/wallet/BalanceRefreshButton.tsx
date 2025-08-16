'use client';

import { RefreshCw } from "lucide-react";

interface BalanceRefreshButtonProps {
  onRefresh: () => Promise<void>;
  loading?: boolean;
}

export default function BalanceRefreshButton({ onRefresh, loading = false }: BalanceRefreshButtonProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={loading}
      className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors disabled:opacity-50"
      title="Refresh balance"
    >
      <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
      <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
    </button>
  );
}
