# Screenshot Automation Scripts

This directory contains Puppeteer scripts to automatically take screenshots of the Morse Code Trainer app.

## Setup

1. Install dependencies:
   ```bash
   cd _scripts
   npm install
   ```

2. Install ImageMagick for high-quality GIF generation (recommended):
   ```bash
   # macOS
   brew install imagemagick

   # Ubuntu/Debian
   sudo apt install imagemagick

   # Windows
   # Download from https://imagemagick.org/script/download.php#windows
   ```
   
   **Note**: The script will automatically fall back to Sharp (Node.js) if ImageMagick is not available, but ImageMagick produces higher quality GIFs with better compression.

3. Update the live URL in `screenshot.js`:
   ```javascript
   live: 'https://morse-code.sumitgouthaman.com'
   ```

## Usage

### Local Screenshots (requires local server)
```bash
# Start your local server first
cd ..
python3 -m http.server

# Then in another terminal
cd _scripts
npm run screenshot-local
```

### Live Site Screenshots
```bash
cd _scripts
npm run screenshot-live
```

### Both Local and Live Screenshots
```bash
cd _scripts
npm run screenshot-both
```

### Generate Animated GIFs
All screenshot commands now automatically generate animated GIFs alongside the screenshots:

```bash
# Screenshots + GIFs for local development
npm run screenshot-local

# Screenshots + GIFs for live site
npm run screenshot-live

# Screenshots + GIFs for both local and live
npm run screenshot-both
```

### Default (local)
```bash
cd _scripts
npm run screenshot
```

## Output

Screenshots are saved to `_screenshots/` at the project root level with the following structure:

```
_screenshots/
├── local/              # Screenshots from local development server
│   ├── desktop/        # Desktop viewport (1200x800)
│   │   ├── 01-main-menu.png
│   │   ├── 02-settings-modal.png
│   │   ├── 03-char-to-morse.png
│   │   ├── 04-morse-to-char.png
│   │   ├── 05-sound-to-char.png
│   │   ├── 06-learn-mode.png
│   │   └── combined.gif         # Animated GIF of all screens
│   └── mobile/         # Mobile viewport (375x667)
│       ├── 01-main-menu.png
│       ├── 02-settings-modal.png
│       ├── 03-char-to-morse.png
│       ├── 04-morse-to-char.png
│       ├── 05-sound-to-char.png
│       ├── 06-learn-mode.png
│       └── combined.gif         # Animated GIF of all screens
└── live/               # Screenshots from live GitHub Pages site
    ├── desktop/        # Desktop viewport (1200x800)
    │   ├── ... (same files)
    │   └── combined.gif
    └── mobile/         # Mobile viewport (375x667)
        ├── ... (same files)
        └── combined.gif
```

### Animated GIFs

All screenshot commands automatically create animated GIFs alongside the screenshots:

- **Desktop GIFs**: 1200x800 viewport showing all app screens
- **Mobile GIFs**: 448x867 viewport showing mobile-optimized views  
- **Timing**: 1 second per frame with infinite loop
- **Format**: High-quality GIFs using ImageMagick (falls back to Sharp if not available)
- **Location**: `combined.gif` in each screenshot directory

The GIFs are perfect for:
- README demonstrations
- Social media posts
- Documentation
- Portfolio showcases

## Scenarios Captured

1. **Main Menu** - Shows all four practice mode options
2. **Settings Modal** - Configuration options and preferences
3. **Character to Morse** - Practice mode interface
4. **Morse to Character** - Practice mode interface  
5. **Sound to Character** - Audio practice mode interface
6. **Learn Mode** - Learning interface

Each scenario is captured in both desktop (1200x800) and mobile (375x667) viewports.

## Customization

Edit `screenshot.js` to:
- Add new scenarios
- Change viewport sizes
- Modify wait conditions
- Add custom actions (clicks, form fills, etc.)
- Change output directory or naming
- Adjust GIF timing and quality settings

### GIF Configuration

You can customize GIF settings in the `config.gif` object:

```javascript
gif: {
  delay: 100,    // Frame delay in centiseconds (100 = 1 second)
  loop: 0,       // 0 = infinite loop
  quality: 80    // Quality setting (0-100)
}
```

## Troubleshooting

- **Local server not running**: Make sure `python3 -m http.server` is running in the project root
- **Live URL incorrect**: Update the `live` URL in the config
- **Screenshots failing**: Check console output for specific error messages
- **Missing elements**: Adjust `waitFor` selectors or add delays
- **GIF creation failing**: 
  - Install ImageMagick for better quality (see Setup section for platform-specific instructions)
  - Script will fall back to Sharp if ImageMagick is unavailable
  - Check that all screenshots were captured successfully first
  - Verify ImageMagick installation: `convert --version`
