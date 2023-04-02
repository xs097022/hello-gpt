const extensionId = 'cnhfonpeambacbnpcmjmnckcalamhadn';

const sendMsgToCrx = ((exports) => {
    exports.send = (extensionId, msg) => new Promise((resolve) => {
        chrome.runtime.sendMessage(extensionId, msg, resolve);
    });
    exports.wrap = (t, msg) => {
        return {
            t,
            msg
        };
    };
    exports.postMsg = (url, msg, headers) => {
        return exports.wrap('HTTP', {
            url,
            msg, 
            headers,
            method: 'POST'
        });
    };
    exports.getMsg = (url, msg, headers) => {
        return exports.wrap('HTTP', {
            url,
            msg, 
            headers,
            method: 'GET'
        });
    };
    return exports;
})({});

const api = ((exports) => {
    exports.login = () => {
        return sendMsgToCrx.send(extensionId, sendMsgToCrx.postMsg('https://meta.adwetec.com/prod-api/auth/login', {
            password: "12345",
            username: "MG"
        }, {}));
    };
    exports.qaList = (msg, headers) => {
        return sendMsgToCrx.send(extensionId, sendMsgToCrx.getMsg('https://meta.adwetec.com/prod-api/meta/item/list?pageNum=1&pageSize=9999&parentId=157', msg, headers));
    };
    return exports;
})({});

const main0 = async () => {
    const x = await api.login();
    console.log(x);
};

main0();
