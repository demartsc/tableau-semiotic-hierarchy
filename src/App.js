import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';

//semiotic
import { ResponsiveNetworkFrame } from 'semiotic';
import { flareData } from './data/flare.js';

//lodash
import _ from 'lodash';


// Custom config components
import SplashScreen from './components/SplashScreen';
import { 
  PickType, 
  PickSheets, 
  CustomizeAnnotation,
  CustomizeHierarchy, 
  Stepper, 
  StepButtons,
} from './components/Configuration'

// drag and drop 
import DragNDrop from './components/DragNDrop/DragNDrop';
import initialData from './components/DragNDrop/initial-data';

// import CustomizeOptions from './components/CustomizeOptions';
import { ConfigScreen, CustomScreen } from './components/Configuration';

// Viz components
import LoadingIndicatorComponent from './components/LoadingIndicatorComponent';
import SemioticHierarchy from './components/SemioticHierarchy';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import classNames from 'classnames';

// Tableau Styles and Tableau
import './assets/tableau/vendor/slick.js/slick/slick.css';
import './assets/tableau/css/style.min.css';
import { tableau } from './tableau-extensions-1.latest';

// tableau settings handler
import * as TableauSettings from './TableauSettings';

// initial default settings
import defaultSettings from './components/Configuration/defaultSettings';

// utils and variables
import { 
  defaultColor, 
  DataBlick,
  semioticTypes
} from './variables';
import { 
  convertRowToObject,
  log
} from './utils';

// icons
import Save from '@material-ui/icons/Save';
import Delete from '@material-ui/icons/Delete';

//logos
import dbLogo from './assets/dblogo.png';
import ssLogo from './assets/sslogo.jpg';
import semLogo from './assets/semiotic_logo_horizontal.png'


