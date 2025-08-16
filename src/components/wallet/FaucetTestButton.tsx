'use client';

import { useEvmAddress } from "@coinbase/cdp-hooks";
import { useState } from "react";
import { TestTube, Loader2 } from "lucide-react";

export default function FaucetTestButton() {
  const { evmAddress } = useEvmAddress();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testFaucet = async () => {
    if (!evmAddress) return;
    
    setTesting(true);
    setResults(null);
    
    try {
      const response = await fetch('/api/test-faucet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: evmAddress,
        }),
      });

      const data = await response.json();
      setResults(data);
      
      console.log('Faucet test results:', data);
    } catch (error) {
      console.error('Error testing faucet:', error);
      setResults({
        error: 'Failed to test faucet'
      });
    } finally {
      setTesting(false);
    }
  };

  if (!evmAddress) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-sm font-medium mb-2">Faucet Test (Debug)</h3>
      
      <button
        onClick={testFaucet}
        disabled={testing}
        className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
      >
        {testing ? <Loader2 size={14} className="animate-spin" /> : <TestTube size={14} />}
        <span>{testing ? 'Testing...' : 'Test Faucet'}</span>
      </button>
      
      {results && (
        <div className="mt-3 text-xs">
          <pre className="bg-black text-green-400 p-2 rounded overflow-auto max-h-48">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
