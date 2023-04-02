const extensionId = 'cnhfonpeambacbnpcmjmnckcalamhadn';

const Msg = ((exports) => {
    const t = document.getElementById('msg');
    exports.set = (msg) => {
        t.innerHTML = msg;
    };
    return exports;
})({});

const Canvas = ((exports) => {
    const t = document.getElementById('canvas');
    exports.set = (fn) => {
        t.innerHTML =  (Store.Map.logList || []).filter(fn).map((i, index) => {
            return `
            <div class="tr" data-index="${index}">
                <div>
                    <textarea></textarea>
                </div>
                <div>
                    <textarea></textarea>
                </div>
                <div>
                    <i>RASA命中22</i>
                    <i>GPT命中22</i>
                </div>
                <div>
                    <button>标记</button>
                </div>
            </div>
            `;
        }).join('\n');
    };
    return exports;
})({});

const Filter = ((exports) => {
    const t = document.getElementById('filter');
    [].forEach.call(t.querySelectorAll('i'), (i) => {
        i.addEventListener('click', (e) => {
            if(!i.getAttribute('selected')) {
                t.querySelector('[selected]').removeAttribute('selected');
                i.setAttribute('selected', true);
                exports.set(i.dataset.index);
            }
        });
    });
    exports.set = (index) => {
        const fn = [
            i => !i.rasa && !i.check0,
            i => i.rasa && !i.check0,
            i => !i.rasa && i.check0 && !i.check1.length,
            i => i.rasa && i.check0 && !i.check1.length,
            i => !i.rasa && i.check0 && i.check1.length,
            i => i.rasa && i.check0 && i.check1.length && i.check1.indexOf(i.rasa) === -1,
            i => i.rasa && i.check0 && i.check1.length && i.check1.indexOf(i.rasa) !== -1,
            i => i.flag
        ][index];
        Canvas.set(fn);
    };
    return exports;
})({});

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
            return t === 'string' ? fn(_fn) : t === 'function' ? [p, _fn] : [undefined, undefined];
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
    exports.say = async (msg) => {
        try {
            const [headers, res] = await sendMsgToCrx.send(extensionId, sendMsgToCrx.getMsg('https://web-gpt-demo.com/chat/?username=1&content=' + encodeURIComponent(msg) + '&_stream=true', {}, {}));
            const xs = res.split('\n');
            return JSON.parse(JSON.parse(xs[xs.length -3].slice(5)).body).response;
        } catch(e) {
            return '';
        }
    };
    return exports;
})({});

