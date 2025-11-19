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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm font-medium text-gray-700">
            {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>
        {isConnected && (
          <span className="text-xs text-gray-500">Testnet</span>
        )}
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
        </div>
      )}

      {isConnected && walletAddress ? (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
            <p className="text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded border border-gray-200" title={walletAddress}>
              {formatAddress(walletAddress)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Balance</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatBalance(balance)} tDUST
            </p>
          </div>

          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Connect your Midnight Lace wallet to interact with ChainVault
          </p>
          
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isConnecting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isConnecting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
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
