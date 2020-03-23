const defaultSettings = {
  defaults: {
    ConfigType: "Tidy Tree",
    networkProjection: "vertical",
    edgeType: "normal",
    markerMinRadius: 1, 
    markerMaxRadius: 25,
    colorConfig: "solid",
    hoverAnnotation: true,
    highlightAnnotation: true,
    nodeSize: 'none', 
    nodeFillOpacity: .35,
    nodeStrokeOpacity: .5, 
    nodeColor: "#767676", 
    nodeRender: "normal", 
    edgeRender: "normal",
    highlightStrokeWidth: 2,
  },
  defaultKeys: [ 
    'ConfigType',
    'networkProjection',
    'edgeType',
    'markerMinRadius',
    'markerMaxRadius',
    'colorConfig',
    'hoverAnnotation',
    'highlightAnnotation',
    'nodeSize', 
    'nodeFillOpacity', 
    'nodeColor',
    'nodeRender',
    'edgeRender',
    'highlightStrokeWidth'
  ]
}

export default defaultSettings;