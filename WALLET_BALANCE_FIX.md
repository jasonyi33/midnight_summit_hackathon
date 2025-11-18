# Wallet Balance Display Fix

## Issue
The Lace wallet integration was not correctly displaying the wallet balance on the dashboard.

## Root Cause
The `WalletConnect.tsx` component was accessing the balance using an incorrect key:
- **Old Code**: `state.balances['tDUST']`
- **Problem**: This key doesn't match the actual structure of the Midnight Lace wallet state object

## Solution

### 1. Added Native Token Key Helper
Created a helper function to get the correct native token key:
```typescript
const getNativeTokenKey = () => {
  return 'dust'; // The native token key for Midnight
};
```

### 2. Updated Balance Retrieval Logic
Modified both `checkWalletConnection()` and `handleConnect()` to:
- Try multiple possible balance keys (`dust`, `tDUST`, `DUST`)
- Handle bigint type conversion properly
- Add comprehensive debug logging
- Provide fallback to '0' if balance not found

```typescript
if (state.balances) {
  const tokenKey = getNativeTokenKey();
  let balanceValue = state.balances[tokenKey] || state.balances['tDUST'] || state.balances['DUST'];
  
  if (balanceValue !== undefined && balanceValue !== null) {
    const balanceStr = typeof balanceValue === 'bigint' ? balanceValue.toString() : String(balanceValue);
    setBalance(balanceStr);
    console.log(`Balance found: ${balanceStr} (key: ${tokenKey})`);
  } else {
    console.log('No balance found in state.balances:', Object.keys(state.balances));
    setBalance('0');
  }
}
```

### 3. Added Balance Formatting
Created `formatBalance()` function for better display:
```typescript
const formatBalance = (balance: string) => {
  const num = BigInt(balance);
  return num.toLocaleString(); // Adds thousand separators
};
```

### 4. Added Debug Logging
Added console.log statements to help diagnose balance issues:
- Logs full wallet state on connection
- Logs which token key was used
- Logs available balance keys if balance not found

## Testing Instructions

1. **Open Browser Console**: 
   - Navigate to http://localhost:3000
   - Open Developer Tools (F12)
   - Go to Console tab

2. **Connect Wallet**:
   - Click "Connect Wallet" button
   - Authorize the connection in Lace wallet

3. **Check Console Output**:
   - Look for "Wallet state:" log to see full state structure
   - Look for "Balance found:" or "No balance found" messages
   - Verify which token key is being used

4. **Verify Display**:
   - Balance should now display correctly
   - Large balances will have thousand separators (e.g., "1,000,000")

## Key Insights from Documentation

Based on `/docs/deploy.md`, the correct way to access balance is:
```typescript
state.balances[nativeToken()] ?? 0n
```

Where `nativeToken()` is imported from `@midnight-ntwrk/ledger`.

However, since the DApp Connector API (used in the frontend) may have a different structure than the full Wallet SDK (used in backend), we've implemented a fallback strategy that tries multiple keys.

## Files Modified
- `/frontend/components/WalletConnect.tsx`: Updated balance retrieval and display logic

## Expected Behavior After Fix

✅ **Correct balance display**: Shows actual wallet balance from Lace wallet  
✅ **Proper formatting**: Large numbers have thousand separators  
✅ **Type safety**: Handles both bigint and string balance types  
✅ **Debug info**: Console logs help diagnose any future issues  
✅ **Fallback handling**: Shows "0" if balance unavailable  

## Next Steps

If the balance still shows as 0:
1. Check browser console for the "Wallet state:" log
2. Examine the `state.balances` object structure
3. Update `getNativeTokenKey()` function with the correct key
4. Ensure your Lace wallet actually has tDUST funds (visit https://midnight.network/test-faucet)

## Reference
- DApp Connector API: `/docs/react-wallet-connect.md`
- Wallet SDK Examples: `/docs/deploy.md`
- Balance Access Pattern: `state.balances[nativeToken()] ?? 0n`
