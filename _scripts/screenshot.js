const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  local: 'http://localhost:8000',
  live: 'https://sumitgouthaman.com/morse-code-trainer', // Update with your actual GitHub Pages URL
  outputDir: '../_screenshots',
  getDesktopDir: (source) => `../_screenshots/${source}/desktop`,
  getMobileDir: (source) => `../_screenshots/${source}/mobile`,
  viewport: {
    width: 1200,
    height: 800
  },
  mobileViewport: {
    width: 375,
    height: 667
  }
};

// Screenshot scenarios based on your app structure
const scenarios = [
  {
    name: '01-main-menu',
    description: 'Main menu with all practice modes',
    url: '',
    waitFor: '.menu-btn',
    fullPage: false
  },
  {
    name: '02-settings-modal',
    description: 'Settings modal',
    url: '',
    actions: [
      { type: 'click', selector: '#settings-btn' }
    ],
    waitFor: '#settings-modal',
    closeActions: [
      { type: 'click', selector: '#close-settings' }
    ],
    fullPage: false
  },
  {
    name: '03-char-to-morse',
    description: 'Character to Morse practice mode',
    url: '#char-to-morse',
    fullPage: false
  },
  {
    name: '04-morse-to-char',
    description: 'Morse to Character practice mode',
    url: '#morse-to-char',
    fullPage: false
  },
  {
    name: '05-sound-to-char',
    description: 'Sound to Character practice mode',
    url: '#sound-to-char',
    fullPage: false
  },
  {
    name: '06-learn-mode',
    description: 'Learn mode',
    url: '#learn',
    fullPage: false  // Changed from true to false to capture only visible area
  }
];

async function createOutputDir(source) {
  const desktopDir = config.getDesktopDir(source);
  const mobileDir = config.getMobileDir(source);
  
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  if (!fs.existsSync(desktopDir)) {
    fs.mkdirSync(desktopDir, { recursive: true });
  }
  if (!fs.existsSync(mobileDir)) {
    fs.mkdirSync(mobileDir, { recursive: true });
  }
}

async function takeScreenshot(page, scenario, baseUrl, suffix = '', source) {
  try {
    console.log(`📸 Taking screenshot: ${scenario.name}${suffix}`);
    
    // Override Math.random for consistent screenshots
    await page.evaluateOnNewDocument(() => {
      // Predefined sequence for consistent character selection
      const mockRandomValues = [
        0.0,   // 'A' - Always start with A for char-to-morse
        0.05,  // 'B' - Second character
        0.1,   // 'C' - Third character  
        0.15,  // 'D' - Fourth character
        0.2,   // 'E' - Fifth character
        0.25   // 'F' - Sixth character
      ];
      let mockRandomIndex = 0;
      
      // Store original random function
      window._originalRandom = Math.random;
      
      // Override with predictable sequence
      Math.random = () => {
        const value = mockRandomValues[mockRandomIndex % mockRandomValues.length];
        mockRandomIndex++;
        return value;
      };
    });
    
    // Navigate to the specific URL
    const fullUrl = baseUrl + scenario.url;
    await page.goto(fullUrl, { waitUntil: 'networkidle0' });
    
    // Give dynamic loading time to complete (same as debug script)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Perform any required actions
    if (scenario.actions) {
      for (const action of scenario.actions) {
        if (action.type === 'click') {
          await page.click(action.selector);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }
    
    // Wait for specific element if specified
    if (scenario.waitFor) {
      await page.waitForSelector(scenario.waitFor, { timeout: 2000 });
    }
    
    // Take screenshot
    const filename = `${scenario.name}.png`; // Remove suffix from filename
    let filepath;
    
    if (suffix === '-desktop') {
      filepath = path.join(config.getDesktopDir(source), filename);
    } else if (suffix === '-mobile') {
      filepath = path.join(config.getMobileDir(source), filename);
    } else {
      filepath = path.join(config.outputDir, filename);
    }
    
    await page.screenshot({
      path: filepath,
      fullPage: scenario.fullPage
    });
    
    // Perform close actions after screenshot (like closing modals)
    if (scenario.closeActions) {
      for (const action of scenario.closeActions) {
        if (action.type === 'click') {
          await page.click(action.selector);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }
    
    console.log(`✅ Saved: ${filename}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to screenshot ${scenario.name}${suffix}:`, error.message);
    return false;
  }
}

async function runScreenshots() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const isLocal = args.includes('--local');
  const isLive = args.includes('--live');
  const isBoth = args.includes('--both');
  
  if (isBoth) {
    console.log('🚀 Starting comprehensive screenshot session...\n');
    
    try {
      // Take local screenshots first
      console.log('📱 Phase 1: Local development screenshots');
      console.log('=' .repeat(50));
      await runSingleScreenshots('local', config.local);
      
      console.log('\n⏳ Waiting 2 seconds before next phase...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Take live screenshots
      console.log('🌐 Phase 2: Live GitHub Pages screenshots');
      console.log('=' .repeat(50));
      await runSingleScreenshots('live', config.live);
      
      console.log('\n🎉 Comprehensive screenshot session complete!');
      console.log('📁 Screenshots saved to:');
      console.log('   • _screenshots/local/desktop/');
      console.log('   • _screenshots/local/mobile/');
      console.log('   • _screenshots/live/desktop/');
      console.log('   • _screenshots/live/mobile/');
      console.log('\n✨ You can now compare local vs live versions!');
      
    } catch (error) {
      console.error('❌ Comprehensive screenshot session failed:', error);
      process.exit(1);
    }
    return;
  }
  
  // Single mode (local or live)
  let baseUrl, source;
  if (isLocal) {
    baseUrl = config.local;
    source = 'local';
    console.log('📱 Using local server:', baseUrl);
  } else if (isLive) {
    baseUrl = config.live;
    source = 'live';
    console.log('🌐 Using live site:', baseUrl);
  } else {
    // Default to local
    baseUrl = config.local;
    source = 'local';
    console.log('📱 Using local server (default):', baseUrl);
  }
  
  await runSingleScreenshots(source, baseUrl);
}

async function runSingleScreenshots(source, baseUrl) {
  await createOutputDir(source);
  
  const browser = await puppeteer.launch({
    headless: 'new'
    // Note: If you encounter sandbox-related errors in restricted environments
    // (Docker, CI/CD, etc.), you may need to add:
    // args: ['--no-sandbox', '--disable-setuid-sandbox']
    // However, this reduces security and should only be used when necessary
  });
  
  try {
    // Desktop screenshots
    console.log('🖥️  Taking desktop screenshots...');
    
    for (const scenario of scenarios) {
      const desktopPage = await browser.newPage(); // Fresh page for each screenshot
      await desktopPage.setViewport(config.viewport);
      await takeScreenshot(desktopPage, scenario, baseUrl, '-desktop', source);
      await desktopPage.close();
    }
    
    // Mobile screenshots
    console.log('📱 Taking mobile screenshots...');
    
    for (const scenario of scenarios) {
      const mobilePage = await browser.newPage(); // Fresh page for each screenshot
      await mobilePage.setViewport(config.mobileViewport);
      await takeScreenshot(mobilePage, scenario, baseUrl, '-mobile', source);
      await mobilePage.close();
    }
    
    console.log('🎉 Screenshot session complete!');
    console.log(`📁 Screenshots saved to: _screenshots/${source}/`);
    
  } catch (error) {
    console.error('❌ Screenshot session failed:', error);
  } finally {
    await browser.close();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  runScreenshots().catch(console.error);
}

module.exports = { runScreenshots, config, scenarios };