// begin constants to move to another file later
// material ui styles
const styles = theme => ({
  root: {
    display: 'flex',
  },
  button: {
    margin: theme.spacing.unit,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  iconSmall: {
    fontSize: 20,
  },
});


const tableauExt = window.tableau.extensions;

//tableau get summary data options
const options = {
         ignoreAliases: false,
         ignoreSelection: true,
         maxRows: 0
};

// end constants to move to another file later

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      isConfig: this.props.isConfig || false,
      isAnnotation: this.props.isAnnotation || false,
      isLoading: true,
      isSplash: true,
      configuration: false,
      annotation: false,
      height: 300,
      width: 300,
      dashboardName: '',
      sheetNames: [],
      tableauSettings: [],
      demoType: "tree",
      stepIndex: 1,
      isMissingData: true,
      highlightOn: undefined
    };

    TableauSettings.setEnvName(this.props.isConfig ? "CONFIG" : this.props.isAnnotation ? "ANNOTATION" : "EXTENSION");
    this.unregisterEventFn = undefined;

    this.clickCallBack = this.clickCallBack.bind(this);
    this.hoverCallBack = this.hoverCallBack.bind(this);
    this.filterChanged = this.filterChanged.bind(this);
    this.marksSelected = this.marksSelected.bind(this);
    this.getSummaryData = this.getSummaryData.bind(this);
    this.configCallBack = this.configCallBack.bind(this);
    this.eraseCallBack = this.eraseCallBack.bind(this);
    this.customCallBack = this.customCallBack.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.demoChange = this.demoChange.bind(this);
    this.clearSheet = this.clearSheet.bind(this);
    this.clearSplash = this.clearSplash.bind(this);
    this.configure = this.configure.bind(this);
    this.configureAnnotation = this.configureAnnotation.bind(this);
    this.onNextStep = this.onNextStep.bind(this);
    this.onPrevStep = this.onPrevStep.bind(this);
  }


  onNextStep() {
    if ( this.state.stepIndex === 4 && this.state.isConfig === true) {
      this.customCallBack('configuration');
    } else if ( this.state.stepIndex === 1 && this.state.isAnnotation === true) {
      this.customCallBack('annotation');
    }
    else {
      this.setState((previousState, currentProps) => {
        return { stepIndex: previousState.stepIndex + 1 }
      });
    }
  }
  
  onPrevStep() {
    this.setState((previousState, currentProps) => {
      return {stepIndex: previousState.stepIndex - 1}
    });
  }

  clickCallBack = d => {
    console.log('in on click callback', d);
    // go through each worksheet and select marks
    if ( d ) {
      tableauExt.dashboardContent.dashboard.worksheets.map((worksheet) => {
        console.log(`clicked ${d.id}: in sheet loop`, worksheet.name, worksheet, tableauExt.settings.get("ConfigSheet") );
        // filter
        if ( worksheet.name !== tableauExt.settings.get("ConfigSheet") ) {
          // worksheet.clearFilterAsync(tableauExt.settings.get("ConfigChildField")).then(
            // first we are going to filter the companion sheets based on click
            worksheet.applyFilterAsync(
              tableauExt.settings.get("ConfigChildField"), 
              [d.id],
              window.tableau.FilterUpdateType.Replace
            ).then(e => log('filter applied response', e)) // response is void per tableau-extensions.js
          // );
        }
      });

      // call the config window for annotation build
      this.configureAnnotation(d);
    }
    else {
      // no data clear filter // never gets called because you only call this on node click
      tableauExt.dashboardContent.dashboard.worksheets.map((worksheet) => {
        worksheet.clearFilterAsync(tableauExt.settings.get("ConfigChildField")).then();
      });
    }
  }
  
  hoverCallBack = d => {
    log('in on hover callback', d);
      // go through each worksheet and select marks
    if ( d ) {
      tableauExt.dashboardContent.dashboard.worksheets.map((worksheet) => {
      log(`hovered ${d.id}: in sheet loop`, worksheet.name, worksheet, tableauExt.settings.get("ConfigChildField") );
      // select marks
      worksheet.selectMarksByValueAsync(
        [{
          'fieldName': tableauExt.settings.get("ConfigChildField"),
          'value': [d.id],
        }],
        window.tableau.SelectionUpdateType.Replace
      ).then(e => log('select marks response: ' + worksheet.name, e), err => log('select marks err: ' + worksheet.name, err)); // response is void per tableau-extensions.js
      });
    }
  }

  demoChange = event => {
    this.setState({ demoType: event.target.value });
    log('in demo change', event.target.value, this.state.demoType);
  };

  handleChange (event) {
    log('event', event);
    if (TableauSettings.ShouldUse) {
  
      // create a single k/v pair
      let kv = {};
      kv[event.target.name] = event.target.value;
      // update the settings
      TableauSettings.updateAndSave(kv, settings => {
        this.setState({
          tableauSettings: settings,
        });
      });
  
    } else {
      tableauExt.settings.set(event.target.name, event.target.value);
      tableauExt.settings.saveAsync().then(() => {
        this.setState({
          tableauSettings: tableauExt.settings.getAll()
        });
      });
    }
  };

  configCallBack (field, columnName) {
    // field = ChoroSheet, sheet = Data
    log('configCallBack', field, columnName);
  
    // if we are in config call back from a sheet selection, go get the data
    // this only works in the #true instance, must use update lifecycle method to catch both
    // if (field.indexOf("Sheet") >= 0) {
    //   this.getSummaryData(columnName, field);
    // }
  
    if (TableauSettings.ShouldUse) {
      TableauSettings.updateAndSave({
        // ['is' + field]: true,
        [field]: columnName,
      }, settings => {
        this.setState({
          // ['is' + field]: true,
          tableauSettings: settings,
        });
      });
  
    } else {
      //tableauExt.settings.set('is' + field, true);
      tableauExt.settings.set(field, columnName);
      tableauExt.settings.saveAsync().then(() => {
        this.setState({
          // ['is' + field]: true,
          tableauSettings: tableauExt.settings.getAll()
        });
      });
    }
  }
  
  eraseCallBack (field) {
    log("triggered erase", field);
    if (TableauSettings.ShouldUse) {
  
      TableauSettings.eraseAndSave([
        field,
      ], settings => {
        this.setState({
          tableauSettings: settings,
        });
      });
  
    } else {
      // erase all the settings, there has got be a better way.
      tableauExt.settings.erase(field);
  
      // save async the erased settings
      // wip - should be able to get rid of state as this is all captured in tableu settings (written to state)
      tableauExt.settings.saveAsync().then(() => {
        this.setState({
          tableauSettings: tableauExt.settings.getAll(),
        });
      });
    }
  };

  customCallBack (confSetting) {
    log('in custom call back', confSetting);
    if (TableauSettings.ShouldUse) {
      TableauSettings.updateAndSave({
        [confSetting]: true
      }, settings => {
  
        this.setState({
          [confSetting]: true,
          tableauSettings: settings,
        });
  
        if (confSetting === "configuration" || confSetting === "annotation" ) {
          tableauExt.ui.closeDialog("false");
        }
      })
  
    } else {
      tableauExt.settings.set(confSetting, true);
      tableauExt.settings.saveAsync().then(() => {
        this.setState({
          [confSetting]: true,
          tableauSettings: tableauExt.settings.getAll()
        });
        if (confSetting === "configuration" || confSetting === "annotation") {
          tableauExt.ui.closeDialog("false");
        }
      });
    }
  }

  // on mark selection highlight the nodes in the hierarchy as well
  marksSelected (e) {
    log('mark selected event', e);
    e.getMarksAsync().then(marks => {
      
      // loop through marks table and adjust the class for opacity
      let marksDataTable = marks.data[0];
      let col_indexes = {};
      let data = [];
  
      //console the select marks table
      log('marks', marksDataTable);
  
      //write column names to array
      for (let k = 0; k < marksDataTable.columns.length; k++) {
          col_indexes[marksDataTable.columns[k].fieldName] = k;
      }
  
      for (let j = 0, len = marksDataTable.data.length; j < len; j++) {
        //log(this.convertRowToObject(tableauData[j], col_indexes));
        data.push(convertRowToObject(marksDataTable.data[j], col_indexes));
      }
  
      // selected marks is being triggered, but this approach will not work with semiotic
      // now we reconcile marks to hierarchy data and adjust opacity accordingly
      let annotationsArray = []; 
      if ( data.length > 0 && this.state.tableauSettings.highlightAnnotation === "true") {
        for (let l = 0, len = this.state['ConfigSheetData'].length; l < len; l++) {
        // log('marks data', data, this.state['ConfigSheetData'][l]);
          if (_.find(data, (o) => { return o[this.state.tableauSettings.ConfigChildField] === this.state['ConfigSheetData'][l][this.state.tableauSettings.ConfigChildField]})) {
            annotationsArray.push({
              type: "highlight",
              id: this.state['ConfigSheetData'][l][this.state.tableauSettings.ConfigChildField] ,
              style: {
                strokeWidth: 5,
                strokeOpacity: 1,
                fillOpacity: 1
              }
            })
          }
          else { // else set to .1
            // annotationsArray.push({
            //   type: "highlight",
            //   id: this.state['ConfigSheetData'][l][this.state.tableauSettings.ConfigChildField],
            //   style: {
            //     fill: "#FFF", 
            //     storke: "#FFF",
            //     strokeWidth: 5,
            //     strokeOpacity: 1,
            //     fillOpacity: .9
            //   }
            // })
          }
        }
      }
  
      this.setState({
        highlightOn: annotationsArray
      })
      log('marks data', annotationsArray, data, this.state['ConfigSheetData']);
    }, err => {log('marks error', err);}
    );
  }

  // find all sheets in array and then call get summary, for now hardcoding
  filterChanged (e) {
    log('filter changed', e.worksheet.name, e);
    let selectedSheet = tableauExt.settings.get('ConfigSheet');
    if ( selectedSheet && selectedSheet === e.worksheet.name ) {
      log('calling summary data sheet');
      this.getSummaryData(selectedSheet, "ConfigSheet");
    } //get field3 from Settings
  }
  
  getSummaryData (selectedSheet, fieldName) {
    //clean up event listeners (taken from tableau expample)
    if (this.unregisterEventFn) {
      this.unregisterEventFn();
    }
  
    log(selectedSheet, fieldName, "in getData");
  
    // get sheet information this.state.selectedSheet should be syncronized with settings
    // can possibly remove the || in the sheetName part
    let sheetName = selectedSheet;
    let sheetObject = tableauExt.dashboardContent.dashboard.worksheets.find(worksheet => worksheet.name === sheetName);
  
  if (TableauSettings.ShouldUse) {
    TableauSettings.updateAndSave({
      isLoading: true
    }, settings => {
      this.setState({
        isLoading: true,
        tableauSettings: settings,
      })
    });

  } else {
    this.setState({ isLoading: true });
    tableauExt.settings.set('isLoading', true);
    tableauExt.settings.saveAsync().then(() => {
      this.setState({
        tableauSettings: tableauExt.settings.getAll()
      });
    });
  }

    //working here on pulling out summmary data
    //may want to limit to a single row when getting column names
    sheetObject.getSummaryDataAsync(options).then((t) => {
      log('in getData()', t, this.state);
  
      let col_names = [];
      let col_names_S = [];
      let col_names_N = [];
      let col_indexes = {};
      let data = [];
  
      //write column names to array
      for (let k = 0; k < t.columns.length; k++) {
          col_indexes[t.columns[k].fieldName] = k;
  
          // write named array
          col_names.push(t.columns[k].fieldName);
  
          // write typed arrays as well
          if (t.columns[k].dataType === 'string') {
            col_names_S.push(t.columns[k].fieldName);
          }
          else if (t.columns[k].dataType === 'int') {
            col_names_N.push(t.columns[k].fieldName);
          }
          else if (t.columns[k].dataType === 'float') {
            col_names_N.push(t.columns[k].fieldName);
          }
      }
      // log('columns', col_names, col_indexes);
  
      for (let j = 0, len = t.data.length; j < len; j++) {
        //log(this.convertRowToObject(tableauData[j], col_indexes));
        data.push(convertRowToObject(t.data[j], col_indexes));
      }
  
      // log flat data for testing
      log('flat data', data);
  
    if (TableauSettings.ShouldUse) {
      TableauSettings.updateAndSave({
        isLoading: false
      }, settings => {
        this.setState({
          isLoading: false,
          [fieldName + 'Columns']: col_names,
          [fieldName + 'StringColumns']: col_names_S,
          [fieldName + 'NumberColumns']: col_names_N,
          [fieldName + 'Data']: data,
          tableauSettings: settings,
          isMissingData: false,
        });
      }, true);

    } else {
      this.setState({ isLoading: false });
      tableauExt.settings.set('isLoading', false);
      tableauExt.settings.saveAsync().then(() => {
        this.setState({
          isLoading: false,
          [fieldName + 'Columns']: col_names,
          [fieldName + 'StringColumns']: col_names_S,
          [fieldName + 'NumberColumns']: col_names_N,
          [fieldName + 'Data']: data,
          tableauSettings: tableauExt.settings.getAll()
        });
      });
    }
    log('getData() state', this.state);
  });

    this.unregisterEventFn = sheetObject.addEventListener(
      window.tableau.TableauEventType.FilterChanged,
      this.filterChanged
    );

    // Bug - Adding this event listener causes the viz to continuously re-render. 
    // this.unregisterEventFn = sheetObject.addEventListener(
    //   window.tableau.TableauEventType.MarkSelectionChanged,
    //   this.marksSelected
    // );
    }
  
  clearSheet (showSplash) {
    log("triggered erase");
    if (TableauSettings.ShouldUse) {
  
      TableauSettings.eraseAndSave([
        'isLoading',
        'configuration',
        'annotation',
      ], settings => {
        this.setState({
          tableauSettings: settings,
          configuration: false,
          isSplash: showSplash,
          annotation: false,
        });
      });
  
    } else {
      // erase all the settings, there has got be a better way.
      tableauExt.settings.erase('isLoading');
      tableauExt.settings.erase('configuration');
      tableauExt.settings.erase('annotation');
  
      // save async the erased settings
      // wip - should be able to get rid of state as this is all captured in tableu settings (written to state)
      tableauExt.settings.saveAsync().then(() => {
        this.setState({
          tableauSettings: tableauExt.settings.getAll(),
          configuration: false,
          isSplash: showSplash,
          annotation: false,
        });
      });
    }
  };
  
  
  clearSplash () {
    this.setState({
      isSplash: false
    });
  };
  
  configure () {
    this.clearSheet(true);
    const popUpUrl = window.location.href + '#true';
    const popUpOptions = {
      height: 625,
      width: 720,
      };
  
    tableauExt.ui.displayDialogAsync(popUpUrl, "", popUpOptions).then((closePayload) => {
      log('configuring', closePayload, tableauExt.settings.getAll());
      if (closePayload === 'false') {
        this.setState({
          isSplash: false,
          isConfig: false,
          isAnnotation: false,
          tableauSettings: tableauExt.settings.getAll()
        });
      }
    }).catch((error) => {
      // One expected error condition is when the popup is closed by the user (meaning the user
      // clicks the 'X' in the top right of the dialog).  This can be checked for like so:
      switch(error.errorCode) {
        case window.tableau.ErrorCodes.DialogClosedByUser:
          log("closed by user")
          break;
        default:
          console.error(error.message);
      }
    });
  };  

  configureAnnotation (d) {
    this.clearSheet(false);
    const popUpUrl = window.location.href + '#annotation';
    const popUpOptions = {
      height: 550,
      width: 600,
      };
  
    tableauExt.ui.displayDialogAsync(popUpUrl, "", popUpOptions).then((closePayload) => {
      console.log('configuring annotation', closePayload, tableauExt.settings.getAll());
      if (closePayload === 'false') {

        let annotationsArray = this.state.tableauSettings.clickAnnotations ? JSON.parse(this.state.tableauSettings.clickAnnotations) : []; 
        annotationsArray.push({
          annotationID: d.id,
          type: tableauExt.settings.get('annotationType'),
          ids: [d.id],
          color: tableauExt.settings.get('annotationColor'),
          label: tableauExt.settings.get('annotationComment'),
          padding: parseInt(tableauExt.settings.get('annotationPadding')), 
          editMode: true,
          strokeWidth: tableauExt.settings.get('annotationStrokeWidth'),
        });

        console.log('we are now ready to add an annotation!', d, annotationsArray, this.state.tableauSettings);
    
        // update the settings
        if (TableauSettings.ShouldUse) {
          TableauSettings.updateAndSave({
            clickAnnotations: JSON.stringify(annotationsArray),
          }, settings => {
            this.setState({
                isSplash: false,
                isAnnotation: false,
                tableauSettings: settings,
            });
          });
      
        } else {
          tableauExt.settings.set("clickAnnotations", JSON.stringify(annotationsArray));
          tableauExt.settings.saveAsync().then(() => {
            this.setState({
                isSplash: false,
                isAnnotation: false,
                tableauSettings: tableauExt.settings.getAll()
            });
          });
        }
      }
    }).catch((error) => {
      // One expected error condition is when the popup is closed by the user (meaning the user
      // clicks the 'X' in the top right of the dialog).  This can be checked for like so:
      switch(error.errorCode) {
        case window.tableau.ErrorCodes.DialogClosedByUser:
          log("closed by user")
          break;
        default:
          console.error(error.message);
      }
    });
  };  

  componentWillUnmount() {
    let _this = this;
    window.removeEventListener('resize', function() {
      const thisWidth = window.innerWidth;
      const thisHeight = window.innerHeight;
      _this.setState({
        width: thisWidth,
        height: thisHeight
      });
    }, true);
  }
  
  componentDidMount () {
    const thisHeight = window.innerHeight;
    const thisWidth = window.innerWidth;
    //log("size", thisHeight, thisWidth);
  
    let _this = this;
    window.addEventListener('resize', function() {
      const thisWidth = window.innerWidth;
      const thisHeight = window.innerHeight;
      _this.setState({
        width: thisWidth,
        height: thisHeight
      });
    }, true);

    tableauExt.initializeAsync({'configure': this.configure}).then(() => {
      let unregisterHandlerFunctions = [];

    // default tableau settings on initial entry into the extension
    // we know if we haven't done anything yet when tableauSettings state = []
    log("did mount", tableauExt.settings.get("ConfigType"));
    if ( tableauExt.settings.get("ConfigType") === undefined ) {
      log('defaultSettings triggered', defaultSettings.length, defaultSettings);
      defaultSettings.defaultKeys.map((defaultSetting, index) => {
        log('defaultSetting', index, defaultSetting, defaultSettings.defaults[defaultSetting]);
        this.configCallBack(defaultSetting, defaultSettings.defaults[defaultSetting]);
      })
    }

    // this is where the majority of the code is going to go for this extension I think
      log("will mount", tableauExt.settings.getAll());
  
      //get sheetNames and dashboard name from workbook
      const dashboardName = tableauExt.dashboardContent.dashboard.name;
      const sheetNames = tableauExt.dashboardContent.dashboard.worksheets.map(worksheet => worksheet.name);
  
      // Whenever we restore the filters table, remove all save handling functions,
      // since we add them back later in this function.
      // provided by tableau extension samples
      unregisterHandlerFunctions.forEach(function (unregisterHandlerFunction) {
        unregisterHandlerFunction();
      });
  
      //add filter change event listener with callback to re-query data after change
      // go through each worksheet and then add a filter change event listner
      // need to check whether this is being applied more than once
      tableauExt.dashboardContent.dashboard.worksheets.map((worksheet) => {
        log("in sheet loop", worksheet.name, worksheet);
        // add event listner
        let unregisterHandlerFunction = worksheet.addEventListener(
            window.tableau.TableauEventType.FilterChanged,
            this.filterChanged
        );
        // provided by tableau extension samples, may need to push this to state for react
        unregisterHandlerFunctions.push(unregisterHandlerFunction);
        log(unregisterHandlerFunctions);
      });
  
      log('checking field in getAll()', tableauExt.settings.getAll());
  
      // Initialize the current saved settings global
      TableauSettings.init();

      this.setState({
        isLoading: false,
        height: thisHeight,
        width: thisWidth,
        sheetNames: sheetNames,
        dashboardName: dashboardName,
        demoType: tableauExt.settings.get("ConfigType") || "tree",
        tableauSettings: tableauExt.settings.getAll()
      });
  
      if (this.state.tableauSettings.configuration && this.state.tableauSettings.configuration === "true") {
        this.setState({
          isSplash: false,
          isConfig: false,
        });
      }
  
      if (this.state.tableauSettings.annotation && this.state.tableauSettings.annotation === "true") {
        this.setState({
          isSplash: false,
          isAnnotation: false,
        });
      }

    });
  }
  

  componentWillUpdate(nextProps, nextState) {
    // console log settings to check current status
    log("will update", this.state, nextState, tableauExt.settings.getAll());
  
    //get selectedSheet from Settings
    //hardcoding this for now because I know i have two possibilities
    let selectedSheet = tableauExt.settings.get('ConfigSheet');
    if (selectedSheet && this.state.tableauSettings.ConfigSheet !== nextState.tableauSettings.ConfigSheet) {
      log('calling summary data sheet');
      this.getSummaryData(selectedSheet, "ConfigSheet");
    } //get field3 from Settings
  }

