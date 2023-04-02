chrome.browserAction.onClicked.addListener(function(tab) {
    window.open(chrome.extension.getURL('index.html'));
});

const MapMsgFn = {};

MapMsgFn.HTTP = (msg) => {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open(msg.method, msg.url);
        Object.keys(msg.headers).forEach((k) => {
            xhr.setRequestHeader(k, msg.headers[k]);
        });
        const _msg = Object.keys(msg.msg).reduce((ret, i) => {
            return `${ret}&${i}=${encodeURIComponent(msg.msg[i])}`;
        }, '').slice(1);
        xhr.send(_msg);
        xhr.onload = () => {
            resolve([xhr.getAllResponseHeaders(), xhr.response]);
        };
    });
};

chrome.runtime.onMessageExternal.addListener(async (request, sender, sendResponse) => {
    const x = await MapMsgFn[request.t](request.msg);
    sendResponse(x);
});
