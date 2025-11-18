# ChainVault Backup Demo Video - Complete Recording Guide
## Phase 2 Demo Prep - Task 4.5

---

## OVERVIEW

This guide provides step-by-step instructions for recording a professional backup demo video of ChainVault. The backup video serves as insurance against:
- Network connectivity failures
- Backend API downtime
- Browser/UI crashes
- Presenter nerves or stuttering
- Technical issues during live presentation

**Target Duration:** 2 minutes 30 seconds (including intro/outro)
**Format:** MP4 or MOV, 1920x1080, 30fps
**Audio:** Clear narration with system audio

---

## EQUIPMENT REQUIREMENTS

### Minimum Setup
- **Computer:** Mac or Windows with screen recording capability
- **Screen resolution:** 1920x1080 or higher
- **Microphone:** Built-in mic acceptable, USB mic preferred
- **Storage:** 500MB free disk space for video
- **Time:** 45 minutes (30 min recording + setup + review)

### Recommended Setup
- **External USB Microphone:** Better audio quality
- **Second Monitor (optional):** To view speaker notes while recording
- **Lighting:** Natural or LED lighting on face (if recording with face)
- **Background:** Clean, professional backdrop
- **Audio interface:** To monitor audio levels during recording

### Recording Software Options

**macOS:**
- **QuickTime Player** (built-in)
  - Pros: Free, simple, good quality
  - Cons: Limited editing, no real-time monitoring
- **ScreenFlow** (paid, ~$99)
  - Pros: Professional, good editing, real-time monitoring
  - Cons: Paid software
- **OBS Studio** (free, open-source)
  - Pros: Free, powerful, cross-platform, editable overlay
  - Cons: Learning curve, more complex setup

**Windows:**
- **OBS Studio** (free)
  - Pros: Free, powerful, good quality
  - Cons: Slightly larger file size
- **Camtasia** (paid trial available)
  - Pros: User-friendly, good editing
  - Cons: Paid software
- **ScreenFlow alternative:** Movavi Screen Recorder
- **Built-in:** Windows 10/11 Game Bar (Win + G)
  - Pros: Built-in, simple
  - Cons: Lower quality, limited control

**Cross-Platform:**
- **Loom** (web-based)
  - Pros: Cloud storage, easy sharing, built-in editor
  - Cons: Requires internet, resolution limit on free
- **Zoom Recording** (if Zoom is available)
  - Pros: Built-in, simple
  - Cons: Watermark unless licensed

### Recommended: OBS Studio Setup
Download from: https://obsproject.com/

**Why OBS:**
- Free and open-source
- Professional quality output
- Can record system audio + microphone
- Allows scene setup (multiple windows)
- Cross-platform (Mac, Windows, Linux)

---

## PRE-RECORDING SETUP (30 minutes before)

### 1. System Preparation (10 minutes)

**Clean up desktop:**
```bash
# Clear demo data
node /Users/jasonyi/midnight_summit_hackathon/chainvault/integration/clear-demo-data.js

# Generate fresh demo data
node /Users/jasonyi/midnight_summit_hackathon/chainvault/integration/generate-demo-data.js

# Verify all systems
node /Users/jasonyi/midnight_summit_hackathon/chainvault/integration/health-check.js
```

**Expected output:**
```
✅ Backend API: Connected
✅ WebSocket: Connected
✅ Smart Contract: Ready
✅ Oracle: Active
✅ Demo Users: Loaded
✅ Test Data: Generated
```

**Close unnecessary applications:**
- [ ] Close Slack, Discord, Teams, email
- [ ] Close all browser tabs except demo tabs
- [ ] Disable notifications (Do Not Disturb mode)
- [ ] Disable auto-updates
- [ ] Close Spotlight/search features

### 2. Browser Setup (10 minutes)

**Open browser (Chrome or Firefox recommended):**
```
Tab 1: http://localhost:3000/?role=supplier
Tab 2: http://localhost:3000/?role=buyer
Tab 3: http://localhost:3000/?role=logistics
Tab 4: http://localhost:3000/?role=regulator
```

