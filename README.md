# Groq Form Assistant Chrome Extension

This Chrome extension uses the Groq API to suggest answers for Google Form questions.

## Installation

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click on "Load unpacked" and select the directory containing the extension files.

## Usage

1. Navigate to a Google Form.
2. Click on the extension icon in the Chrome toolbar to open the popup.
3. Toggle the switch to enable or disable the extension.
4. Hover over form questions to see suggested answers from the Groq API.

## Development

To set up the development environment:

1. Ensure you have Node.js installed.
2. Run `npm install` to install the required dependencies.
3. Use `npx http-server . -p 8000` to serve the extension files locally for testing.

## Files

- `manifest.json`: Extension configuration
- `background.js`: Background script for managing extension state
- `popup.html` and `popup.js`: Extension popup interface
- `content.js`: Content script for interacting with Google Forms
- `groq_api.js`: Handles API calls to the Groq service

## Note

Make sure to set the `GROQ_API_KEY` environment variable with your Groq API key before using the extension.

