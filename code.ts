figma.root.setRelaunchData({open: 'Open this prototype in a Plugin window.'})

const setPrefs = async (prefs) => {
  return await figma.clientStorage.setAsync('prefs',prefs)
}

const getPrefs = async () => {
  let prefs = await figma.clientStorage.getAsync('prefs')
  return prefs || {
    width: 300, 
    height: 500
  }
}

const getFlowStartingPointId = () => {
  let nodeId = figma.currentPage.id
  if(figma.currentPage.flowStartingPoints.length > 0){
    nodeId = figma.currentPage.flowStartingPoints[0].nodeId
  }
  return nodeId
}

const showPrototype = async (flowStartingPointId = getFlowStartingPointId()) => {

  let prefs = await getPrefs()
  
  let prototypeUrl = `https://www.figma.com/proto/${figma.fileKey}/?node-id=${flowStartingPointId}&hotspot-hints=0&scaling=contain&hide-ui=1&show-proto-sidebar=1`

  let embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(prototypeUrl)}`

  let flows = figma.currentPage.flowStartingPoints

  // This shows the HTML page in "ui.html".
  figma.showUI(
    `<style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }
      html{
        background: black;
      }
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
      #flows{
        position: fixed;
        bottom: 12px;
        left: 12px;
      }
      select{
        padding: 4px 24px 4px 8px;
        border-radius: 4px;
        appearance: none;
        border: 0;
        color: rgba(255,255,255,0.5);
        user-select: none;
        appearance: none;
        display: block;
        outline: 0;
        font-size: 11px;
        font-weight: bold;
        box-shadow: 0 0 0 4px rgba(255,255,255,0), 0 0 0 1px rgba(255,255,255,0.2);
        background: rgba(0,0,0,0.4) right center no-repeat url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.646 13.354L8.646 10.354L9.354 9.646L12 12.293L14.646 9.646L15.354 10.354L12.354 13.354L12 13.707L11.646 13.354Z" fill="rgba(255,255,255,0.5)"/></svg>');
      }
      select:hover{
        color: rgba(255,255,255,1);
        box-shadow: 0 0 0 4px rgba(255,255,255,0.15), 0 0 0 1px rgba(255,255,255,1);
        background-color: rgba(0,0,0,0.6);
      }
      select:after{
        content: '';
        padding-right: 8px;
      }
    </style>
    <iframe id="preview" src="${embedUrl}" allowfullscreen></iframe>
    ${ flows.length > 1? `<select id="flows">${flows.map(flow => `<option value="${flow.nodeId}" ${flow.nodeId === flowStartingPointId? "selected" : ""}>${flow.name}</option>`).join('')}</select>` : '' }
    <script>
      let iframe = document.getElementById('preview');
      let flows = document.getElementById('flows');
      let observer = new MutationObserver((mutations) => {
        parent.postMessage({pluginMessage: {width: iframe.clientWidth, height: iframe.clientHeight}},"*")
      })
      observer.observe(iframe, { attributes: true });
      if(flows){
        flows.addEventListener('input',(e,flow) => {
          parent.postMessage({pluginMessage: {flowStartingPointId: flows.value}},"*")
        })
      }
    </script>`,
    prefs
  );
  
  figma.ui.on('message', (msg) => {
    let {height, width, flowStartingPointId} = msg
    if(height && width){
      figma.ui.resize(width, height)
      setPrefs({width: width, height: height})
    } else if(flowStartingPointId){
      showPrototype(flowStartingPointId)
    }
  })

}
showPrototype()