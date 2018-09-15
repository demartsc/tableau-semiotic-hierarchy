import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';

//semiotic
import { ResponsiveNetworkFrame } from 'semiotic';
import { flareData } from './data/flare.js';

//lodash
import _ from 'lodash';

// local components
import LoadingIndicatorComponent from './components/LoadingIndicatorComponent';
import SemioticHierarchy from './components/SemioticHierarchy';
import { ConfigScreen, CustomScreen } from './components/Configuration';
import { 
  defaultColor, 
  DataBlick,
  semioticTypes
} from './variables';
import { 
  convertRowToObject
} from './utils';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { tableau } from './tableau-extensions-1.latest';
import Button from '@material-ui/core/Button';
import classNames from 'classnames';

// icons
import Save from '@material-ui/icons/Save';
import Delete from '@material-ui/icons/Delete';

//logos
import dbLogo from './assets/dblogo.png';
import ssLogo from './assets/sslogo.jpg';

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
      isLoading: true,
      isSplash: true,
      configuration: false,
      height: 300,
      width: 300,
      dashboardName: '',
      sheetNames: [],
      tableauSettings: [],
      demoType: "tree",
    };

    this.unregisterEventFn = undefined;

    this.filterChanged = this.filterChanged.bind(this);
    this.getSummaryData = this.getSummaryData.bind(this);
    this.configCallBack = this.configCallBack.bind(this);
    this.customCallBack = this.customCallBack.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.demoChange = this.demoChange.bind(this);
    this.clearSheet = this.clearSheet.bind(this);
    this.clearSplash = this.clearSplash.bind(this);
    this.configure = this.configure.bind(this);
  }

  demoChange = event => {
    this.setState({ demoType: event.target.value });
    console.log('in demo change', event.target.value, this.state.demoType);
  };

  handleChange (event) {
    console.log('event', event);
    tableauExt.settings.set(event.target.name, event.target.value);
    tableauExt.settings.saveAsync().then(() => {
      this.setState({ 
        tableauSettings: tableauExt.settings.getAll()
      });
    });
  };
  
  configCallBack (field, columnName) {
    console.log('configCallBack', field, columnName);
    tableauExt.settings.set('is' + field, true);
    tableauExt.settings.set(field, columnName);
    tableauExt.settings.saveAsync().then(() => {
      this.setState({ 
        ['is' + field]: true,
        tableauSettings: tableauExt.settings.getAll()
      });
    });
  }
  
  customCallBack (confSetting) {
    console.log('in custom call back', confSetting);
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
  
  // needs to be updated to handle if more than one data set is selected
  // find all sheets in array and then call get summary, for now hardcoding
  filterChanged (e) {
    console.log('filter changed', e);
    let selectedSheet = tableauExt.settings.get('ConfigSheet');
    if ( selectedSheet ) {
      console.log('calling summary data sheet');
      this.getSummaryData(selectedSheet, "ConfigSheet");
    } //get field3 from Settings
  }
  
  getSummaryData (selectedSheet, fieldName) {
    //clean up event listeners (taken from tableau expample)
    if (this.unregisterEventFn) {
      this.unregisterEventFn();
    }
  
    console.log(selectedSheet, fieldName, "in getData");
  
    // get sheet information this.state.selectedSheet should be syncronized with settings
    // can possibly remove the || in the sheetName part
    let sheetName = selectedSheet;
    let sheetObject = tableauExt.dashboardContent.dashboard.worksheets.find(worksheet => worksheet.name === sheetName);
  
    this.setState({ isLoading: true });
    tableauExt.settings.set('isLoading', true);
      tableauExt.settings.saveAsync().then(() => {
        this.setState({ 
          tableauSettings: tableauExt.settings.getAll()
        });
      });
  
    //working here on pulling out summmary data
    //may want to limit to a single row when getting column names
    sheetObject.getSummaryDataAsync(options).then((t) => {
      console.log('in getData()', t, this.state);
  
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
      // console.log('columns', col_names, col_indexes);
  
      for (let j = 0, len = t.data.length; j < len; j++) {
        //console.log(this.convertRowToObject(tableauData[j], col_indexes));
        data.push(convertRowToObject(t.data[j], col_indexes));
      }
  
      // log flat data for testing
      console.log('flat data', data);
  
      // placeholder for two sets of data until we figure out the async issue
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
      console.log('getData() state', this.state);
    });
  
    this.unregisterEventFn = sheetObject.addEventListener(
      window.tableau.TableauEventType.FilterChanged,
      this.filterChanged
    );
  }
  
  clearSheet () {
    console.log("triggered erase");
    // erase all the settings, there has got be a better way. 
    tableauExt.settings.erase('isLoading');
    tableauExt.settings.erase('isConfigType');
    tableauExt.settings.erase('isConfigSheet');
    tableauExt.settings.erase('isConfigParentField');
    tableauExt.settings.erase('isConfigChildField');
    tableauExt.settings.erase('isConfigValueField');
    tableauExt.settings.erase('configuration');
  
    // save async the erased settings
    // wip - should be able to get rid of state as this is all captured in tableu settings (written to state)
    tableauExt.settings.saveAsync().then(() => {
      this.setState({
        tableauSettings: tableauExt.settings.getAll(),
        configuration: false,
        isSplash: true,
      });
    });
  };
  
  clearSplash () {
    this.setState({
      isSplash: false
    });
  };
  
  configure () {
    this.clearSheet();
    const popUpUrl = window.location.href + '#true';
    const popUpOptions = {
      height: 600,
      width: 800,
    };
  
    tableauExt.ui.displayDialogAsync(popUpUrl, "", popUpOptions).then((closePayload) => {
      console.log('configuring', closePayload, tableauExt.settings.getAll());
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
          console.log("closed by user")
          break;
        default:
          console.error(error.message);
      }
    });
  };  

  componentDidMount () {
    const thisHeight = window.innerHeight;
    const thisWidth = window.innerWidth;
    //console.log("size", thisHeight, thisWidth);
  
    tableauExt.initializeAsync({'configure': this.configure}).then(() => {
      let unregisterHandlerFunctions = [];
  
  
      // this is where the majority of the code is going to go for this extension I think
      console.log("will mount", tableauExt.settings.getAll());
  
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
        console.log("in sheet loop", worksheet.name, worksheet);
        // add event listner
        let unregisterHandlerFunction = worksheet.addEventListener(
            window.tableau.TableauEventType.FilterChanged,
            this.filterChanged
        );
        // provided by tableau extension samples, may need to push this to state for react
        unregisterHandlerFunctions.push(unregisterHandlerFunction);
        console.log(unregisterHandlerFunctions);
      });
  
      console.log('checking field in getAll()', tableauExt.settings.getAll());
  
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
  
    });
  }
  

  componentWillUpdate(nextProps, nextState) {
    // console log settings to check current status
    console.log("will update", this.state, nextState, tableauExt.settings.getAll());
  
    //get selectedSheet from Settings
    //hardcoding this for now because I know i have two possibilities
    let selectedSheet = tableauExt.settings.get('ConfigSheet');
    if (selectedSheet && this.state.tableauSettings.ConfigSheet !== nextState.tableauSettings.ConfigSheet) {
      console.log('calling summary data sheet');
      this.getSummaryData(selectedSheet, "ConfigSheet");
    } //get field3 from Settings
  }

