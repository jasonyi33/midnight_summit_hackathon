# Lace Wallet Connection Spinning/Hanging Fix

## Issue: "Connecting..." Button Keeps Spinning

### Root Cause
The Lace wallet connection hangs at the authorization step when:
1. The Lace popup is blocked or hidden
2. User doesn't see the authorization popup
3. Lace wallet is not properly configured
4. Network connectivity issues

---

## ✅ SOLUTION: Improved Connection Flow

I've updated the WalletConnect component with:

### 1. **30-Second Timeout**
- Connection now times out after 30 seconds
- Prevents infinite spinning
- Shows clear error message

### 2. **Step-by-Step Progress**
- Shows what step is happening:
  - "Checking for Lace wallet..."
  - "Waiting for authorization - Check for Lace popup!"
  - "Verifying connection..."
  - "Fetching wallet data..."

### 3. **Better Error Messages**
- Specific guidance for each error type
- Instructions on what to check
- Links to install Lace if missing

### 4. **Visual Popup Reminder**
- Blue notification box appears
- Reminds user to look for Lace popup
- Shows 💡 icon to draw attention

---

## 🔍 How to Debug Connection Issues

### Step 1: Open Browser Console
Press **F12** (or **Cmd+Option+I** on Mac) and watch for logs:

```
Step 1: Checking for Lace wallet...
✓ Lace wallet found
Step 2: Requesting authorization (check for Lace popup)...
```

If it stops at Step 2, **look for the Lace popup!**

### Step 2: Find the Lace Popup

The popup might be:
- **Hidden behind browser window** - Check taskbar/dock
- **In another desktop/space** - Check all virtual desktops
- **Blocked by popup blocker** - Check browser address bar for blocked popup icon
- **Minimized** - Look in browser tabs/windows

### Step 3: Check Lace Configuration

If popup appears but connection fails:

1. **Open Lace Extension**
   - Click Lace icon in browser toolbar
   - Go to Settings → Network

2. **Verify Configuration**:
   ```
   Network: Testnet (or Undeployed)
   Node: https://rpc.testnet-02.midnight.network
   Indexer: https://indexer.testnet-02.midnight.network/api/v1/graphql
   Proof Server: http://127.0.0.1:6300
   ```

3. **Verify Proof Server**:
   ```bash
   curl http://127.0.0.1:6300/health
   # Should return: We're alive 🎉!
   ```

### Step 4: Check Lace Wallet Status

In Lace extension:
- Wallet must be created and unlocked
- Must have recovery phrase set up
- Should show "Midnight Testnet" or configured network

---

## 🚀 Quick Fixes

### Fix 1: Popup Not Appearing

```bash
# 1. Disable popup blocker for localhost
# In browser settings → Privacy → Popups
# Add exception for http://localhost:3000

# 2. Pin Lace to toolbar
# Extensions → Lace → Pin to toolbar
```

### Fix 2: Connection Timeout

If you see timeout error:
1. **Try again** - Click "Connect Wallet" again
2. **Be ready** - Watch for popup immediately
3. **Approve quickly** - Click "Approve" when popup appears

### Fix 3: Proof Server Not Running

```bash
# Start proof server:
docker run -p 6300:6300 midnightnetwork/proof-server -- 'midnight-proof-server --network testnet'

# Verify it's running:
curl http://127.0.0.1:6300/health
# Should return: We're alive 🎉!
```

### Fix 4: Lace Not Configured

```bash
# 1. Open Lace extension
# 2. Settings → Network
# 3. Configure for Midnight Testnet:
#    - Node: https://rpc.testnet-02.midnight.network
#    - Indexer: https://indexer.testnet-02.midnight.network/api/v1/graphql
#    - Proof Server: http://127.0.0.1:6300
# 4. Try connecting again
```

---

## 📊 Connection Flow Diagram

