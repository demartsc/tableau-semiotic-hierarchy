const initialData = {
  // measures: [
  //   {id: 'measure1', content: 'Longitude'},
  //   {id: 'measure2', content: 'Latitude'},
  //   {id: 'measure3', content: 'Population'},
  //   {id: 'measure4', content: 'Mobile usage'},
  // ],
  columns: {
    measures: {
      id: 'measures',
      title: 'Fields',
      type: 'measures',
      measures: []
      //measures: ['measure1', 'measure2', 'measure3', 'measure4']
    },
    config_options: {
      id: 'config_options',
      title: 'Hierarchy Fields',
      type: 'options',
      areaIds: ['ConfigParentField', 'ConfigChildField', 'ConfigLabelField', 'ConfigColorField', 'ConfigValueField']
    }
  },
  drop_area: {
    ConfigParentField: {
      id: 'ConfigParentField',
      title: 'Parent',
      type: 'single_drop',
      icon: 'ParentIcon',
      measureId: null, 
      required: true
    },
    ConfigChildField: {
      id: 'ConfigChildField',
      title: 'Child',
      type: 'single_drop',
      icon: 'ChildIcon',
      measureId: null, 
      required: true
    },
    ConfigLabelField: {
      id: 'ConfigLabelField',
      title: 'Label',
      type: 'single_drop',
      icon: 'GeoNameIcon',
      measureId: null, 
      required: true
    },
    ConfigColorField: {
      id: 'ConfigColorField',
      title: 'Color By',
      type: 'single_drop',
      icon: 'FillByIcon',
      measureId: null, 
      required: false
    },
    ConfigValueField: {
      id: 'ConfigValueField',
      title: 'Size by',
      type: 'single_drop',
      icon: 'SizeByIcon',
      measureId: null, 
      required: false
    },
  },
  columnOrder: ['measures', 'config_options']
}

export default initialData;