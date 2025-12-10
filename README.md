# LunaFrost Translator Extension

<p align="center">
  <img src="icons/logo_transparent_resized.png" alt="LunaFrost Logo" height="120">
</p>

A browser extension for extracting Korean web novel content from Novelpia and sending it to your LunaFrost translator server for translation.

## Features

### Single Chapter Import
- Import the currently open chapter directly to your translator
- Automatically extracts chapter title, number, and content
- Validates content to filter out paywalls and commercial messages

### Batch Chapter Import
- Automatically detect all available chapters from a novel's page
- Import multiple chapters in a specified range
- Concurrent tab support (1-10 tabs) for faster imports
- Real-time progress tracking with success/failure counts
- Skip duplicate chapters that already exist

### Auto-Translate Settings
- **Auto Translate Chapter Title** – Automatically translate chapter titles on import
- **Auto Translate Chapter Content** – Automatically translate full chapter content on import

### Novel Metadata Import
- Extract novel metadata including:
  - Title (preserves Korean text)
  - Author
  - Tags
  - Synopsis
  - Cover image URL

## Installation

### Firefox
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click **"Load Temporary Add-on..."**
3. Select the `manifest.json` file from this project

### Chrome / Edge
1. Open the browser and navigate to `chrome://extensions/` (or `edge://extensions/`)
2. Enable **Developer mode** (toggle in the top right)
3. Click **"Load unpacked"**
4. Select the project folder containing `manifest.json`

- I have submited the extension to the firefox add-on store, but it has not been approved yet. Same with the Google Chrome Web Store.

## Configuration

1. Click the LunaFrost extension icon in your browser toolbar
2. Go to the **Settings** tab
3. Configure the following:
   - **Server URL**: Your LunaFrost translator server address (e.g., `http://localhost:5000`)
   - **Max Concurrent Tabs**: Number of tabs for parallel batch imports (1-10)
   - **Auto-Translate Options**: Toggle automatic translation for titles and/or content

## Usage

### Single Chapter Import
1. Navigate to a chapter page on Novelpia
2. Click the LunaFrost extension icon
3. Click **"Import Current Chapter"**

### Batch Import
1. Navigate to a novel's main page on Novelpia
2. Click the LunaFrost extension icon
3. Click **"Detect Chapters"** to scan available chapters
4. Set the chapter range (start and end)
5. Click **"Start Auto Batch Import"**
6. **Keep the popup open** during batch imports

## Technical Details

- **Manifest Version**: 3 (MV3)
- **Permissions**: `storage`, `scripting`
- **Host Permissions**: All URLs (`<all_urls>`)
- **Browser Compatibility**: Chrome, Firefox (with `browser_specific_settings`), Edge

## Requirements

- A running LunaFrost translator server
- Access to Novelpia chapters (some content may require authentication on the site)

## Important Notes

- Keep the extension popup **open** during batch imports
- Paywall/subscription content will be automatically detected and skipped
- The extension preserves Korean text (Hangul) during extraction for accurate translation
- The extension will not work if you are using a VPN or proxy
- Novelpia may tempoarly rate limit you if you do a lot of requests in a short amount of time, I have found 5 at a time to be a good sweet spot. Even for 200+ chapters at once.

## License

This project is licensed under the **GNU AGPLv3 License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>LunaFrost Translator Extension</strong> v1.0.0
</p>
