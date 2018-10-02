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
      title: 'Measures',
      type: 'measures',
      measures: []
      //measures: ['measure1', 'measure2', 'measure3', 'measure4']
    },
    config_options: {
      id: 'config_options',
      title: 'Config options',
      type: 'options',
      areaIds: ['ConfigParentField', 'ConfigChildField', 'ConfigColorField', 'ConfigValueField']
    },
    blank_options: {
      id: 'blank_options',
      title: 'Blank options',
      type: 'options',
      areaIds: []
    }
  },
  drop_area: {
    ConfigParentField: {
      id: 'ConfigParentField',
      title: 'Parent',
      type: 'single_drop',
      icon: 'LongitudeIcon',
      measureId: null
    },
    ConfigChildField: {
      id: 'ConfigChildField',
      title: 'Child',
      type: 'single_drop',
      icon: 'LatitudeIcon',
      measureId: null
    },
    ConfigColorField: {
      id: 'ConfigColorField',
      title: 'Color By',
      type: 'single_drop',
      icon: 'FillByIcon',
      measureId: null
    },
    ConfigValueField: {
      id: 'ConfigValueField',
      title: 'Size by',
      type: 'single_drop',
      icon: 'SizeByIcon',
      measureId: null
    },
  },
  columnOrder: ['measures', 'config_options', 'blank_options']
}

export default initialData;