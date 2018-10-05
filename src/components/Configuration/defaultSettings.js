const defaultSettings = {
  defaults: {
    ConfigType: "Tidy Tree",
    networkProjection: "vertical",
    edgeType: "curve",
    markerMinRadius: 1, 
    markerMaxRadius: 25,
    colorConfig: "field",
    hoverAnnotation: true,
    nodeSize: 'none', 
    nodeFillOpacity: .35,
    nodeStrokeOpacity: .5, 
    nodeColor: "#CCCCCC", 
    nodeRender: "normal", 
    edgeRender: "normal",
  },
  defaultKeys: [ 
    'ConfigType',
    'networkProjection',
    'edgeType',
    'markerMinRadius',
    'markerMaxRadius',
    'colorConfig',
    'hoverAnnotation',
    'nodeSize', 
    'nodeFillOpacity', 
    'nodeColor',
    'nodeRender',
    'edgeRender'
  ]
}

export default defaultSettings;