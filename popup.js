document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = document.getElementById('enableToggle');
  const statusText = document.getElementById('status');

  chrome.storage.sync.get('enabled', (data) => {
    enableToggle.checked = data.enabled;
    updateStatus(data.enabled);
  });

  enableToggle.addEventListener('change', () => {
    const enabled = enableToggle.checked;
    chrome.storage.sync.set({ enabled: enabled });
    updateStatus(enabled);
    console.log('Extension state changed:', enabled);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggleEnabled", enabled: enabled });
    });
  });

  function updateStatus(enabled) {
    statusText.textContent = enabled ? "Extension is enabled" : "Extension is disabled";
  }
});
