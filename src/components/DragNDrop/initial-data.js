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
    mark_options: {
      id: 'mark_options',
      title: 'Mark options',
      type: 'options',
      areaIds: ['MarkLonField', 'MarkLatField', 'MarkNameField', 'MarkFillField', 'MarkSizeField']
    },
    choro_options: {
      id: 'choro_options',
      title: 'Choro options',
      type: 'options',
      areaIds: ['ChoroJoinField', 'ChoroNameField', 'ChoroFillField']
    }
  },
  drop_area: {
    MarkLonField: {
      id: 'MarkLonField',
      title: 'Longitude',
      type: 'single_drop',
      icon: 'LongitudeIcon',
      measureId: null
    },
    MarkLatField: {
      id: 'MarkLatField',
      title: 'Latitude',
      type: 'single_drop',
      icon: 'LatitudeIcon',
      measureId: null
    },
    MarkNameField: {
      id: 'MarkNameField',
      title: 'Geo Name',
      type: 'single_drop',
      icon: 'GeoNameIcon',
      measureId: null
    },
    MarkFillField: {
      id: 'MarkFillField',
      title: 'Fill By',
      type: 'single_drop',
      icon: 'FillByIcon',
      measureId: null
    },
    MarkSizeField: {
      id: 'MarkSizeField',
      title: 'Size by',
      type: 'single_drop',
      icon: 'SizeByIcon',
      measureId: null
    },
    ChoroJoinField: {
      id: 'ChoroJoinField',
      title: 'Geo Dimension',
      type: 'single_drop',
      icon: 'GeoIcon',
      measureId: null
    },
    ChoroNameField: {
      id: 'ChoroNameField',
      title: 'Geo Name',
      type: 'single_drop',
      icon: 'GeoNameIcon',
      measureId: null
    },
    ChoroFillField: {
      id: 'ChoroFillField',
      title: 'Fill By',
      type: 'single_drop',
      icon: 'FillByIcon',
      measureId: null
    },
  },
  columnOrder: ['measures', 'mark_options', 'choro_options']
}

export default initialData;