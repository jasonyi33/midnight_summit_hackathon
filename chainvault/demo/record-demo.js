// Demo Recording Script
// Guidelines and automation for recording backup demo video

const fs = require('fs');
const path = require('path');

class DemoRecorder {
  constructor() {
    this.recordingPath = path.join(__dirname, 'recordings');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  // Initialize recording setup
  async setup() {
    console.log('\n📹 ChainVault Demo Recording Setup\n');
    console.log('=====================================\n');

    // Create recordings directory
    if (!fs.existsSync(this.recordingPath)) {
      fs.mkdirSync(this.recordingPath, { recursive: true });
      console.log('✅ Created recordings directory');
    }

    this.checkRequirements();
    this.printInstructions();
  }

  // Check recording requirements
  checkRequirements() {
    console.log('📋 Pre-Recording Checklist:\n');

    const requirements = [
      {
        item: 'Screen recording software',
        check: 'OBS Studio, QuickTime, or Loom',
      },
      {
        item: 'Browser windows',
        check: '4 tabs open (Supplier, Buyer, Logistics, Regulator)',
      },
      {
        item: 'Services running',
        check: 'Run: npm run dev:all',
      },
      {
        item: 'Test data cleared',
        check: 'Run: npm run clean',
      },
      {
        item: 'Microphone',
        check: 'Test audio levels',
      },
      {
        item: 'Display resolution',
        check: '1920x1080 or higher',
      },
    ];

    requirements.forEach((req, index) => {
      console.log(`${index + 1}. ${req.item}`);
      console.log(`   → ${req.check}\n`);
    });
  }

  // Print recording instructions
  printInstructions() {
    console.log('\n📹 Recording Instructions:\n');
    console.log('=====================================\n');

    const instructions = [
      {
        title: '1. SETUP (Before Recording)',
        steps: [
          'Open 4 browser tabs side-by-side or use grid view',
          'Tab 1: Supplier Dashboard (top-left)',
          'Tab 2: Buyer Dashboard (top-right)',
          'Tab 3: Logistics Dashboard (bottom-left)',
          'Tab 4: Regulator Dashboard (bottom-right)',
          'Set recording area to capture all 4 views',
          'Hide browser toolbars for clean look',
        ],
      },
      {
        title: '2. RECORDING SETTINGS',
        steps: [
          'Resolution: 1920x1080 minimum',
          'Frame rate: 30 FPS',
          'Audio: Enable microphone',
          'Format: MP4 or MOV',
          `Output file: demo-${this.timestamp}.mp4`,
        ],
      },
      {
        title: '3. SCRIPT TIMING (2 minutes total)',
        steps: [
          '0:00-0:10 - Introduction',
          '0:10-0:30 - Create order (Supplier)',
          '0:30-1:00 - Approve order (Buyer)',
          '1:00-1:40 - Track delivery (Logistics)',
          '1:40-1:50 - Verify compliance (Regulator)',
          '1:50-2:00 - Conclusion',
        ],
      },
      {
        title: '4. KEY POINTS TO EMPHASIZE',
        steps: [
          'Price is ENCRYPTED (supplier view only)',
          'ZK Proof generation animation',
          'Automatic payment on delivery',
          'Regulator sees no commercial data',
          'Real blockchain transactions (show hashes)',
        ],
      },
    ];

    instructions.forEach(section => {
      console.log(`📌 ${section.title}\n`);
      section.steps.forEach(step => {
        console.log(`   • ${step}`);
      });
      console.log();
    });
  }

  // Generate recording script file
  async generateScriptFile() {
    const scriptContent = `
# ChainVault Demo Recording Script
# Generated: ${new Date().toISOString()}

## Recording: demo-${this.timestamp}.mp4

### SCENE 1: Introduction (0:00-0:10)
"Welcome to ChainVault - the privacy-preserving supply chain platform built on Midnight blockchain."
"Today I'll show you how we enable private transactions with public compliance."

### SCENE 2: Supplier Creates Order (0:10-0:30)
[Click Supplier Dashboard]
"ACME Corp creates an order for 100 units at $10,000"
[Fill form and submit]
"Notice the price is now encrypted on the blockchain"

### SCENE 3: Buyer Approves (0:30-1:00)
[Switch to Buyer Dashboard]
"MegaRetail can see the quantity but not the price"
[Click Generate ZK Proof]
"The zero-knowledge proof verifies the price is within budget without revealing it"
[Click Approve]

### SCENE 4: Logistics Tracking (1:00-1:40)
[Switch to Logistics Dashboard]
"FastShip tracks the delivery in real-time"
[Show GPS progression]
"When delivery is confirmed..."
[Show automatic payment]
"The smart contract automatically releases payment"

### SCENE 5: Compliance (1:40-1:50)
[Switch to Regulator Dashboard]
"Regulators can verify compliance without seeing commercial details"
[Show compliance proofs]

### SCENE 6: Conclusion (1:50-2:00)
[Show all 4 dashboards]
"ChainVault - Where privacy meets transparency in supply chain."
"Built on Midnight. Ready for enterprise."

## Post-Recording Checklist:
- [ ] Video is exactly 2 minutes (±5 seconds)
- [ ] Audio is clear and audible
- [ ] All 4 dashboards are visible
- [ ] ZK proof animation is captured
- [ ] Payment automation is shown
- [ ] No sensitive data visible
- [ ] File saved as: demo-${this.timestamp}.mp4
`;

    const scriptPath = path.join(
      this.recordingPath,
      `script-${this.timestamp}.md`
    );

    fs.writeFileSync(scriptPath, scriptContent);
    console.log(`\n✅ Script file saved: ${scriptPath}\n`);

    return scriptPath;
  }

  // Start mock data flow for recording
  async startMockFlow() {
    console.log('\n🎬 Starting Mock Data Flow for Recording\n');
    console.log('=====================================\n');

    console.log('This will simulate the demo flow at recording pace:\n');

    const steps = [
      { time: 10, action: 'Order will be created' },
      { time: 30, action: 'Approval notification appears' },
      { time: 60, action: 'Delivery tracking starts' },
      { time: 100, action: 'Delivery confirmed, payment released' },
      { time: 110, action: 'Compliance data available' },
    ];

    console.log('Timeline:');
    steps.forEach(step => {
      console.log(`   ${step.time}s - ${step.action}`);
    });

    console.log('\n⏺️  START RECORDING NOW!\n');

    // Countdown
    for (let i = 5; i > 0; i--) {
      process.stdout.write(`\rStarting in ${i}...`);
      await this.pause(1000);
    }

    console.log('\r🔴 RECORDING - Follow the script!\n');

    // Emit mock events at specified times
    for (const step of steps) {
      await this.pause(step.time * 1000);
      console.log(`✓ ${step.action}`);
      // In real implementation, emit actual events
    }

    console.log('\n✅ Mock flow complete!');
    console.log('⏹️  STOP RECORDING\n');
  }

  // Post-recording tasks
  async postRecording() {
    console.log('\n📝 Post-Recording Tasks:\n');

    const tasks = [
      'Review video for quality',
      'Trim to exactly 2 minutes if needed',
      'Export as MP4 with H.264 codec',
      `Rename to: chainvault-demo-final.mp4`,
      'Create backup copy',
      'Upload to cloud storage',
      'Test playback on different devices',
    ];

    tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task}`);
    });

    console.log('\n✅ Recording session complete!\n');
  }

  // Helper to pause execution
  pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Main recording workflow
  async run() {
    await this.setup();

    console.log('\n🎯 Ready to Record?\n');
    console.log('1. Press ENTER when ready to generate script');
    console.log('2. Press CTRL+C to cancel\n');

    // Wait for user input (mock for now)
    process.stdin.once('data', async () => {
      const scriptPath = await this.generateScriptFile();
      console.log('📄 Open the script file in another window\n');

      console.log('Press ENTER when ready to start mock flow...');

      process.stdin.once('data', async () => {
        await this.startMockFlow();
        await this.postRecording();

        console.log('💾 Recording saved to:', this.recordingPath);
        process.exit(0);
      });
    });
  }
}

// Run if executed directly
if (require.main === module) {
  const recorder = new DemoRecorder();

  // Enable stdin
  process.stdin.setRawMode(false);
  process.stdin.resume();

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n⚠️  Recording cancelled by user\n');
    process.exit(0);
  });

  recorder.run().catch(console.error);
}

module.exports = DemoRecorder;