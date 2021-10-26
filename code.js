var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.root.setRelaunchData({ open: 'Open this prototype in a Plugin window.' });
const setPrefs = (prefs) => __awaiter(this, void 0, void 0, function* () {
    yield figma.clientStorage.setAsync('prefs', prefs);
});
const getPrefs = () => __awaiter(this, void 0, void 0, function* () {
    return (yield figma.clientStorage.getAsync('prefs')) || {
        width: 300,
        height: 500
    };
});
const getSelectedNodeId = () => {
    let nodeId = '';
    if (figma.currentPage.selection.length > 0) {
        nodeId = figma.currentPage.selection[0].id;
    }
    return nodeId;
};
const showPrototype = () => __awaiter(this, void 0, void 0, function* () {
    let prefs = yield getPrefs();
    let prototypeUrl = `https://www.figma.com/proto/${figma.fileKey}/?node-id=${getSelectedNodeId()}&hotspot-hints=0&scaling=contain&hide-ui=1`;
    console.log(prototypeUrl);
    let embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(prototypeUrl)}`;
    // This shows the HTML page in "ui.html".
    figma.showUI(`<style>
      iframe, html, body{
        border: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        resize: both;
        min-width: 100px;
        min-height: 100px;
        max-width: 800px;
        max-height: 600px;
      }
    </style>
    <iframe id="preview" src="${embedUrl}" allowfullscreen></iframe>
    <script>
      let iframe = document.getElementById('preview');
      let observer = new MutationObserver((mutations) => {
        parent.postMessage({pluginMessage: {width: iframe.clientWidth, height: iframe.clientHeight}},"*")
      })
      observer.observe(iframe, { attributes: true })
    </script>`, prefs);
    figma.ui.on('message', (prefs) => {
        figma.ui.resize(prefs.width, prefs.height);
        setPrefs(prefs);
    });
});
showPrototype();
figma.on('selectionchange', () => {
    if (figma.currentPage.selection.length > 0) {
        figma.currentPage.selection[0].setRelaunchData({ open: 'Open this prototype in a Plugin window.' });
    }
    showPrototype();
});