const main0 = async () => {
    const wrapApiLogin = async () => {
        const [headers, msg] = await api.login();
        try {
            const token = JSON.parse(msg).data.access_token;
            return ['1', token];
        } catch(e) {
            return ['0', undefined];
        }
    };
    const wrapApiQaList = async () => {
        const [headers, msg] = await api.qaList(Store.Map.authHeaders);
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
        const [headers, msg] = await api.logList(Store.Map.authHeaders);
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
    const wrapGptCheck0 = async (msg) => {
        const _msg = await gptApi.say(Store.Map.Check0Msg.replace(/{MSG}/g, msg));
        return /是/.test(_msg);
    };
    const wrapGptCheck1 = async (msg0, msg1) => {
        const _msg = await gptApi.say(Store.Map.Check1Msg.replace(/{MSG0}/g, msg0).replace(/{MSG1}/g, msg1));
        return /是/.test(_msg);
    };
    const Map0 = {};
    Map0['0'] = async () => {
        const [status, msg] = await wrapApiLogin();
        return [status, msg];
    };
    Map0['0-0'] = () => {
        Msg.set('同步失败')
        return ['1', undefined];
    };
    Map0['0-1'] = async (msg) => {
        Msg.set('开始同步问答库')
        Store.Map.authHeaders = {
            Authorization: msg
        };
        Store.MM();
        const [status, _msg] = await wrapApiQaList();
        return [status, _msg];
    };
    Map0['0-1-0'] = () => {
        Msg.set('同步问答库失败')
        return ['1', undefined];
    };
    Map0['0-1-1'] = async (msg) => {
        Msg.set('开始同步问答记录')
        Store.Map.qaList = msg;
        Store.MM();
        const [status, _msg] = await wrapApiLogList();
        return [status, _msg];
    };
    Map0['0-1-1-0'] = () => {
        Msg.set('同步问答记录失败')
        return ['1', undefined];
    };
    Map0['0-1-1-1'] = async (msg) => {
        Msg.set('开始RASA命中')
        Store.Map._logList = msg;
        const Map = Store.Map.qaList.reduce((ret, i) => {
            i.qs.forEach(ii => {
                ret[ii] = 1;
            });
            return ret;
        }, {});
        const Map1 = Store.Map.qaList.reduce((ret, i) => {
            ret[i.id] = i.qs[0];
            return ret;
        }, {});
        Store.Map.logList = msg.filter(i => {
            return Map[i.q];
        });
        Store.MM();
        const ret = ['1', undefined];
        const fn = ((n) => {
            return async () => {
                if(n === 0) {
                    return undefined;
                } else {
                    const nn = --n;
                    const [_, x] = await rasaApi.modelParse(Store.Map.logList[nn].q);
                    try {
                        Store.Map.logList[nn]._rasa = JSON.parse(x);
                        try {
                            const name =Store.Map.logList[nn]._rasa.intent.name;
                            if(name !== 'nlu_fallback') {
                                Store.Map.logList[nn].rasa = Map1[name.replace(/intent/, '')];
                            }
                        }
                        Store.MM();
                    } catch(e) {
                        n = 0;
                        ret[0] = '0';
                    }
                    return 1;
                }
            };
        })(Store.Map.logList.length);
        await Batch.run(100, fn);
        return ret;
    };
    Map0['0-1-1-1-0'] = () => {
        Msg.set('RASA命中失败')
        return ['1', undefined];
    };
    Map0['0-1-1-1-1'] = async () => {
        Msg.set('开始GPT相关')
        const ret = ['1', undefined];
        const fn = ((n) => {
            return async () => {
                if(n === 0) {
                    return undefined;
                } else {
                    const nn = --n;
                    const x = Store.Map.logList[nn].check0 = await wrapGptCheck0(Store.Map.logList[nn].q);
                    Store.Map.logList[nn].check1 = [];
                    Store.MM();
                    return 1;
                }
            };
        })(Store.Map.logList.length);
        await Batch.run(100, fn);
        return ret;
    };
    Map0['0-1-1-1-1-0'] = () => {
        Msg.set('GPT相关失败');
        return ['1', undefined];
    };
    Map0['0-1-1-1-1-1'] = async () => {
        Msg.set('开始GPT命中');
        const ret = ['1', undefined];
        const fn = ((n) => {
            return async () => {
                if(n === 0) {
                    return undefined;
                } else {
                    const nn = --n;
                    const index = nn / Store.Map.qaList.length >> 0;
                    const indexindex = nn % Store.Map.qaList.length >> 0;
                    if(Store.Map.logList[index].check0 && indexindex < 20) {
                        const q = Store.Map.logList[index].q;
                        const qq = Store.Map.qaList[indexindex].qs[0];
                        const f = await wrapGptCheck1(q, qq);
                        f && Store.Map.logList[index].check1.push(qq);
                        Store.MM();
                    }
                    return 1;
                }
            };
        })(Store.Map.logList.length * Store.Map.qaList.length);
        await Batch.run(100, fn);
        return ret;
    };
    Map0['0-1-1-1-1-1-0'] = () => {
        Msg.set('GPT命中失败');
        return ['1', undefined];
    };
    Map0['0-1-1-1-1-1-1'] = () => {
        Msg.set('GPT命中结束');
        return ['1', undefined];
    };
    //Run.run(MapFn.new(Map0), '0', (p, status) => p + '-' + status, {}, () => {});
    document.getElementById('start').addEventListener('click', () => {
        Store.Map = {
            Check0Msg: '你是如何理解这句话的------请用“是”或“否”来回答，用户的这个问题的真实意图是“和汽车相关”吗：“{MSG0}”',
            Check1Msg: '你是如何理解这句话的------请用“是”或“否”来回答，用户的这个问题的真实意图是“{MSG1}”吗：“{MSG0}”',
        };
        Store.MM();
        Msg.set('开始');
        Run.run(MapFn.new(Map0), '0', (p, status) => p + '-' + status, {}, () => {});
    });
};

main0();
