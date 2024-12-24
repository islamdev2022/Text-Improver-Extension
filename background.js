chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "improveText",
    title: "Improve Text",
    contexts: ["selection"]
  });
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "improveText" && info.selectionText) {
    // Make API request to improve text
    fetch('https://wwr60h.buildship.run/text-improver-api', {
      method: 'POST',
      body: JSON.stringify({
        text: info.selectionText,
        contents: info.selectionText  // Adding contents field that API seems to expect
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(async response => {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`API Error: ${text}`);
      }
      return text;
    })
    .then(improvedText => {
      // Send improved text to content script
      chrome.tabs.sendMessage(tab.id, {
        action: "improveText",
        text: improvedText
      });
    })
    .catch(error => {
      console.error('Error:', error);
      // Notify user of error through content script
      chrome.tabs.sendMessage(tab.id, {
        action: "improveText",
        text: "Sorry, there was an error improving the text. Please try again."
      });
    });
  }
});