chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ enabled: false });
  chrome.storage.sync.set({ GROQ_API_KEY: 'YOUR_ACTUAL_API_KEY_HERE' });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getState") {
    chrome.storage.sync.get("enabled", (data) => {
      sendResponse({ enabled: data.enabled });
    });
    return true;
  }
});
