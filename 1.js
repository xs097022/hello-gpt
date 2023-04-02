const webview = document.getElementById('webview');
webview.onloadstop = _ => {
    webview.executeScript({
        code: `document.addEventListener('keydown', e => e.key === 'F5' && location.reload());`
    });
};
webview.onzoomchange = (e) => {
    if(e.newZoomFactor != 1 / window.devicePixelRatio && e.newZoomFactor !== e.oldZoomFactor) {
        webview.setZoom(1 / window.devicePixelRatio);
    }
};
document.querySelector('.top .close').addEventListener('click', _ => window.close());
