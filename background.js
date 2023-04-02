console.log('pbledfcfnijoghpdgapfbbghlofgmfmn');

const Map = {};
const Map2 = {};
const MapMap2 = {};
const Map2Map = {};

const Control = ((Map, Map2, MapMap2) => {
    const safeCb = (id2, cb) => {
        const id = Map2Map[id2];
        if(id) {
            const w = Map[id];
            if(w) {
                cb(w);
            }
        }
    };
    const close2 = (id2) => {
        const id = Map2Map[id2];
        if(id) {
            delete(Map2Map[id2]);
            delete(MapMap2[id]);
        }
        const w2 = Map2[id2];
        if(w2) {
            delete(Map2[id2]);
            w2.close();
        }
    };
    const close = (id) => {
        const id2 = MapMap2[id];
        close2(id2);
    };
    const create = async (id) => {
        if(MapMap2[id]) {
            close(id);
            return
        }
        const id2 = Math.random() * 10000000 >> 0;
        const appWindow = await new Promise(resolve => {
            chrome.app.window.create('2.html', {
                id: id2 + '',
                innerBounds: {
                    width: 200,
                    height: 500
                },
                frame: 'none'
            }, appWindow => {
                appWindow.contentWindow.onload = () => {
                    resolve(appWindow);
                };
            });
        });
        appWindow.contentWindow.document.querySelector('.close').addEventListener('click', () => {
            close2(id2);
        });
        appWindow.contentWindow.document.querySelector('.c0').addEventListener('click', () => {
            safeCb(id2, (w) => {
                w.contentWindow.document.getElementById('webview').executeScript({
                    code: `document.getElementById('virtual').contentWindow.postMessage({
                    type: 'controll',
                    data: 'c0',
                  })`
                });
            });
        });
        appWindow.contentWindow.document.querySelector('.c1').addEventListener('click', () => {
            safeCb(id2, (w) => {
                w.contentWindow.document.getElementById('webview').executeScript({
                    code: `document.getElementById('virtual').contentWindow.postMessage({
                    type: 'controll',
                    data: 'c1',
                  })`
                });
            });
        });
        appWindow.contentWindow.document.querySelector('.c2').addEventListener('click', () => {
            safeCb(id2, (w) => {
                w.contentWindow.document.getElementById('webview').executeScript({
                    code: `document.getElementById('virtual').contentWindow.postMessage({
                    type: 'controll',
                    data: 'c2',
                  })`
                });
            });
        });
        appWindow.contentWindow.document.querySelector('.c3').addEventListener('click', () => {
            safeCb(id2, (w) => {
                w.contentWindow.document.getElementById('webview').executeScript({
                    code: `document.getElementById('virtual').contentWindow.postMessage({
                    type: 'controll',
                    data: 'c3',
                  })`
                });
            });
        });
        appWindow.onClosed.addListener(() => {
            close2(id2);
        });
        Map2[id2] = appWindow;
        MapMap2[id] = id2;
        Map2Map[id2] = id;
        //Object.values(Map).forEach(i => i.contentWindow.document.getElementById('webview').setZoom(1 / window.devicePixelRatio));
    };
    return {
        create,
        close,
    };
})(Map, Map2, MapMap2)

const create = async (config) => {
    const id = Math.random() * 10000000 >> 0;
    const appWindow = await new Promise(resolve => {
        const w = Math.floor(config.w || (720 / window.devicePixelRatio));
        const h = Math.floor(config.h || (1280 / window.devicePixelRatio));
        chrome.app.window.create('1.html', {
            id: id + '',
            innerBounds: {
                width: 100,
                height: 9999,
                //minWidth: w,
                //minHeight: h,
                //maxWidth: w,
                //maxHeight: h
            },
            frame: 'none',
            resizable: false
        }, (appWindow) => {
            const maxH = appWindow.innerBounds.height;
            const hh = Math.min(h, maxH - 32 -2);
            const ww = hh / h * w;
            appWindow.setBounds({
                width: Math.floor(ww),
                height: Math.floor(hh + 32)
            });
            appWindow.contentWindow.onload = function() {
                const webview = appWindow.contentWindow.document.getElementById('webview');
                webview.addEventListener('permissionrequest', (e) => {
                    if (e.permission === 'media') {
                        e.request.allow();
                    }
                });
                resolve(appWindow);
            };
        });
    });
    appWindow.contentWindow.document.querySelector('.r.control').addEventListener('click', () => {
        Control.create(id);
    });
    const webview = appWindow.contentWindow.document.getElementById('webview');
    webview.setZoom(1 / window.devicePixelRatio);
    //webview.src = 'https://meta.zw.adwetec.cn/stage-api/meta/live/page/182?name=sssss';
    config.url && (webview.src = config.url);
    Map[id] = appWindow;
    appWindow.onClosed.addListener(() => {
        delete(Map[id]);
        Control.close(id);
    });
    //Object.values(Map).forEach(i => i.contentWindow.document.getElementById('webview').setZoom(1 / window.devicePixelRatio));
    return id;
};

chrome.runtime.onMessageExternal.addListener(async (request, sender, sendResponse) => {
    const req = request || {};
    const fn = ({
        async create(req) {
            const id = await create(req);
            return id;
        },
        close(req) {
            Map[req.id] && Map[req.id].close();
            return 'OK';
        },
        checkInstall(req) {
            return true;
        }
    })[req.type]
    sendResponse(fn && await fn(req));
});

//103.31.115.50:15987
//119.252.73.161:15987
//root / 4Ch435@K7i