// just logging this for now, may be able to remove later
componentDidUpdate() {
  console.log('did update', this.state, tableauExt.settings.getAll());
}

render() {
    const { classes } = this.props;

    //short cut this cause we use it ALOT
    const tableauSettingsState = this.state.tableauSettings; 

    //loading screen jsx
    if (this.state.isLoading || tableauSettingsState.isLoading === "true") {
      return (<LoadingIndicatorComponent msg='Loading' />);
    }

    // config screen jsx
    if (this.state.isConfig) {
      // want to use tableauExt.settings here, but it is undefined initially and causes and error
      //first thing we do is determine the type of implementation
      //1. Dendogram / Cluster
      //2. Tidy Tree / Tree
      //3. Network / force
      //4. Circlepack / circlepack
      //5. Treemap / treemap
      //if (tableauSettingsState.isConfigType && tableauSettingsState.isConfigType === "true" ) {
      if (!this.state.isConfigType) {
        const flareDataParsed = JSON.parse(flareData);
        const type = semioticTypes[this.state.demoType];
        console.log('configType', tableauSettingsState.ConfigType, flareDataParsed );

        const semioticHelp = 
          <ResponsiveNetworkFrame
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
            margin={50}
          />
        ;

        return (
          <ConfigScreen
            sheetNames = {["Tidy Tree", "Dendogram", "Network", "Circlepack", "Treemap", "Partition"]}
            selectSheet = {this.configCallBack}
            customChange = {this.demoChange}
            height = {this.state.height}
            width = {this.state.width}
            configTitle = "Step 1: Select the Type of Hierarchy Visual"
            listTitle = "Pick a configuration"
            helperText = "Powered by Semiotic"
            field="ConfigType"
            selectedValue={this.state.demoType || ""}
            helpJSX={semioticHelp}
          />
        );
      }

      //we need to identify the data and fill metric/scale
      if ( tableauSettingsState.ConfigType ) {

        // next we pull the data sheet
        if ( !this.state.isConfigSheet ) {
          return (
            <ConfigScreen
              sheetNames = {this.state.sheetNames}
              selectSheet = {this.configCallBack}
              height = {this.state.height}
              width = {this.state.width}
              configTitle = "Step 1: Start by Picking a Sheet"
              listTitle = "Pick the sheet with data"
              field="ConfigSheet"
              selectedValue={tableauSettingsState.ConfigSheet || ""}
            />
          );
        }

        // now that we have sheet, pick the parent field
        if ( !this.state.isConfigParentField ) {
          return (
            <ConfigScreen
              sheetNames = {this.state.ConfigSheetStringColumns}
              selectSheet = {this.configCallBack}
              height = {this.state.height}
              width = {this.state.width}
              configTitle = "Step 2: Pick the Parent Dimension"
              listTitle = "Pick the parent"
              field="ConfigParentField"
              selectedValue={tableauSettingsState.ConfigParentField || ""}
            />
          );
        }

        // now that we have sheet, pick the child field
        if ( !this.state.isConfigChildField ) {
          return (
            <ConfigScreen
              sheetNames = {this.state.ConfigSheetStringColumns}
              selectSheet = {this.configCallBack}
              height = {this.state.height}
              width = {this.state.width}
              configTitle = "Step 3: Pick the Child Dimension"
              listTitle = "Pick the child"
              field="ConfigChildField"
              selectedValue={tableauSettingsState.ConfigChildField || ""}
            />
          );
        }

        // now that we have sheet, pick the color field
        if ( !this.state.isConfigColorField ) {
          const tempArrary = this.state.ConfigSheetStringColumns;
          tempArrary.push("None");

          console.log('tempArrary', tempArrary);
          return (
            <ConfigScreen
              sheetNames = {tempArrary}
              selectSheet = {this.configCallBack}
              height = {this.state.height}
              width = {this.state.width}
              configTitle = "Step 4: Pick the Color"
              listTitle = "Pick the value"
              field="ConfigColorField"
              selectedValue={tableauSettingsState.ConfigColorField || ""}
            />
          );
        }

        // now that we have sheet, pick the value field
        if ( !this.state.isConfigValueField ) {
          const tempArraryNum = this.state.ConfigSheetNumberColumns;
          tempArraryNum.push("None");

          return (
            <ConfigScreen
              sheetNames = {tempArraryNum}
              selectSheet = {this.configCallBack}
              height = {this.state.height}
              width = {this.state.width}
              configTitle = "Step 5: Pick the Value"
              listTitle = "Pick the value"
              field="ConfigValueField"
              selectedValue={tableauSettingsState.ConfigValueField || ""}
            />
          );
        }

        if (!this.state.configuration) {
          return (
            <CustomScreen
              configTitle = "Step 6: Customize your hierarchy!"
              handleChange={this.handleChange}
              customCallBack={this.customCallBack}
              field={'configuration'}
              tableauSettings={tableauSettingsState}
            />
          );
        }    
      }
    }

    // splash screen jsx
    if (this.state.isSplash) {
      return (
        <div className="splashScreen" style={{padding : 5 }}>
          <Grid
            container
            direction="column"
            alignItems="center"
            justify="center"
            spacing={8} >

            <Grid item >
              <Typography
                variant="display2"
                align="center" >
                A
              </Typography>
            </Grid>
            <Grid item >
              <img alt="" src={dbLogo} style={{display: 'block', marginLeft: 'auto', marginRight: 'auto', width: '33%', height: 'auto'}}/>
            </Grid>
            <Grid item >
              <Typography
                variant="display2"
                align="center" >
                +
              </Typography>
            </Grid>
            <Grid item >
              <img alt="" src={ssLogo} style={{display: 'block', marginLeft: 'auto', marginRight: 'auto', width: '100%', height: 'auto'}}/>
            </Grid>
            <Grid item >
              <Typography
                variant="display2"
                align="center"
                style={{margin:'auto'}} >
                Tableau Extension
              </Typography>
              <br/>
            </Grid>
            <Grid
              container
              direction="row"
              alignItems="center"
              justify="center"
              spacing={8} >
              <Button
                variant="outlined"
                color="primary"
                size="large"
                className={classes.button}
                onClick={this.configure}
              >
              Configure the Extension
            </Button>
            </Grid>
          </Grid>
        </div>
      );
    }

    // left off here config should be good, now we need to get component working from new config
    return (
      <div className="App">
        <SemioticHierarchy
          className={'semiotic-hierarchy-chart'}
          width={this.state.width}
          height={this.state.height}
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
          nodeStrokeOpacity={.5}
          //nodeWidthField || nodeWidthStroke
        
          //interactivity props
          hoverAnnotation={tableauSettingsState.hoverAnnotation === "true"}
        />
      </div>
    );

  return (
    <Button
      variant="outlined"
      color="primary"
      size="large"
      className={classes.button}
      onClick={this.clearSheet}
    >
      <Delete className={classNames(classes.leftIcon, classes.iconSmall)} />
      Erase
    </Button>
  );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
