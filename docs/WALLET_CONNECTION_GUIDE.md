# Lace Wallet Connection Troubleshooting Guide

## Issue: "Wallet Not Connected"

### Prerequisites Checklist

Before troubleshooting, ensure you have:

1. ✅ **Lace Wallet Extension Installed**
   - Visit: https://chromewebstore.google.com/detail/lace-beta/hgeekaiplokcnmakghbdfbgnlfheichg
   - Install in Chrome, Brave, or Edge browser
   - Pin to toolbar for easy access

2. ✅ **Lace Wallet Configured for Midnight**
   - Open Lace wallet extension
   - Go through initial setup
   - **IMPORTANT**: Configure for Midnight Testnet:
     - Network: Select "Testnet" or "Undeployed"
     - Indexer: `https://indexer.testnet-02.midnight.network/api/v1/graphql`
     - Node: `https://rpc.testnet-02.midnight.network`
     - Proof Server: `http://127.0.0.1:6300`

3. ✅ **Proof Server Running**
   ```bash
   # The proof server MUST be running locally
   # Check if it's running:
   curl http://127.0.0.1:6300/health
   
   # If not running, start it:
   # See docs/run-proof-server.md
   ```

4. ✅ **Wallet Has Test Funds**
   - Get tDUST from: https://faucet.midnight.network
   - Copy your wallet address from Lace
   - Request testnet tokens
   - Wait for confirmation (~30 seconds)

5. ✅ **Both Servers Running**
   - Backend: http://localhost:3001
   - Frontend: http://localhost:3000

## Step-by-Step Connection Guide

### Step 1: Open Frontend
Navigate to: http://localhost:3000

### Step 2: Open Browser Developer Tools
- Press **F12** or **Cmd+Option+I** (Mac)
- Go to **Console** tab
- Keep this open to see connection logs

### Step 3: Check for Lace Wallet
In the Console, type:
```javascript
window.midnight
```

**Expected Result**: Should show an object with `mnLace` property
```javascript
{
  mnLace: {
    enable: ƒ,
    isEnabled: ƒ
  }
}
```

**If undefined**: Lace wallet is not installed or not loaded
- Install Lace wallet extension
- Refresh the page
- Check that extension is enabled in browser

### Step 4: Click "Connect Wallet" Button
The button is in the sidebar on the left side of the dashboard.

### Step 5: Authorize in Lace Popup
1. Lace wallet popup should appear
2. Review the connection request from "localhost"
3. Click **"Approve"** or **"Connect"**
4. Wait for confirmation

### Step 6: Check Connection Status
After authorization, you should see:
- Green dot indicator showing "Connected"
- Your wallet address displayed
- Your balance in tDUST

## Troubleshooting Specific Issues

### Issue: No Lace Popup Appears

**Possible Causes**:
1. Popup blocker is active
2. Extension not responding
3. Browser not focused

**Solutions**:
```
1. Check popup blocker settings
2. Click the Lace icon in browser toolbar manually
3. Restart browser
4. Check Console for errors
```

### Issue: "Midnight Lace wallet not detected"

**Check Console Logs**:
```javascript
// In browser console, check:
console.log(window.midnight?.mnLace);
```

**If undefined**:
1. Verify Lace extension is installed and enabled
2. Refresh the page (Cmd+R / Ctrl+R)
3. Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
4. Restart browser

**If still undefined**:
- The extension might not be injecting the API
- Try in Incognito/Private mode (allow extensions in incognito)
- Check extension permissions

### Issue: Connection Authorized but Shows "Not Connected"

**Debug Steps**:

1. **Check Console for Errors**:
   Look for messages like:
   ```
   Error connecting to wallet: [error details]
   ```

2. **Verify State Object**:
   You should see in console:
   ```
   Wallet state: { address: "mn_shield-addr_test...", balances: {...} }
   ```

3. **Check Balance Keys**:
   The console should show:
   ```
   Balance found: 1000000 (key: dust)
   ```
   OR
   ```
   No balance found in state.balances: ["key1", "key2"]
   ```

   If you see "No balance found", note which keys are available and let me know.

### Issue: Balance Shows as "0 tDUST"