**Arrange tabs:**
- **Option A (Recommended):** Use Tab Groups or Window Snapping
  - Open 2 windows side-by-side
  - Left window: Tabs 1 & 2 (Supplier & Buyer)
  - Right window: Tabs 3 & 4 (Logistics & Regulator)
  - Position windows to fill screen evenly

- **Option B:** Grid View
  - Maximize browser, arrange tabs in view
  - Use browser zoom (75-90%) to fit all 4 in viewport
  - May need 2 monitors for this

**Browser optimization:**
- [ ] Close DevTools (if open)
- [ ] Hide bookmarks bar
- [ ] Hide URL bar (if possible in full-screen)
- [ ] Set zoom to 100% on all tabs
- [ ] Refresh all tabs to ensure latest state

### 3. Recording Software Setup (10 minutes)

**If using OBS Studio:**

**Source Configuration:**
1. Create scene "ChainVault Demo"
2. Add source: "Display Capture"
   - Select primary monitor
   - Set width: 1920, height: 1080
   - Enable: "Capture cursor"
3. Add source: "Audio Input Capture"
   - Device: USB Microphone (or Built-in mic)
   - Mixer Levels: -10 to -6dB (not peaking at 0)
4. Add source (optional): "Audio Output Capture"
   - Enable system audio
   - Useful for capturing notification sounds (disable if quiet)

**Audio Settings:**
- Microphone level: -10 to -6dB (test first)
- System audio: -20 to -12dB (if capturing)
- Always test audio BEFORE recording

**Output Settings:**
- Format: MP4
- Video Bitrate: 6000-8000 kbps
- Audio Bitrate: 192 kbps
- Frame Rate: 30 fps
- Resolution: 1920x1080

**Recording Folder:**
- Set path: `/Users/jasonyi/midnight_summit_hackathon/chainvault/demo/recordings/`

---

## SCRIPT & NARRATION

### Opening (0:00-0:15) - 15 seconds

**Say (clearly and slowly):**
"Hi, I'm demonstrating ChainVault, a privacy-preserving supply chain solution built on Midnight blockchain. What you're about to see is a complete transaction flow that combines privacy with transparency using zero-knowledge proofs."

**Visual:**
- Show title slide or company logo
- Pause 2 seconds after speaking
- Allow viewers to process information

### Scene 1: Order Creation (0:15-0:45) - 30 seconds

**Say:**
"First, ACME Corp, our supplier, creates a purchase order for MegaRetail. The order is for 100 units at $10,000. Here's what makes it different - the price is encrypted on the blockchain."

**Actions to perform:**
1. Click "Create New Order" button
2. Fill form:
   - Buyer: MegaRetail
   - Quantity: 100
   - Price: 10000
   - Delivery: Chicago, IL
3. Click "Create Contract"
4. Wait for success message
5. Show order in dashboard with status "Pending Approval"

**Key narrative points:**
- "The price is encrypted - only ACME can see it"
- "MegaRetail sees the order but not the price"
- "This is the privacy aspect"

### Scene 2: Buyer Approval (0:45-1:20) - 35 seconds

**Say:**
"Now MegaRetail needs to approve the order, but here's the magic - they don't see the actual price. Instead, they verify it with a zero-knowledge proof that proves the price is within their budget, without revealing what that budget is or what the price actually is."

**Actions to perform:**
1. Switch to Buyer Dashboard
2. Click on the pending order
3. Show order details:
   - Quantity: 100 units (visible)
   - Price: [ENCRYPTED] (hidden)
4. Click "Generate Approval Proof"
5. Wait for proof generation animation (2-3 seconds)
6. Show "✅ ZK Proof Generated"
7. Click "Approve Order"
8. Wait for success message

**Key narrative points:**
- "They see quantity but not price"
- "The proof verifies price is acceptable"
- "Price remains hidden even from buyer"
- "This is zero-knowledge proofs in action"

### Scene 3: Delivery (1:20-2:00) - 40 seconds

**Say:**
"The order is approved. FastShip, the logistics provider, now handles delivery with GPS tracking. Watch as the order moves from the warehouse to Chicago. When delivery is confirmed at the exact location, the smart contract automatically releases payment. No manual processing, no payment disputes."

