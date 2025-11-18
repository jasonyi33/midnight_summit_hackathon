'use client';

import { useState, useEffect } from 'react';

interface WalletConnectProps {
  onWalletChange?: (address: string | null) => void;
}

interface MidnightAPI {
  mnLace: {
    enable: () => Promise<any>;
    isEnabled: () => Promise<boolean>;
  };
}

declare global {
  interface Window {
    midnight?: MidnightAPI;
  }
}

// Helper function to get native token key
// This matches the pattern from @midnight-ntwrk/ledger's nativeToken()
const getNativeTokenKey = () => {
  return 'dust'; // The native token key for Midnight
}

export default function WalletConnect({ onWalletChange }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);
  const [connectionStep, setConnectionStep] = useState<string>('');

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.midnight?.mnLace) {
        const isEnabled = await window.midnight.mnLace.isEnabled();
        if (isEnabled) {
          const connectorAPI = await window.midnight.mnLace.enable();
          const state = await connectorAPI.state();
          
          console.log('Wallet state:', state); // Debug log to see full state structure
          
          setWalletAddress(state.address);
          setIsConnected(true);
          if (onWalletChange) {
            onWalletChange(state.address);
          }
          
          // Get balance - try multiple possible keys
          if (state.balances) {
            const tokenKey = getNativeTokenKey();
            let balanceValue = state.balances[tokenKey] || state.balances['tDUST'] || state.balances['DUST'];
            
            // Handle bigint conversion
            if (balanceValue !== undefined && balanceValue !== null) {
              // Convert bigint to string if needed
              const balanceStr = typeof balanceValue === 'bigint' ? balanceValue.toString() : String(balanceValue);
              setBalance(balanceStr);
              console.log(`Balance found: ${balanceStr} (key: ${tokenKey})`);
            } else {
              console.log('No balance found in state.balances:', Object.keys(state.balances));
              setBalance('0');
            }
          } else {
            console.log('No balances object in state');
            setBalance('0');
          }
        }
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    setConnectionStep('Initializing...');

    try {
      // Check if Midnight Lace wallet is installed
      console.log('Step 1: Checking for Lace wallet...');
      setConnectionStep('Checking for Lace wallet...');
      
      if (typeof window === 'undefined' || !window.midnight?.mnLace) {
        throw new Error('Midnight Lace wallet not detected. Please install the Lace wallet extension.');
      }
      
      console.log('✓ Lace wallet found');

      // Request wallet authorization with timeout
      console.log('Step 2: Requesting authorization (check for Lace popup)...');
      setConnectionStep('Waiting for authorization - Check for Lace popup!');
      
      // Add timeout to detect if user isn't responding to popup
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout. Please check if a Lace popup appeared and authorize the connection.')), 30000);
      });
      
      const enablePromise = window.midnight.mnLace.enable();
      
      const connectorAPI = await Promise.race([enablePromise, timeoutPromise]) as any;
      console.log('✓ Authorization granted');

      // Verify connection
      console.log('Step 3: Verifying connection...');
      setConnectionStep('Verifying connection...');
      
      const isEnabled = await window.midnight.mnLace.isEnabled();
      
      if (!isEnabled) {
        throw new Error('Failed to connect to wallet. Please try again.');
      }
      
      console.log('✓ Connection verified');

      // Get wallet state
      console.log('Step 4: Fetching wallet state...');
      setConnectionStep('Fetching wallet data...');
      
      const state = await connectorAPI.state();
        
      console.log('✓ Wallet state received:', state);
        
      setWalletAddress(state.address);
      setIsConnected(true);
        
      if (onWalletChange) {
        onWalletChange(state.address);
      }

      // Get balance - try multiple possible keys
      if (state.balances) {
        const tokenKey = getNativeTokenKey();
        let balanceValue = state.balances[tokenKey] || state.balances['tDUST'] || state.balances['DUST'];
          
        // Handle bigint conversion
        if (balanceValue !== undefined && balanceValue !== null) {
          // Convert bigint to string if needed
          const balanceStr = typeof balanceValue === 'bigint' ? balanceValue.toString() : String(balanceValue);
          setBalance(balanceStr);
          console.log(`✓ Balance found: ${balanceStr} (key: ${tokenKey})`);
        } else {
          console.log('⚠ No balance found in state.balances:', Object.keys(state.balances));
          setBalance('0');
        }
      } else {
        console.log('⚠ No balances object in state');
        setBalance('0');
      }

      console.log('✓ Connected successfully to:', state.address);
      setConnectionStep('');
      
    } catch (err: any) {
      console.error('❌ Error connecting to wallet:', err);
      
      // Provide user-friendly error messages
      let errorMessage = err.message || 'Failed to connect to wallet';
      
      if (err.message?.includes('timeout')) {
        errorMessage = 'Connection timed out. Please check:\n1. A Lace popup may have appeared - approve it\n2. Lace is configured for Midnight Testnet\n3. Proof server is running (port 6300)';
      } else if (err.message?.includes('not detected')) {
        errorMessage = 'Lace wallet not found. Install from: https://chromewebstore.google.com/detail/lace-beta/hgeekaiplokcnmakghbdfbgnlfheichg';
      } else if (err.message?.includes('User rejected')) {
        errorMessage = 'Connection rejected. Please approve the connection request in Lace.';
      }
      
      setError(errorMessage);
      setConnectionStep('');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
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

      {connectionStep && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700 font-medium">{connectionStep}</p>
          {connectionStep.includes('popup') && (
            <p className="text-xs text-blue-600 mt-1">
              💡 Look for a Lace authorization popup window
            </p>
          )}
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

          <p className="text-xs text-gray-500 text-center">
            Make sure you have the{' '}
            <a 
              href="https://chromewebstore.google.com/detail/lace-beta/hgeekaiplokcnmakghbdfbgnlfheichg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 underline"
            >
              Lace wallet
            </a>
            {' '}installed
          </p>
        </div>
      )}
    </div>
  );
}
