'use client';

import { useState, useEffect } from 'react';

interface WalletConnectProps {
  onWalletChange?: (address: string | null) => void;
}

// Demo mode configuration
const DEMO_MODE = true;
const DEMO_ADDRESS = 'mn_shield-addr_test1qqxyz789abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567';
const DEMO_BALANCE = '2000'; // 50 million tDUST

export default function WalletConnect({ onWalletChange }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(DEMO_MODE);
  const [walletAddress, setWalletAddress] = useState<string | null>(DEMO_MODE ? DEMO_ADDRESS : null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState<string>(DEMO_MODE ? DEMO_BALANCE : '0');
  const [error, setError] = useState<string | null>(null);

  // Auto-connect in demo mode
  useEffect(() => {
    if (DEMO_MODE && onWalletChange) {
      onWalletChange(DEMO_ADDRESS);
    }
  }, [onWalletChange]);

  const handleConnect = async () => {
    // In demo mode, just simulate connection
    if (DEMO_MODE) {
      setIsConnecting(true);
      setTimeout(() => {
        setIsConnected(true);
        setWalletAddress(DEMO_ADDRESS);
        setBalance(DEMO_BALANCE);
        if (onWalletChange) {
          onWalletChange(DEMO_ADDRESS);
        }
        setIsConnecting(false);
      }, 500);
      return;
    }
  };

  const handleDisconnect = () => {
    if (DEMO_MODE) return; // Don't allow disconnect in demo mode
    
    setWalletAddress(null);
    setIsConnected(false);
    setBalance('0');
    setError(null);
    if (onWalletChange) {
      onWalletChange(null);
    }
  };

  const formatAddress = (address: string) => {
    if (address.length < 20) return address;
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  const formatBalance = (balance: string) => {
    // If balance is very large, format with separators for readability
    const num = BigInt(balance);
    return num.toLocaleString();
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <p className="text-sm font-semibold text-slate-700">
            {isConnected ? 'Wallet connected' : 'Awaiting wallet'}
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Midnight Testnet
        </span>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="text-sm text-rose-700 whitespace-pre-line">{error}</p>
        </div>
      )}

      {isConnected && walletAddress ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Wallet Address</p>
            <p className="text-sm font-mono text-slate-900 bg-slate-50 p-2 rounded-lg border border-slate-200" title={walletAddress}>
              {formatAddress(walletAddress)}
            </p>
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-semibold text-slate-900">
              {formatBalance(balance)}
            </p>
            <span className="text-sm text-slate-500">tDUST</span>
          </div>
          <p className="text-xs text-slate-500">Balance refreshed when proofs are submitted.</p>

          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Connect your Midnight Lace wallet to sign supplier, buyer, or regulator actions in the same environment.
          </p>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={`w-full px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              isConnecting
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isConnecting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting
              </span>
            ) : (
              'Connect Wallet'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
