// Copyright (c) 2020 Chris DeMartini
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

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
  CustomizeHierarchy, 
  Stepper, 
  StepButtons,
} from './components/Configuration'

// drag and drop 
import DragNDrop from './components/DragNDrop/DragNDrop';
import initialData from './components/DragNDrop/initial-data';

// Viz components
import LoadingIndicatorComponent from './components/LoadingIndicatorComponent';
import SemioticHierarchy from './components/SemioticHierarchy';

import { withStyles } from '@material-ui/core/styles';

// Tableau Styles and Tableau
import './assets/tableau/vendor/slick.js/slick/slick.css';
import './assets/tableau/css/style.min.css';
import { tableau } from './tableau-extensions-1.latest'; // eslint-disable-line  no-unused-vars

// tableau settings handler
import * as TableauSettings from './TableauSettings';

// initial default settings
import defaultSettings from './components/Configuration/defaultSettings';

// utils and variables
import { 
  DataBlick,
  semioticTypes
} from './variables';
import { 
  convertRowToObject,
  log
} from './utils';
import {
  selectMarksByField,
  applyFilterByField,
  clearMarksByField,
  clearFilterByField
} from './utils/interaction-utils';

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

function findColumnIndexByFieldName(ConfigSheetColumns, fieldName) {
  return (ConfigSheetColumns || [])
    .findIndex(f => f === fieldName);
}
// end constants to move to another file later

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      isConfig: this.props.isConfig || false,
      isLoading: true,
      isSplash: true,
      configuration: false,
      height: 300,
      width: 300,
      dashboardName: '',
      sheetNames: [],
      tableauSettings: [],
      demoType: "tree",
      stepIndex: 1,
      isMissingData: true,
      highlightOn: [], 
      filterHash: {}
    };

    TableauSettings.setEnvName(this.props.isConfig ? "CONFIG" : "EXTENSION");

    // interactivity and listeners
    this.unregisterHandlerFunctions = [];
    this.applyingMouseActions = false;
    this.clickCallBack = _.debounce(this.clickCallBack,200);
    this.hoverCallBack = _.debounce(this.hoverCallBack,200);
    this.configCallBack = _.debounce(this.configCallBack,200);
    // this.addEventListeners = _.debounce(this.addEventListeners,500);
    // this.removeEventListeners = _.debounce(this.removeEventListeners,500);
  }

  addEventListeners = () => {
    // Whenever we restore the filters table, remove all save handling functions,
    // since we add them back later in this function.
    // provided by tableau extension samples

    this.removeEventListeners();

    const localUnregisterHandlerFunctions = [];

    // add filter change event listener with callback to re-query data after change
    // go through each worksheet and then add a filter change event listener
    // need to check whether this is being applied more than once
    tableauExt.dashboardContent.dashboard.worksheets.forEach((worksheet) => {
      console.log('adding listners to', worksheet, ' sheet');

      // add event listener
      const unregisterFilterHandlerFunction = worksheet.addEventListener(
          window.tableau.TableauEventType.FilterChanged,
          this.filterChanged
      );
      // provided by tableau extension samples, may need to push this to state for react
      localUnregisterHandlerFunctions.push(unregisterFilterHandlerFunction);

      const unregisterMarkerHandlerFunction = worksheet.addEventListener(
        window.tableau.TableauEventType.MarkSelectionChanged,
        this.marksSelected
      );

      // provided by tableau extension samples, may need to push this to state for react
      localUnregisterHandlerFunctions.push(unregisterMarkerHandlerFunction);
    });

    console.log('%c addEventListeners', 'background: purple; color:yellow', localUnregisterHandlerFunctions, tableauExt.dashboardContent.dashboard.worksheets);
    this.unregisterHandlerFunctions = localUnregisterHandlerFunctions;
    // log(`%c added ${this.unregisterHandlerFunctions.length} EventListeners`, 'background: purple, color:yellow');
  }

  removeEventListeners = () => {
    console.log(`%c remove ${this.unregisterHandlerFunctions.length} EventListeners`, 'background: green; color:black');

    this.unregisterHandlerFunctions.forEach(unregisterHandlerFunction => {
      unregisterHandlerFunction();
    });

    this.unregisterHandlerFunctions = [];
  }

  onNextStep = () => {
    if ( this.state.stepIndex === 5 ) {
      this.customCallBack('configuration');
    } else {
      this.setState((previousState, currentProps) => {
        return { stepIndex: previousState.stepIndex + 1 }
      });
    }
  }
  
  onPrevStep = () => {
    this.setState((previousState, currentProps) => {
      return {stepIndex: previousState.stepIndex - 1}
    });
  }

  clickCallBack = d => {
    const {clickField, clickAction} = this.state.tableauSettings;

    log(
      '%c in on click callback',
      'background: brown',
      d,
      // findColumnIndexByFieldName(this.state, clickField),
      // clickAction
    );

    // if we are actually hovering on something then we should call this function
    if ( d ) {
      this.applyMouseActionsToSheets(d, clickAction, clickField);
    }
  };

  hoverCallBack = d => {
    const {hoverField, hoverAction} = this.state.tableauSettings;

    log(
      '%c in on hover callback',
      'background: OLIVE',
      d,
      this.state.ConfigSheetColumns, 
      hoverField,
      findColumnIndexByFieldName(this.state.ConfigSheetColumns, hoverField),
      hoverAction
    );  

    // if we are actually hovering on something then we should call this function
    this.applyMouseActionsToSheets(d, hoverAction, hoverField)
  }

  applyMouseActionsToSheets = (d, action, fieldName) => {
    if (this.applyingMouseActions) {
      return;
    }

    const {ConfigSheet} = this.state.tableauSettings;
    const toHighlight = action === 'Highlight' && (fieldName || 'None') !== 'None';
    const toFilter = action === 'Filter' && (fieldName || 'None') !== 'None';

    // if no action should be taken
    if (!toHighlight && !toFilter) {
      return;
    }

    // remove EventListeners before apply any async actions
    this.removeEventListeners();
    this.applyingMouseActions = true;

    let tasks = [];

    if ( d ) {
      // select marks or filter
      const actionToApply = toHighlight ? selectMarksByField : applyFilterByField;
      tasks = actionToApply(fieldName, [d[fieldName]], ConfigSheet);
      // console.log('we are applyMouseActionsToSheets', d, action, fieldName, ConfigSheet, toHighlight, toFilter, d[fieldName], actionToApply);
      
    } else {
      // clear marks or filer
      const actionToApply = toHighlight ? clearMarksByField : clearFilterByField;
      tasks = actionToApply(fieldName, ConfigSheet);
    }

    Promise.all(tasks).then(() => {
      // all selection should be completed
      // Add event listeners back
      this.addEventListeners();
      this.applyingMouseActions = false;
    });
  }

  demoChange = event => {
    this.setState({ demoType: event.target.value });
    log('in demo change', event.target.value, this.state.demoType);
  };

  handleChange = event => {
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

  configCallBack = (field, columnName) => {
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
          tableauSettings: settings
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
    
  eraseCallBack = field => {
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

  customCallBack = confSetting => {
    log('in custom call back', confSetting);
    if (TableauSettings.ShouldUse) {
      TableauSettings.updateAndSave({
        [confSetting]: true
      }, settings => {
  
        this.setState({
          [confSetting]: true,
          tableauSettings: settings,
        });
  
        if (confSetting === "configuration" ) {
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
        if (confSetting === "configuration" ) {
          tableauExt.ui.closeDialog("false");
        }
      });
    }
  }

  // find all sheets in array and then call get summary, for now hardcoding
  filterChanged = e => {
    const selectedSheet = tableauExt.settings.get('ConfigSheet');
    if (selectedSheet && selectedSheet === e.worksheet.name) {
      log(
        '%c ==============App filter has changed',
        'background: red; color: white',
        e
      );
      this.getFilteredData(selectedSheet, "ConfigSheet");
    }
  }
  
  marksSelected = e => {
    console.log(
      '%c ==============App Marker selected',
      'background: red; color: white',
      this.applyingMouseActions
    );

    if (this.applyingMouseActions) {
      return;
    }

    // remove event listeners
    this.removeEventListeners();

    e.getMarksAsync().then(marks => {
      
      // loop through marks table and adjust the class for opacity
      let marksDataTable = marks.data[0];
      let col_indexes = {};
      let data = [];
    
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

      if ( data.length > 0 && this.state.tableauSettings.tableauField !== 'None' && this.state.tableauSettings.highlightAnnotation === 'true' ) {
        annotationsArray.push({
          type: "desaturation-layer",
          style: { fill: this.state.tableauSettings.washOutColor || "white", opacity: this.state.tableauSettings.washOutOpacity || 0.6 }
        });

        for (let l = 0, len = this.state['ConfigSheetData'].length; l < len; l++) {
          if (_.find(data, o => { return o[this.state.tableauSettings.tableauField] === this.state['ConfigSheetData'][l][this.state.tableauSettings.tableauField]})) {
            log('marks data found', data, this.state['ConfigSheetData'][l]);
            annotationsArray.push({
              type: "highlight",
              id: this.state['ConfigSheetData'][l][this.state.tableauSettings.ConfigChildField],
              style: {
                stroke: this.state.tableauSettings.highlightStrokeColor || "#222222",
                strokeWidth: this.state.tableauSettings.highlightStrokeWidth || 2,
                strokeOpacity: this.state.tableauSettings.highlightStrokeOpacity || 1
              }
            })
          }
          else { 
            // do nothing for now
            // else set to .1
            // annotationsArray.push({
            //   type: "highlight",
            //   id: this.state['ConfigSheetData'][l][this.state.tableauSettings.ConfigChildField],
            //   style: {
            //     strokeOpacity: .1,
            //     fillOpacity: .1
            //   }
            // })
          }
        }
        // if after all that we only have the desaturation layer, remove it
        if ( annotationsArray.length === 1 ) {
          annotationsArray = [];
        }
      }

      //console the select marks table
      console.log('marks selected', marksDataTable, col_indexes, data, annotationsArray);

      this.setState({
        highlightOn: annotationsArray
      }, () => this.addEventListeners())
    }, err => {log('marks error', err);}
    );
  }
  
  getFilteredData = (selectedSheet, fieldName) => {
    const sheetName = selectedSheet;
    const sheetObject = tableauExt.dashboardContent.dashboard.worksheets.find(
      worksheet => worksheet.name === sheetName
    );

    if (!sheetObject) { 
      return;
    }

    // clean up event listeners (taken from tableau example)
    this.removeEventListeners();

    //working here on pulling out summmary data
    //may want to limit to a single row when getting column names
    sheetObject.getSummaryDataAsync(options).then((t) => {
      log('in getData()', t, this.state);
  
      let col_indexes = {};
      let data = [];
      let filterHash = {};
  
      //write column names to array
      for (let k = 0; k < t.columns.length; k++) {
        col_indexes[t.columns[k].fieldName] = k;
      }
      // log('columns', col_names, col_indexes);
    
      for (let j = 0, len = t.data.length; j < len; j++) {
        //log(this.convertRowToObject(tableauData[j], col_indexes));
        data.push(convertRowToObject(t.data[j], col_indexes));
        if ( data[j][this.state.tableauSettings.ConfigChildField] ) {
          filterHash[data[j][this.state.tableauSettings.ConfigChildField]] = true;
        }
      }
  
      // log flat data for testing
      log('filtered data', data, filterHash);
  
      this.setState({
        filterHash: filterHash
      });

      // trying to add listeners back
      this.addEventListeners();
    });
  }

  getSummaryData = (selectedSheet, fieldName) => {
    const sheetName = selectedSheet;
    const sheetObject = tableauExt.dashboardContent.dashboard.worksheets.find(
      worksheet => worksheet.name === sheetName
    );

    if (!sheetObject) {
      return;
    }

    // clean up event listeners (taken from tableau example)
    this.removeEventListeners();

    // this forces the component to completely re-render when data changes
    // if (TableauSettings.ShouldUse) {
    //   TableauSettings.updateAndSave({
    //     isLoading: true
    //   }, settings => {
    //     this.setState({
    //       isLoading: true,
    //       tableauSettings: settings,
    //     })
    //   });

    // } else {
    //   this.setState({ isLoading: true });
    //   tableauExt.settings.set('isLoading', true);
    //   tableauExt.settings.saveAsync().then(() => {
    //     this.setState({
    //       tableauSettings: tableauExt.settings.getAll()
    //     });
    //   });
    // }

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

      // trying to add listeners back
      this.addEventListeners();
      console.log('checking on adding listeners back', this.unregisterHandlerFunctions, this.state);
    });
  }
  
  clearSheet = () => {
    log("triggered erase");
    if (TableauSettings.ShouldUse) {
  
      TableauSettings.eraseAndSave([
        'isLoading',
        'configuration',
      ], settings => {
        this.setState({
          tableauSettings: settings,
          configuration: false,
          // isSplash: true,
        });
      });
  
    } else {
      // erase all the settings, there has got be a better way.
      tableauExt.settings.erase('isLoading');
      tableauExt.settings.erase('configuration');
  
      // save async the erased settings
      // wip - should be able to get rid of state as this is all captured in tableu settings (written to state)
      tableauExt.settings.saveAsync().then(() => {
        this.setState({
          tableauSettings: tableauExt.settings.getAll(),
          configuration: false,
          // isSplash: true,
        });
      });
    }
  };
  
  clearSplash = () => {
    this.setState({
      isSplash: false
    });
  };
  
  configure = () => {
    this.clearSheet();
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

  resize = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize, true);
  }
  
  componentDidMount () {
    window.addEventListener('resize', this.resize, true);
    this.resize();

    tableauExt.initializeAsync({'configure': this.configure}).then(() => {
    // default tableau settings on initial entry into the extension
    // we know if we haven't done anything yet when tableauSettings state = []
    log("did mount", tableauExt.settings.get("ConfigType"));
    if ( tableauExt.settings.get("ConfigType") === undefined ) {
      log('defaultSettings triggered', defaultSettings.length, defaultSettings);
      defaultSettings.defaultKeys.forEach((defaultSetting, index) => {
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
      this.addEventListeners();
  
      // Initialize the current saved settings global
      TableauSettings.init();

      this.setState({
        isLoading: false,
        height: window.innerHeight,
        width: window.innerWidth,
        sheetNames: sheetNames,
        dashboardName: dashboardName,
        demoType: tableauExt.settings.get("ConfigType") || "tree",
        tableauSettings: tableauExt.settings.getAll()
      }, () => {
        if (this.state.tableauSettings.configuration && this.state.tableauSettings.configuration === "true") {
          this.setState({
            isSplash: false,
            isConfig: false,
          });
        }  
      });  
    });
  }
  
  componentWillUpdate(nextProps, nextState) {
    // console log settings to check current status
    // log("will update", this.state, nextState, tableauExt.settings.getAll());
    if ( tableauExt.settings ) {
      //get selectedSheet from Settings
      //hardcoding this for now because I know i have two possibilities
      console.log('checking settings in will update', tableauExt);
      let selectedSheet = tableauExt.settings.get('ConfigSheet');
      if (selectedSheet && this.state.tableauSettings.ConfigSheet !== nextState.tableauSettings.ConfigSheet) {
        log('calling summary data sheet');
        this.getSummaryData(selectedSheet, "ConfigSheet");
      } //get field3 from Settings

    }
  }

  // just logging this for now, may be able to remove later
  componentDidUpdate() {
    // log('did update', this.state, tableauExt.settings.getAll());
  }

render() {
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
      let stepNames = ["Select Graph Type", "Select Sheet", "Drag & Drop Measures", "Customize the Graph", "Interact with the Graph"]
      
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
              configType={'customize'}
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

      if (this.state.stepIndex === 5) {
        console.log('checking state in stepIndex 5', this.state);
        return (
          <React.Fragment>
            <Stepper 
              stepIndex={this.state.stepIndex} 
              steps={stepNames}
            />
            <CustomizeHierarchy
              configTitle = "Interact with your hierarchy chart"
              handleChange={this.handleChange}
              customCallBack={this.customCallBack}
              field={'configuration'}
              tableauSettings={tableauSettingsState}
              configType={'interaction'}
              configSheetColumns={this.state.ConfigSheetStringColumns || []}
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
                <a href="http://www.datablick.com/" target="_blank" rel="noopener noreferrer"><img src={dbLogo} alt="datablick logo"/></a> <a href="https://starschema.com/" target="_blank" rel="noopener noreferrer" ><img src={ssLogo} alt="star schema logo"/></a>
                <p className="info">Powered by: </p>
                <a href="https://emeeks.github.io/semiotic/#/" target="_blank" rel="noopener noreferrer"><img src={semLogo} alt="semiotic logo" /></a>
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
        filterRenderedNodes={tableauSettingsState.filterDepth === "none" ? undefined : tableauSettingsState.filterDepth}

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
        filterHash={this.state.filterHash}
        highlightOn={this.state.highlightOn}
        hoverAnnotation={tableauSettingsState.hoverAnnotation === "true"}
        highlightAnnotation={tableauSettingsState.highlightAnnotation === "true"}
        clickCallBack={this.clickCallBack}
        hoverCallBack={this.hoverCallBack}
      />
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
