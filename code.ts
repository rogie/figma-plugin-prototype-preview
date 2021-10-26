const setPrefs = async (prefs) => {
  await figma.clientStorage.setAsync('prefs',prefs)
}

const getPrefs = async () => {
  return await figma.clientStorage.getAsync('prefs') || {
    width: 300, 
    height: 500
  }
}

const getSelectedNodeId = () => {
  let nodeId = ''
  if(figma.currentPage.selection.length > 0){
    nodeId = figma.currentPage.selection[0].id
  }
  return nodeId
}

const showPrototype = async () => {
  let prefs = await getPrefs()
  
  let prototypeUrl = `https://www.figma.com/proto/${figma.fileKey}/?node-id=${getSelectedNodeId()}&hotspot-hints=0&scaling=contain&hide-ui=1`
  console.log(prototypeUrl)

  let embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(prototypeUrl)}`

  // This shows the HTML page in "ui.html".
  figma.showUI(
    `<style>
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
    </script>`,
    prefs
  );
  figma.ui.on('message', (prefs) => {
    figma.ui.resize(prefs.width, prefs.height)
    setPrefs(prefs)
  })

}
showPrototype()

figma.on('selectionchange', showPrototype)
