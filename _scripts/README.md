# Screenshot Automation Scripts

This directory contains Puppeteer scripts to automatically take screenshots of the Morse Code Trainer app.

## Setup

1. Install dependencies:
   ```bash
   cd _scripts
   npm install
   ```

2. Update the live URL in `screenshot.js`:
   ```javascript
   live: 'https://yourusername.github.io/morse_code'
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
│   │   └── 06-learn-mode.png
│   └── mobile/         # Mobile viewport (375x667)
│       ├── 01-main-menu.png
│       ├── 02-settings-modal.png
│       ├── 03-char-to-morse.png
│       ├── 04-morse-to-char.png
│       ├── 05-sound-to-char.png
│       └── 06-learn-mode.png
└── live/               # Screenshots from live GitHub Pages site
    ├── desktop/        # Desktop viewport (1200x800)
    │   └── ... (same files)
    └── mobile/         # Mobile viewport (375x667)
        └── ... (same files)
```

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

## Troubleshooting

- **Local server not running**: Make sure `python3 -m http.server` is running in the project root
- **Live URL incorrect**: Update the `live` URL in the config
- **Screenshots failing**: Check console output for specific error messages
- **Missing elements**: Adjust `waitFor` selectors or add delays
