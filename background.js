chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ enabled: false });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getState") {
    chrome.storage.sync.get("enabled", (data) => {
      sendResponse({ enabled: data.enabled });
    });
    return true;
  }
});