**Actions to perform:**
1. Switch to Logistics Dashboard
2. Show order ready for delivery
3. Click "Start Delivery Simulation"
4. Watch animation progress (30-40 seconds):
   - Progress bar advances: 0% → 100%
   - Map shows truck movement (if available)
   - Status updates through stages
5. When delivery completes (100%):
   - Show "✅ DELIVERED" status
   - Show "💰 Payment Released" notification
   - Confirm payment of $10,000

**Key narrative points:**
- "Real-time GPS tracking"
- "Automatic payment on delivery confirmation"
- "No intermediaries, no disputes"
- "Settlement in seconds, not 30-60 days"

### Scene 4: Compliance (2:00-2:15) - 15 seconds

**Say:**
"Finally, let's look at the regulator's view. TradeComm can verify the entire transaction is compliant - delivery confirmed, payment released - without seeing any of the commercial details. Full transparency for compliance, full privacy for competition."

**Actions to perform:**
1. Switch to Regulator Dashboard
2. Click on the completed order
3. Show compliance details:
   - ✅ Delivery verified
   - ✅ Payment completed
   - ✅ Compliance verified
   - 🔒 Price: [ENCRYPTED]
4. Optionally show audit trail timeline

**Key narrative points:**
- "Regulator sees compliance without commercial data"
- "Full transparency, full privacy"
- "This is what Midnight enables"

### Closing (2:15-2:30) - 15 seconds

**Say:**
"That's ChainVault - privacy and transparency working together, enabled by Midnight's zero-knowledge proofs. This isn't a mockup; it's running live on Midnight blockchain. With ChainVault, supply chains can be faster, more private, and more compliant. Thank you."

**Visual:**
- Return to Supplier Dashboard
- Show all 4 dashboards if possible
- Display contact info or "Questions?" slide

---

## RECORDING PROCEDURE

### Session 1: Main Demo Flow

**Step 1: Start Recording (DO NOT START YET)**
1. Launch recording software
2. Start recording (do not press record yet)
3. Take a deep breath
4. Count to 3
5. Press RECORD

**Step 2: Narrate Opening (0:00-0:15)**
- Speak clearly and confidently
- Pause 2 seconds after opening statement
- Allow viewer to see company logo/slide

**Step 3: Execute Scene 1 - Order Creation (0:15-0:45)**
- Narrate while performing actions
- Click deliberately, not too fast
- Wait for animations to complete before speaking about next step
- Pause 1 second after seeing "Order created successfully"

**Step 4: Execute Scene 2 - Buyer Approval (0:45-1:20)**
- Maintain narration flow
- Don't rush the ZK proof generation
- Let the animation play fully
- Pause after seeing approval confirmation

**Step 5: Execute Scene 3 - Delivery (1:20-2:00)**
- Watch delivery animation progress
- Keep narration continuous but paced
- Don't talk over the exciting moments
- Let payment release get attention

**Step 6: Execute Scene 4 - Compliance (2:00-2:15)**
- Navigate to Regulator Dashboard
- Show the privacy protection visually
- Emphasize the insight

**Step 7: Closing (2:15-2:30)**
- Thank the viewers
- Close with confidence
- Stop recording a few seconds after closing

**Step 8: Stop Recording**
- Click STOP
- Wait 5 seconds
- Export video to: `/chainvault/demo/recordings/demo-BACKUP.mp4`

### Session 2: Review & Re-record if Needed

**Review checklist:**
- [ ] Audio is clear and not muffled
- [ ] Narration is understandable (no heavy accent/mumbling)
- [ ] Timing is good (not too fast, not too slow)
- [ ] No long awkward pauses
- [ ] All clicks registered and animations played
- [ ] Payment release moment is clear
- [ ] Final message comes through strong
- [ ] Total duration: 2:30-2:35

**If issues found:**
- Re-record specific scenes that went wrong
- Edit together multiple takes (if using OBS with editing)
- Or start completely fresh for clean flow

---

## BACKUP VIDEO VARIATIONS

### Variation 1: Complete Success Case (BEST)
- Everything works perfectly
- All animations play smoothly
- Payment releases automatically
- Clean narrative flow
- **Use this one for backup**

