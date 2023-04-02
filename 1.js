const extensionId = 'cnhfonpeambacbnpcmjmnckcalamhadn';

const Store = ((exports) => {
    exports.Map = {};
    exports.MM = () => {};
    return exports;
})({});

const Batch = ((exports) => {
    exports.run = (n, fn) => {
        const wrapFn = async () => {
            const x = await fn();
            return x === undefined || wrapFn();
        };
        return Promise.all(new Array(n).fill(1).map(i => {
            return wrapFn();
        }));
    }
    return exports;
})({});

const MapFn = ((exports) => {
    exports.new = (Map) => {
        const fn = (p) => {
            const _fn = Map[p];
            const t = typeof _fn;
            return typeof t === 'string' ? fn(_fn) : typeof t === 'function' ? [p, _fn] : [undefined, undefined];
        };
        return fn;
    };
    return exports;
})({});

const Run = ((exports) => {
    exports.run = async (mapFn, p, pFn, msg, onStart) => {
        onStart(p, msg);
        const [_p, fn] = mapFn(p);
        if(_p === undefined) {
            return msg;
        } else {
            const [status, _msg] = await fn(msg);
            return exports.run(mapFn, pFn(p, status), pFn, _msg, onStart);
        }
    };
    return exports;
})({});

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
    exports.qaList = (headers) => {
        return sendMsgToCrx.send(extensionId, sendMsgToCrx.getMsg('https://meta.adwetec.com/prod-api/meta/item/list?pageNum=1&pageSize=9999&parentId=157', {}, headers));
    };
    exports.logList = (headers) => {
        return sendMsgToCrx.send(extensionId, sendMsgToCrx.getMsg('https://meta.adwetec.com/prod-api/meta/project/log?pageNum=1&pageSize=9999&projectId=206&all=1', {}, headers));
    };
    return exports;
})({});

const rasaApi = ((exports) => {
    exports.modelParse = (msg) => {
        return sendMsgToCrx.send(extensionId, sendMsgToCrx.postMsg('https://meta.adwetec.com/prod-api/robot/http-robot-1/model/parse', {
            text: msg
        }, {}));
    };
    return exports;
})({});

const gptApi = ((exports) => {
    exports.modelParse = (msg) => {
        return sendMsgToCrx.send(extensionId, sendMsgToCrx.getMsg('https://meta.adwetec.com/prod-api/robot/http-robot-1/model/parse', {
            text: msg
        }, {}));
    };
    return exports;
})({});

const main0 = async () => {
    const wrapApiLogin = async () => {
        const [headers, msg] = api.login();
        try {
            const token = JSON.parse(msg).data.access_token;
            return ['1', token];
        } catch(e) {
            return ['0', undefined];
        }
    };
    const wrapApiQaList = async () => {
        const [headers, msg] = api.qaList(Store.Map.authHeaders);
        try {
            const qaList = JSON.parse(msg).rows.map(i => {
                return {
                    id: i.id,
                    qs: i.questionList,
                    as: i.answerList
                };
            });
            return ['1', qaList];
        } catch(e) {
            return ['0', undefined];
        }
    };
    const wrapApiLogList = async () => {
        const [headers, msg] = api.logList(Store.Map.authHeaders);
        try {
            const logList = JSON.parse(msg).rows.map(i => {
                return {
                    q: i.question,
                    a: i.msg
                };
            });
            return ['1', logList];
        } catch(e) {
            return ['0', undefined];
        }
    };
    const Map0 = {};
    Map0['0'] = async () => {
        const [status, msg] = await wrapApiLogin();
        return [status, msg];
    };
    Map0['0-0'] = () => {
    };
    Map0['0-1'] = async (msg) => {
        Store.Map.authHeaders = {
            Authorization: msg
        };
        Store.MM();
        const [status, _msg] = await wrapApiQaList();
        return [status, _msg];
    };
    Map0['0-1-0'] = () => {
    };
    Map0['0-1-1'] = async (msg) => {
        Store.Map.qaList = msg;
        Store.MM();
        const [status, _msg] = await wrapApiLogList();
        return [status, _msg];
    };
    Map0['0-1-1-0'] = () => {
    };
    Map0['0-1-1-1'] = async (msg) => {
        Store.Map._logList = msg;
        const Map = Store.Map.qaList.reduce((ret, i) => {
            i.qs.forEach(ii => {
                ret[ii] = 1;
            });
            return ret;
        }, {});
        Store.Map.logList = msg.filter(i => {
            return Map[i.q];
        });
        Store.MM();
        const fn = async ((n) => {
            if(n === 0) {
                return undefined;
            } else {
                const nn = --n;
                const x = await rasaApi.modelParse(Store.Map.logList[nn].q);
                console.log(x);
            }
        })(Store.Map.logList.length);
        await Batch.run(2, fn);
        return ['0', undefined];
    };
    Map0['0-1-1-1-0'] = () => {
    };
    Map0['0-1-1-1-1'] = async () => {
        const fn = async ((n) => {
            if(n === 0) {
                return undefined;
            } else {
                const nn = --n;
                const x = await gptApi.check0(Store.Map.logList[nn]);
                const xx = await gptApi.check1(Store.Map.logList[nn]);
                console.log(x);
            }
        })(Store.Map.logList.length);
        await Batch.run(2, fn);
    };
};

main0();
