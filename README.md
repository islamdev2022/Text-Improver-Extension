# Text Improver Chrome Extension

A Chrome extension that allows you to improve selected text using a real API of gemini.

## Features

- Right-click context menu integration for selected text
- Beautiful tooltip display for improved text
- Copy to clipboard functionality
- Replace text functionality
- Responsive positioning based on text selection
- Clean and modern UI

## Installation

1. Clone or download this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top right corner
4. Click "Load unpacked" button
5. Select the directory containing the extension files
6. The extension is now installed and ready to use

## How to Use

1. Select any text on any webpage
2. Right-click the selected text
3. Choose "Improve Text" from the context menu
4. Wait for the improved text to appear in the tooltip
5. Click "Copy to clipboard" to copy the improved text or "Replace text" to replace the selected text with the improved text
6. Click anywhere outside the tooltip to close it

## File Structure

- `manifest.json` - Extension configuration and permissions
- `background.js` - Handles context menu creation and click events
- `content.js` - Manages tooltip display and text improvement functionality
- `styles.css` - Styling for the tooltip and buttons

## Technical Details

### Permissions Used
- `contextMenus` - For adding the right-click menu option
- `activeTab` - For accessing the current tab's content
- `clipboardWrite` - For copying text to clipboard

### Components
- Context Menu Integration
- Tooltip System
- Clipboard Management
- Event Handling

## Customization

To integrate with a real API:
1. Modify the `improveText` function in `content.js`
2. Handle the API response appropriately

## Development

To modify the extension:
1. Make your changes to the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Your changes will be applied immediately

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License. 