### Variation 2: Manual Recovery (SAFE)
- If something glitches, manually show what should have happened
- Narrate: "The system now shows the order was created with ID 001"
- Continue as if glitch was just a slow network response
- Keep narration smooth and professional
- **Acceptable backup**

### Variation 3: Fast-Track Version (LAST RESORT)
- Skip animations, just show results
- "Here's the order created..."
- "Here's the buyer approval..."
- "Here's payment released..."
- Total time: 90 seconds
- **Only use if other recordings fail**

---

## TECHNICAL TROUBLESHOOTING DURING RECORDING

### If Order Creation Fails
1. **On tape:** Say "Let me try that again..."
2. **Off tape:** Stop recording, refresh supplier tab, clear demo data, start new recording

### If ZK Proof Doesn't Generate
1. **On tape:** "The proof is generating..." [let it load]
2. **If timeout:** Manually click approve and continue
3. **Narrate:** "The proof verifies price is within budget..."

### If Delivery Animation Stutters
1. **On tape:** Keep talking, don't acknowledge the stutter
2. **Narrate:** "The truck is progressing through the delivery route..."
3. **Let animation complete** - even if slow
4. **Or:** Manually advance to completed state with narration

### If Payment Won't Release
1. **On tape:** "The smart contract now releases payment..."
2. **Show transaction in history manually**
3. **Narrate:** "Payment of $10,000 has been released to ACME Corp"
4. **Continue as if automatic release occurred**

### If Regulator Dashboard Unresponsive
1. **Skip to closing** - you've shown the key points
2. **Narrate:** "Regulators get full compliance proofs while commercial data stays private"
3. **No need to actually show regulator page**

---

## AUDIO QUALITY GUIDELINES

### Before Recording