```
User clicks "Connect Wallet"
         ↓
[Step 1] Check if Lace installed
         ↓
[Step 2] Call enable() → Lace popup appears
         ↓
User must approve in popup ← **MOST COMMON HANG POINT**
         ↓
[Step 3] Verify connection
         ↓
[Step 4] Fetch wallet state & balance
         ↓
✓ Connected!
```

**90% of issues happen at Step 2** - User doesn't see/approve the popup

---

## 🎯 Testing the Fix

### Test 1: Normal Connection
1. Open http://localhost:3000
2. Open browser console (F12)
3. Click "Connect Wallet"
4. Watch for blue "Waiting for authorization" message
5. Look for Lace popup (might be hidden!)
6. Approve in popup
7. Should connect within 5 seconds

### Test 2: Timeout Handling
1. Click "Connect Wallet"
2. When popup appears, **don't approve** (ignore it)
3. Wait 30 seconds
4. Should show timeout error with instructions
5. Error message should say: "Connection timed out. Please check..."

### Test 3: Missing Lace
1. Disable Lace extension temporarily
2. Click "Connect Wallet"
3. Should immediately show: "Lace wallet not found"
4. Should show link to install

### Test 4: Proof Server Check
```bash
# Stop proof server:
docker stop $(docker ps -q --filter ancestor=midnightnetwork/proof-server)

# Try connecting
# Should timeout after 30 seconds

# Restart proof server:
docker run -p 6300:6300 midnightnetwork/proof-server -- 'midnight-proof-server --network testnet'
```

---

## 🔧 Console Commands for Debugging

### Check Lace Availability
```javascript
// In browser console:
console.log('Lace installed:', !!window.midnight?.mnLace);
console.log('Enable method:', typeof window.midnight?.mnLace?.enable);
console.log('IsEnabled method:', typeof window.midnight?.mnLace?.isEnabled);
```

### Manual Connection Test
```javascript
// Try manual connection in console:
(async () => {
  console.log('1. Enabling...');
  const api = await window.midnight.mnLace.enable();
  console.log('2. API:', api);
  
  const enabled = await window.midnight.mnLace.isEnabled();
  console.log('3. Enabled:', enabled);
  
  const state = await api.state();
  console.log('4. State:', state);
})();
```

### Check Popup Blockers
```javascript
// Check if popups are allowed:
console.log('Popup permission:', Notification.permission);
```

---

## 🎓 What Changed in the Code

### Before (Infinite Spinning):
```typescript
const connectorAPI = await window.midnight.mnLace.enable();
// ↑ This would hang forever if popup was ignored
```

### After (30s Timeout):
```typescript
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Connection timeout...')), 30000);
});

const enablePromise = window.midnight.mnLace.enable();
const connectorAPI = await Promise.race([enablePromise, timeoutPromise]);
// ↑ Now times out after 30 seconds with helpful error
```

### Additional Improvements:
- ✅ Step-by-step progress messages
- ✅ Visual popup reminder (blue box)
- ✅ Detailed console logging
- ✅ User-friendly error messages
- ✅ Specific troubleshooting guidance

---

## 📝 Summary

**Problem**: Connection hung forever waiting for user to approve Lace popup  
**Root Cause**: No timeout, no user guidance about popup  
**Solution**: 30s timeout + progress messages + popup reminder  

**Now when connecting**:
1. Shows "Waiting for authorization - Check for Lace popup!"
2. Blue notification reminds user to look for popup
3. Times out after 30s with helpful error if not approved
4. Console logs every step for debugging

---

## 🆘 Still Having Issues?

### Common Issues Checklist:
- [ ] Proof server running on port 6300
- [ ] Lace extension installed and enabled
- [ ] Lace configured for Midnight Testnet
- [ ] Popup blocker disabled for localhost
- [ ] Wallet unlocked in Lace
- [ ] Browser console shows no errors

### If Still Stuck:
1. Check browser console for errors
2. Try in incognito mode (enable extensions)
3. Try different browser (Chrome recommended)
4. Restart Lace extension
5. Clear browser cache and reload

---

**Last Updated**: November 18, 2025  
**Changes**: Added timeout, progress tracking, popup reminders