**Possible Causes**:
1. Wallet actually has 0 balance (need to fund from faucet)
2. Balance key mismatch (we're looking for wrong key)
3. Wallet still syncing

**Debug Steps**:

1. **Check Lace Wallet Directly**:
   - Open Lace extension
   - View your balance there
   - Should show tDUST amount

2. **Check Console Logs**:
   ```
   Wallet state: { address: "...", balances: { ... } }
   ```
   Note what's in the `balances` object

3. **Fund Wallet**:
   - Visit: https://faucet.midnight.network
   - Paste your wallet address
   - Request testnet tDUST
   - Wait ~30-60 seconds
   - Refresh frontend page
   - Reconnect wallet

### Issue: Wallet Disconnects Immediately

**Possible Causes**:
1. Network configuration mismatch
2. Proof server not running
3. Browser compatibility issue

**Solutions**:

1. **Verify Proof Server**:
   ```bash
   curl http://127.0.0.1:6300/health
   ```
   Should return 200 OK

2. **Check Lace Network Config**:
   - Open Lace extension
   - Go to Settings → Network
   - Verify testnet configuration matches:
     ```
     Network: Testnet
     Node: https://rpc.testnet-02.midnight.network
     Indexer: https://indexer.testnet-02.midnight.network/api/v1/graphql
     Proof Server: http://127.0.0.1:6300
     ```

3. **Try Different Browser**:
   - Chrome (best support)
   - Brave (disable shields)
   - Edge

## Testing the Fix

### Quick Connection Test

After troubleshooting, test with this console command:

```javascript
// In browser console:
(async () => {
  try {
    console.log('1. Checking for Midnight API...');
    if (!window.midnight?.mnLace) {
      console.error('❌ window.midnight.mnLace not found');
      return;
    }
    console.log('✅ Midnight API found');
    
    console.log('2. Enabling wallet...');
    const api = await window.midnight.mnLace.enable();
    console.log('✅ Wallet enabled');
    
    console.log('3. Getting state...');
    const state = await api.state();
    console.log('✅ State:', state);
    
    console.log('4. Address:', state.address);
    console.log('5. Balances:', state.balances);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
```

**Expected Output**:
```
✅ Midnight API found
✅ Wallet enabled
✅ State: { address: "...", balances: {...}, ... }
Address: mn_shield-addr_test...
Balances: { dust: 1000000n }
```

## Advanced Debugging

### View Full Wallet State

```javascript
// Get detailed wallet information
window.midnight.mnLace.enable().then(api => {
  api.state().then(state => {
    console.log('Full State:', JSON.stringify(state, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value, 2
    ));
  });
});
```

### Check if Already Connected

```javascript
// Check if wallet was previously authorized
window.midnight.mnLace.isEnabled().then(enabled => {
  console.log('Wallet already enabled:', enabled);
});
```

### Force Reconnection

If you need to reset the connection:

1. **Revoke Authorization in Lace**:
   - Open Lace extension
   - Go to Settings → Connected Sites
   - Remove "localhost"
   - Try connecting again

2. **Clear Browser Cache**:
   - Open DevTools (F12)
   - Right-click refresh button
   - Select "Empty Cache and Hard Reload"

## Common Error Messages

### "Failed to connect to wallet"
- **Cause**: User declined authorization or Lace not responding
- **Solution**: Try again, ensure you click "Approve" in Lace popup

### "Proof server not reachable"
- **Cause**: Local proof server not running
- **Solution**: Start proof server on port 6300

### "Network mismatch"
- **Cause**: Lace configured for different network
- **Solution**: Reconfigure Lace for Midnight testnet-02

### "Insufficient balance"
- **Cause**: Wallet has no tDUST
- **Solution**: Fund wallet from faucet

## Need More Help?

If the wallet still won't connect after these steps:

1. **Share Console Output**: 
   - Copy any error messages from browser console
   - Run the "Quick Connection Test" script above
   - Share the output

2. **Check Lace Version**:
   - Open Lace extension
   - Go to Settings → About
   - Note the version number

3. **Verify Configuration**:
   ```javascript
   // In console, show configuration:
   console.log({
     midnight: typeof window.midnight,
     mnLace: typeof window.midnight?.mnLace,
     enable: typeof window.midnight?.mnLace?.enable,
     isEnabled: typeof window.midnight?.mnLace?.isEnabled
   });
   ```

4. **Check Docs**: See `/docs/lace-wallet.md` and `/docs/react-wallet-connect.md`

---

## Quick Reference

**Lace Extension**: https://chromewebstore.google.com/detail/lace-beta/hgeekaiplokcnmakghbdfbgnlfheichg  
**Testnet Faucet**: https://faucet.midnight.network  
**Frontend**: http://localhost:3000  
**Backend**: http://localhost:3001  
**Proof Server**: http://127.0.0.1:6300  

---

**Last Updated**: November 18, 2025
