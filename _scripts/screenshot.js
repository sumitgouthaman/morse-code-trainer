const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const config = {
  local: 'http://localhost:8000',
  live: 'https://morse-code.sumitgouthaman.com', // Update with your actual GitHub Pages URL
  outputDir: '../_screenshots',
  getDesktopDir: (source) => `../_screenshots/${source}/desktop`,
  getMobileDir: (source) => `../_screenshots/${source}/mobile`,
  viewport: {
    width: 1200,
    height: 800
  },
  mobileViewport: {
    width: 448,
    height: 867
  },
  gif: {
    delay: 100, // Frame delay in centiseconds (100 = 1 second)
    loop: 0,    // Infinite loop
    quality: 80
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
    actions: [
      { 
        type: 'evaluate', 
        script: `
          // Ensure paddle is disabled for regular char-to-morse screenshot
          const toggle = document.querySelector('#paddle-toggle');
          if (toggle && toggle.classList.contains('enabled')) {
            toggle.click();
          }
        `
      }
    ],
    waitFor: '.character-display',
    fullPage: false
  },
  {
    name: '03b-char-to-morse-paddle',
    description: 'Character to Morse practice mode with spacebar paddle enabled',
    url: '#char-to-morse',
    actions: [
      { 
        type: 'evaluate', 
        script: `
          // Ensure paddle is enabled for paddle mode screenshot
          const toggle = document.querySelector('#paddle-toggle');
          if (toggle && !toggle.classList.contains('enabled')) {
            toggle.click();
          }
        `
      }
    ],
    waitFor: '#paddle-interface',
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
    
    // Set consistent browser settings for deterministic screenshots
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
    });
    
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
      
      // Override Date.now for consistent timestamps
      const fixedTime = 1640995200000; // Fixed timestamp: Jan 1, 2022
      window._originalDateNow = Date.now;
      Date.now = () => fixedTime;
      
      // Override performance.now for consistent timing
      window._originalPerformanceNow = performance.now;
      performance.now = () => 1000; // Fixed 1 second
    });
    
    // Navigate to the specific URL
    const fullUrl = baseUrl + scenario.url;
    await page.goto(fullUrl, { waitUntil: 'networkidle0' });
    
    // Give dynamic loading time to complete and animations to settle
    await new Promise(resolve => setTimeout(resolve, 3000)); // Increased from 2000
    
    // Wait for fonts to load
    await page.evaluate(() => {
      return document.fonts.ready;
    });
    
    // Perform any required actions
    if (scenario.actions) {
      for (const action of scenario.actions) {
        if (action.type === 'click') {
          await page.click(action.selector);
          await new Promise(resolve => setTimeout(resolve, 500)); // Increased wait time
        } else if (action.type === 'evaluate') {
          await page.evaluate(action.script);
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for DOM changes
        }
      }
    }
    
    // Wait for specific element if specified
    if (scenario.waitFor) {
      await page.waitForSelector(scenario.waitFor, { timeout: 2000 });
    }
    
    // Additional wait for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
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

async function createGifFromScreenshots(source, viewport) {
  const isDesktop = viewport.width > 500;
  const viewportType = isDesktop ? 'desktop' : 'mobile';
  const screenshotDir = isDesktop ? config.getDesktopDir(source) : config.getMobileDir(source);
  
  console.log(`🎬 Creating animated GIF from ${source} ${viewportType} screenshots...`);
  
  try {
    // Get all screenshot files in order
    const screenshotFiles = scenarios.map(scenario => 
      path.join(screenshotDir, `${scenario.name}.png`)
    ).filter(filePath => fs.existsSync(filePath));
    
    if (screenshotFiles.length === 0) {
      console.log(`⚠️  No screenshots found in ${screenshotDir}`);
      return;
    }
    
    console.log(`📊 Processing ${screenshotFiles.length} screenshots into GIF...`);
    
    // Create GIF in the same directory as screenshots
    const gifPath = path.join(screenshotDir, 'combined.gif');
    
    // Check if ImageMagick is available for better GIF creation
    try {
      const { execSync } = require('child_process');
      
      // Build the convert command
      const frameList = screenshotFiles.map(f => `"${f}"`).join(' ');
      const convertCmd = `convert -delay ${config.gif.delay} -loop ${config.gif.loop} ${frameList} "${gifPath}"`;
      
      execSync(convertCmd, { stdio: 'pipe' });
      console.log(`🎉 Animated GIF created: combined.gif`);
      console.log(`📁 Saved to: ${gifPath}`);
      
    } catch (convertError) {
      console.log('⚠️  ImageMagick not available, using Node.js approach...');
      
      // Read and process all frames
      const frames = [];
      for (const filePath of screenshotFiles) {
        const frameBuffer = await sharp(filePath)
          .resize(viewport.width, viewport.height, { 
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .png()
          .toBuffer();
        
        // Duplicate frames to control timing (since sharp doesn't support delay directly)
        const duplicateCount = Math.max(1, Math.floor(config.gif.delay / 10));
        for (let i = 0; i < duplicateCount; i++) {
          frames.push(frameBuffer);
        }
      }
      
      // Create animated GIF using sharp
      if (frames.length > 0) {
        await sharp(frames[0], { 
          animated: true,
          pages: frames.length
        })
        .gif({
          delay: 10, // 10ms between duplicated frames
          loop: config.gif.loop
        })
        .toFile(gifPath);
        
        console.log(`🎉 Animated GIF created: combined.gif`);
        console.log(`📁 Saved to: ${gifPath}`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Failed to create GIF for ${source} ${viewportType}:`, error.message);
  }
}

async function createAllGifs(source) {
  console.log(`🎬 Creating animated GIFs for ${source}...`);
  
  // Create desktop GIF
  await createGifFromScreenshots(source, config.viewport);
  
  // Create mobile GIF  
  await createGifFromScreenshots(source, config.mobileViewport);
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
    
    // Always create GIFs after screenshots
    await createAllGifs(source);
    
  } catch (error) {
    console.error('❌ Screenshot session failed:', error);
  } finally {
    await browser.close();
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
      console.log('📁 Screenshots and GIFs saved to:');
      console.log('   • _screenshots/local/desktop/ (+ combined.gif)');
      console.log('   • _screenshots/local/mobile/ (+ combined.gif)');
      console.log('   • _screenshots/live/desktop/ (+ combined.gif)');
      console.log('   • _screenshots/live/mobile/ (+ combined.gif)');
      
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
