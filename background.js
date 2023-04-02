chrome.browserAction.onClicked.addListener(function(tab) {
    window.open(chrome.extension.getURL('index.html'));
});

const MapMsgFn = {};

MapMsgFn.HTTP = (msg) => {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open(msg.method, msg.url);
        xhr.setRequestHeader('Content-Type', 'application/json;ccharset=UTF-8');
        Object.keys(msg.headers).forEach((k) => {
            xhr.setRequestHeader(k, msg.headers[k]);
        });
        xhr.send(JSON.stringify(msg.msg));
        xhr.onload = () => {
            resolve([xhr.getAllResponseHeaders(), xhr.response]);
        };
        xhr.onerror = () => {
            resolve(undefined, undefined);
        };
    });
};

chrome.runtime.onMessageExternal.addListener(async (request, sender, sendResponse) => {
    const x = await MapMsgFn[request.t](request.msg);
    sendResponse(x);
});