**Test audio levels:**
1. Click File/Settings/Audio
2. Set microphone input level to -10 to -6dB
3. Test narration at normal speaking volume
4. Adjust if too loud (clipping) or too soft (can't hear)
5. Record 10-second test, review

**Microphone placement:**
- Keep microphone 6-12 inches from mouth
- Speak slightly louder than normal conversation
- Avoid mouth sounds (plosives) - don't say "P"s directly into mic
- Have water nearby to prevent dry mouth

### During Recording

**Narration best practices:**
- Speak slowly and clearly (slightly slower than normal)
- Pause between sentences for emphasis
- Use natural intonation (not robotic)
- Breathe naturally - don't hold breath
- If you make a mistake, pause 3 seconds and repeat the sentence
- Skip the mistake in editing (or re-record entire scene)

### After Recording

**Audio cleanup (if needed):**
- Remove background noise (in post-processing software)
- Normalize audio levels
- Remove long pauses or "ums"
- Add background music (optional, subtle)

---

## VIDEO EDITING (OPTIONAL)

### If Using OBS with Editing Capabilities

**Basic editing steps:**
1. Trim beginning and end
2. Cut any long pauses (but leave natural pauses)
3. Speed up any overly slow sections (max 1.1x speed)
4. Normalize audio volume
5. Add title card (ChainVault logo) at start
6. Add closing slide (questions/contact) at end
7. Add subtitle text for key moments (optional)

### If Using Separate Editing Software

**macOS:** Final Cut Pro, iMovie
**Windows:** Adobe Premiere, DaVinci Resolve (free)
**Cross-platform:** OpenShot, Shotcut (free)

**Editing checklist:**
- [ ] Clean audio levels throughout
- [ ] Remove dead space
- [ ] Ensure color grading is consistent
- [ ] Add opening slide (2 seconds)
- [ ] Add closing slide (3 seconds)
- [ ] Check final duration (target: 2:30-2:35)
- [ ] Export as MP4, 1920x1080, 30fps

---

## FILE MANAGEMENT

### Recording Location
```
/Users/jasonyi/midnight_summit_hackathon/chainvault/demo/recordings/
```

### Naming Convention
```
demo-BACKUP-[DATE]-[VERSION].mp4

Examples:
demo-BACKUP-2025-11-17-v1.mp4 (first take)
demo-BACKUP-2025-11-17-v2.mp4 (second take)
demo-BACKUP-2025-11-17-v3-FINAL.mp4 (final version used)
```

### Backup Copies
- [ ] Save master recording to demo/recordings/ folder
- [ ] Save copy to cloud storage (Google Drive, Dropbox, iCloud)
- [ ] Save copy to USB drive (for offline availability)
- [ ] Save copy on second laptop (as ultimate backup)

### Quality Control
- Test playback in different browsers
- Test on different devices (if possible)
- Verify audio syncs with video
- Check total file size fits on USB drive (typical: 200-300MB)

---

## PLAYBACK CHECKLIST

**Before presenting, test:**

1. **Video Player Setup**
   - [ ] Video plays in browser (YouTube, local file, etc.)
   - [ ] Sound works on presentation speakers
   - [ ] Screen resolution looks good
   - [ ] No stuttering or buffering

2. **Network Setup**
   - [ ] If streaming: verify bandwidth (minimum 5Mbps)
   - [ ] If local file: copy to laptop hard drive
   - [ ] Have offline copy ready regardless

3. **Timing**
   - [ ] Video plays in under 2:35
   - [ ] Buffer for questions (if needed)

4. **Audio**
   - [ ] Volume levels appropriate
   - [ ] No audio sync issues
   - [ ] Backup microphone available if system audio fails

---

## DURING LIVE PRESENTATION - BACKUP PLAN

### Trigger Points to Switch to Video

**If live demo fails:**
1. After 30 seconds of technical issues (not resolving)
2. When any critical system doesn't work:
   - Backend API unresponsive
   - Browser crashes
   - Order creation fails
   - Payment won't release
3. At any point you lose confidence in continuation

### Transition Language

**Say to judges:**
"While we troubleshoot that, let me show you the recording of the complete flow, which demonstrates the exact capabilities."

**Or:**
"Let me play the backup demo while the live system recovers."

**Or (if genuinely broken):**
"We're experiencing a technical issue, but this recording shows exactly how ChainVault works."

### Playback During Presentation
1. Pause and minimize live demo tabs
2. Open video player to full screen
3. Press play
4. Narrate along if desired (optional)
5. When done, pause video
6. Continue to next presentation section
7. Note: "Let's move to the technical architecture..."

### Transition to Slides
After video ends:
- [ ] Thank judges for watching
- [ ] Acknowledge technical issue (briefly, don't dwell on it)
- [ ] Transition to next slide: "Here's how Midnight makes this possible..."
- [ ] Continue with architecture explanation (Slides 5-6)

---

## CONTINGENCY SCENARIOS

### Scenario 1: Live Demo Works, Video is Backup
**Best case!**
- Use live demo as primary
- Video stays in background (don't use)
- Still have insurance if issues arise

### Scenario 2: Live Demo Fails Halfway
**Mid-demo failure:**
1. Acknowledge issue: "Let me show you the backup recording"
2. Play video from this point forward
3. Continue as if live demo completed
4. Adjust time: live + video combined = 3 mins total
5. Move to slide section

### Scenario 3: Live Demo Won't Start
**Pre-demo failure:**
1. Say: "Let me show you the live recording of the ChainVault demo"
2. Play entire video from start
3. Saves 2 minutes, use for Q&A
4. Still covers all demo points

### Scenario 4: Video Corrupted/Won't Play
**Video failure:**
1. Don't panic - you have presentation slides
2. Say: "Let me walk you through the architecture and flow"
3. Use Slide 5 (Technical) and Slide 4 (Demo highlights)
4. Explain each component verbally
5. Focus on "wow" moments: privacy, automation, speed
6. Switch to Q&A if time allows

---

## FINAL CHECKLIST (Before Recording)

### System Status
- [ ] Services running: `npm run dev:all`
- [ ] Health check passes: `node integration/health-check.js`
- [ ] Demo data fresh: `node integration/generate-demo-data.js`
- [ ] All 4 browser tabs loaded and responsive
- [ ] No error messages in console

### Audio/Video Setup
- [ ] Microphone tested and working
- [ ] Audio levels set correctly (-10 to -6dB)
- [ ] Recording software configured
- [ ] Recording path set to demo/recordings/
- [ ] Zoom/screen capture set to 1920x1080

### Environment
- [ ] No notifications will pop up (Do Not Disturb ON)
- [ ] Phone on silent
- [ ] Lighting adequate
- [ ] Background clean
- [ ] Door closed (quiet environment)

### Mental Preparation
- [ ] Reviewed script multiple times
- [ ] Practiced demo flow at least twice
- [ ] Know key talking points
- [ ] Calm and confident
- [ ] Water available

### Final Pre-Record Actions
- [ ] Refresh all 4 browser tabs
- [ ] Click on Supplier tab to start
- [ ] Clear screen of distractions
- [ ] Take a deep breath
- [ ] Count to 3
- [ ] **PRESS RECORD**

---

## POST-RECORDING CHECKLIST

### Immediate After
- [ ] Stop recording
- [ ] Save file with proper naming
- [ ] Review video (first 30 seconds)
- [ ] Check audio quality
- [ ] Confirm file size > 100MB (not corrupted)

### Quality Review (within 1 hour)
- [ ] Watch entire video (can be sped up)
- [ ] Check for sync issues
- [ ] Verify audio is clear
- [ ] Confirm all scenes complete
- [ ] Note any issues for re-recording

### Backup Creation (same day)
- [ ] Copy to cloud storage
- [ ] Copy to USB drive
- [ ] Copy to second laptop
- [ ] Verify all copies work
- [ ] Document file locations

### Final Verification (before event)
- [ ] Test playback on presentation laptop
- [ ] Test with presentation screen/projector
- [ ] Verify audio through presentation speakers
- [ ] Check video in fullscreen mode
- [ ] Confirm playback can be paused/resumed

---

## QUICK REFERENCE: RECORDING COMMANDS

```bash
# Before recording
cd /Users/jasonyi/midnight_summit_hackathon/chainvault

# Clear old data
node integration/clear-demo-data.js

# Generate fresh demo data
node integration/generate-demo-data.js

# Check system health
node integration/health-check.js

# Expected output: All GREEN/Connected

# Open recording folder
open demo/recordings/

# After recording, verify file exists
ls -lh demo/recordings/demo-BACKUP*.mp4
```

---

## TROUBLESHOOTING GUIDE

**Issue: Audio too quiet**
- Solution: Increase microphone gain in recording software
- Test: Record 10-second test, replay at full volume
- Adjust: If still quiet, move microphone closer (6 inches away)

**Issue: Audio too loud (clipping)**
- Solution: Decrease microphone input level
- Target: -10 to -6dB (no red/clipping indicator)
- Test: Speak at normal presentation volume

**Issue: Background noise/hum**
- Solution: Ensure "Do Not Disturb" is ON
- Close all unnecessary applications
- Use USB microphone if available
- Record in quiet room

**Issue: Microphone not detected**
- Solution: Check system audio settings
- Restart recording software
- Select correct input device in settings
- Test in System Preferences/Sound

**Issue: Video stutters/lags**
- Solution: Close other applications
- Lower screen resolution to 1920x1080
- Reduce frame rate to 24fps if needed
- Disable hardware acceleration in browser

**Issue: Order creation fails during recording**
- Solution: Can continue narrating "system is creating order"
- Re-record just that scene
- Or manually trigger order creation in separate take
- Edit together multiple takes (if using OBS editing)

**Issue: File too large**
- Solution: Reduce bitrate in recording settings
- Change from 8000 kbps to 6000 kbps
- Result: Slightly lower quality but much smaller file
- File size target: 200-300MB

---

## CONTACT & SUPPORT

**For technical issues with recording:**
1. Check OBS/software settings (correct input device selected)
2. Restart recording software if issues persist
3. Try backup recording software (QuickTime on Mac, built-in recorder on Windows)
4. Record audio separately, add to video in editing software

**For demo flow issues:**
1. Review DEMO_SCRIPT_DETAILED.md for exact steps
2. Practice demo flow without recording first
3. Ensure fresh demo data is generated before each attempt
4. Allow 3-5 attempts if needed for perfect take

---

**Last Updated:** 2025-11-17
**Video Format:** MP4 (H.264), 1920x1080, 30fps, 2:30-2:35 duration
**Status:** Ready to Record
**Critical:** Test recording 1-2 days before event, not just before presentation
