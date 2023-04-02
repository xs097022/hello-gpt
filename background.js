chrome.browserAction.onClicked.addListener(function(tab) {
    window.open(chrome.extension.getURL('index.html'));
});

chrome.runtime.onMessageExternal.addListener(async (request, sender, sendResponse) => {
});