// just logging this for now, may be able to remove later
componentDidUpdate() {
  log('did update', this.state, tableauExt.settings.getAll());
}

render() {
  const { classes } = this.props;

  // create these variables so they are blank if not populated by user
  let configMeasuresObject = {};

  //short cut this cause we use it ALOT
  const tableauSettingsState = this.state.tableauSettings; 

  // log some stuff to see what is going on
  log('in render', this.state.width, this.state.height, this.state.configuration, tableauSettingsState,  this.state);

  //loading screen jsx
  if (this.state.isLoading || tableauSettingsState.isLoading === "true") {
    return (<LoadingIndicatorComponent msg='Loading' />);
  }

    // config screen jsx
    if (this.state.isConfig) {
      let stepNames = ["Select Graph Type", "Select Sheet", "Drag & Drop Measures", "Customize the Graph"]
      
      log(this.state.stepIndex)

      if (this.state.stepIndex === 1) {
        const flareDataParsed = JSON.parse(flareData);
        const type = semioticTypes[this.state.demoType];
        log('configType', semioticTypes[this.state.demoType], tableauSettingsState.ConfigType, flareDataParsed );

        const semioticHelp = 
        <div style={{ paddingTop: 20, height: 350*.95, width: 350*.95, float: 'none', margin: '0 auto' }}>
          <ResponsiveNetworkFrame
              responsiveWidth
              responsiveHeight
              edges={flareDataParsed}
              edgeType='curve'
              nodeIDAccessor={"name"}
              nodeStyle={(d, i) => ({
                fill: type === "circlepack" ? "#ccc" : type === "treemap" ? "#ccc" : DataBlick[d.depth-1],
                fillOpacity: 0.25,
                stroke: DataBlick[d.depth-1],
                strokeOpacity: 0.6
              })}
              edgeStyle={(d, i) => ({
                fill: "#fff",
                fillOpacity: 0,
                stroke: DataBlick[d.source.depth],
                opacity: 0.5
              })} 
              networkType={{
                type: type,
                projection: "radial",
                nodePadding: 1,
                forceManyBody: type === "force" ? -250 : -15,
                edgeStrength: type === "force" ? 2 : 1.5,
                distanceMax: type === "force" ? 500 : 1,
                iterations: type === "force" ? 1000 : 0,
                padding: type === "treemap" ? 3 : type === "circlepack" ? 2 : 0,
                hierarchySum: d => d.value
              }}
              margin={10}
            />
          </div>
        ;

        // Placeholder sheet names. TODO: Bind to worksheet data
        return (
          <React.Fragment>
            <Stepper 
              stepIndex={this.state.stepIndex} 
              steps={stepNames}
            />
            <PickType
                title = {"Select a hierarchy data visualization"}
                sheetNames = {["Tidy Tree", "Dendogram", "Network", "Circlepack", "Treemap", "Partition"]}
                selectSheet = {this.configCallBack}
                customChange = {this.demoChange}
                field="ConfigType"
                listTitle = "Select a graph type"
                selectedValue={this.state.demoType || ""}
                helpJSX={semioticHelp}
            />
            <StepButtons
              onNextClick={this.onNextStep}
              onPrevClick={this.onPrevStep}
              stepIndex={this.state.stepIndex}
              maxStepCount={stepNames.length}
              nextText={this.state.stepIndex !== stepNames.length ? 'Next' : 'Save'}
              backText="Back"
            />
          </React.Fragment>
        );
      }
      
      if (this.state.stepIndex === 2) {
        // Placeholder sheet names. TODO: Bind to worksheet data
        return (
          <React.Fragment>
            <Stepper 
              stepIndex={this.state.stepIndex} 
              steps={stepNames}
            />
            <PickSheets
                sheetNames = {this.state.sheetNames}
                configCallBack = {this.configCallBack}
                field={"ConfigSheet"}
                ConfigSheet={tableauSettingsState.ConfigSheet || ""}
            />
            <StepButtons
              onNextClick={this.onNextStep}
              onPrevClick={this.onPrevStep}
              stepIndex={this.state.stepIndex}
              maxStepCount={stepNames.length}
              nextText={this.state.stepIndex !== stepNames.length ? 'Next' : 'Save'}
              backText="Back"
            />
          </React.Fragment>
        );
      }
      
      if (this.state.stepIndex === 3) {
        initialData.columns.measures.measures = this.state.ConfigSheetColumns || [];

        if ( this.state.ConfigSheetColumns ) {
          configMeasuresObject = this.state.ConfigSheetColumns.map((column) => {
            return {id: column, content: column, sheet: 'config'};
          });
        }

        let tmpMeasures = Object.assign({}, initialData, {"measures": configMeasuresObject});

        // Get stored fields
        let selectedFields = {
          ConfigParentField: tableauSettingsState.ConfigParentField,
          ConfigChildField: tableauSettingsState.ConfigChildField,
          ConfigColorField: tableauSettingsState.ConfigColorField,
          ConfigValueField: tableauSettingsState.ConfigValueField,
        }

        // Assign selected fields to tmpMeasures
        Object.keys(selectedFields).forEach(fieldName => {
          if (selectedFields[fieldName]) {
            tmpMeasures.drop_area[fieldName].measureId = selectedFields[fieldName];
          } else if (selectedFields[fieldName] === undefined) {
            tmpMeasures.drop_area[fieldName].measureId = null;
          }
        });

        const requiredFieldTextStyle = {
          border: "2px solid rgba(70, 130, 180, 0.6)", 
          borderRadius: "2px",
          color: "rgba(70, 130, 180, 1)",
          paddingLeft: "6px",
          paddingRight: "6px",
          fontSize: "13px",
          float: "right",
          marginTop: "8px"
        }
         const optionalFieldTextStyle = {
          border: "2px dashed lightgrey", 
          borderRadius: "2px",
          color: "grey",
          paddingLeft: "6px",
          paddingRight: "6px",
          fontSize: "13px",
          float: "right",
          marginRight: "6%",
          marginLeft: "8px",
          marginTop: "8px"
        }

        return (
          <React.Fragment>
            <Stepper 
              stepIndex={this.state.stepIndex} 
              steps={stepNames}
            />
            <DragNDrop
              title={"Drag fields onto the marks shelves to map data to your visualization"}
              initialData={tmpMeasures}
              configCallBack={this.configCallBack}
              eraseCallBack={this.eraseCallBack}
            />
            <span style={optionalFieldTextStyle} className="text--benton-light">*optional</span>
            <span style={requiredFieldTextStyle} className="text--benton-light">*required</span>
          <StepButtons
              onNextClick={this.onNextStep}
              onPrevClick={this.onPrevStep}
              stepIndex={this.state.stepIndex}
              maxStepCount={stepNames.length}
              nextText={this.state.stepIndex !== stepNames.length ? 'Next' : 'Save'}
              backText="Back"
            />
          </React.Fragment>
        ); 
      }
      
      if (this.state.stepIndex === 4) {
        return (
          <React.Fragment>
            <Stepper 
              stepIndex={this.state.stepIndex} 
              steps={stepNames}
            />
            <CustomizeHierarchy
              // title="Customize Hierarchy"
              configTitle = "Customize your hierarchy chart"
              handleChange={this.handleChange}
              customCallBack={this.customCallBack}
              field={'configuration'}
              tableauSettings={tableauSettingsState}
            />
            <StepButtons
              onNextClick={this.onNextStep}
              onPrevClick={this.onPrevStep}
              stepIndex={this.state.stepIndex}
              maxStepCount={stepNames.length}
              nextText={this.state.stepIndex !== stepNames.length ? 'Next' : 'Save'}
              backText="Back"
            />
          </React.Fragment>
        ); 
      }
    }

    // annotation config screen - testing
    console.log('testing annotation state', this.state.annotation, this.state.isAnnotation);
    if (this.state.isAnnotation) {
      return (
        <div className="annotationScreen" style={{padding : 5 }}>
          <CustomizeAnnotation
            configTitle = "Customize your annotation"
            handleChange={this.handleChange}
            customCallBack={this.customCallBack}
            field={'annotation'}
            tableauSettings={tableauSettingsState}
          />
          <StepButtons
            onNextClick={this.onNextStep}
            onPrevClick={this.onPrevStep}
            stepIndex={1}
            maxStepCount={1}
            nextText={'Save'}
            backText=""
          />
        </div>
      );
    }

    // splash screen jsx
    if (this.state.isSplash) {
      return (
        <div className="splashScreen" style={{padding : 5 }}>
          <SplashScreen 
            configure={this.configure} 
            title="Semiotic Hierarchy Charts in Tableau"
            desc="Leverage the brilliance of Semiotic's hierarchy network chart library, directly within Tableau!"
            ctaText="Configure"
            poweredBy={
              <React.Fragment>
                <p className="info">Brought to you by: </p>
                <a href="http://www.datablick.com/" target="_blank"><img src={dbLogo} /></a> <a href="https://starschema.com/" target="_blank"><img src={ssLogo} /></a>
                <p className="info">Powered by: </p>
                <a href="https://emeeks.github.io/semiotic/#/" target="_blank"><img src={semLogo} /></a>
            </React.Fragment>
          }
          />
        </div>
      );
    }


    // left off here config should be good, now we need to get component working from new config
    return (
      <SemioticHierarchy
        className={'semiotic-hierarchy-chart'}
        width={this.state.width * .925}
        height={this.state.height * .925}
        hierarchyData={this.state.ConfigSheetData}
        tableauSettings={tableauSettingsState}

        //networkTypeProps
        networkType={semioticTypes[tableauSettingsState.ConfigType]}
        networkProjection={tableauSettingsState.networkProjection}

        //render mode props
        nodeSize={tableauSettingsState.nodeSize}
        nodeRender={tableauSettingsState.nodeRender}
        edgeRender={tableauSettingsState.edgeRender}
        edgeType={tableauSettingsState.edgeType}

        //edge styling props
        edgeFillColor={DataBlick[2]}
        edgeFillOpacity={0}
        edgeStrokeColor={DataBlick[2]}
        edgeStrokeOpacity={.25}
        //edgeWidthField || edgeWidthStroke

        //node styling props
        nodeFillColor={tableauSettingsState.nodeColor}
        nodeFillOpacity={tableauSettingsState.nodeFillOpacity || .35}
        nodeStrokeColor={tableauSettingsState.nodeColor}
        nodeStrokeOpacity={tableauSettingsState.nodeStrokeOpacity || .5}
        //nodeWidthField || nodeWidthStroke
      
        //interactivity props
        highlightOn={this.state.highlightOn}
        hoverAnnotation={tableauSettingsState.hoverAnnotation === "true"}
        clickCallBack={this.clickCallBack}
        hoverCallBack={this.hoverCallBack}

        //annotation props
        clickAnnotations={tableauSettingsState.clickAnnotations ? JSON.parse(tableauSettingsState.clickAnnotations) : []}
        eraseAnnotationCallback={this.eraseCallBack}
      />
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
