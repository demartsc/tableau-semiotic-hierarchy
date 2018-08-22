import React, { Component } from 'react';
import PropTypes from 'prop-types';
import logo from './logo.svg';
import './App.css';

//semiotic
import { ResponsiveNetworkFrame } from 'semiotic';

//lodash
import _ from 'lodash';

import LoadingIndicatorComponent from './components/LoadingIndicatorComponent';
import SemioticHierarchy from './components/SemioticHierarchy';
import { ConfigScreen, CustomScreen } from './components/Configuration';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import CheckboxListSecondary from './material_list';
import { tableau } from './tableau-extensions-1.latest';
import Button from '@material-ui/core/Button';
import classNames from 'classnames';


// icons
import Save from '@material-ui/icons/Save';
import Delete from '@material-ui/icons/Delete';

//logos
import dbLogo from './assets/dblogo.png';
import ssLogo from './assets/sslogo.jpg';

// import { Modal } from '@material-ui/core/Modal';

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
const DataBlick = ["#000000","#FDC219","#00BFF3","#F07AAE"]
const NurielStone = ["#8175AA", "#6FB899", "#31A1B3", "#CCB22B", "#A39FC9", "#94D0C0", "#959C9E", "#027B8E", "#9F8F12"]
const JewelBright = ["#EB1E2C","#FD6F30","#F9A729","#F9D23C","#F5BB68","#64CDCC","#91DCEA","#A4A4D5","#BBC9E5"]
const defaultColor = ["#D3D3D3"]
const demoColors = ["#000000"] // colorlogical
const semioticDefault = ['#00a2ce','#4d430c','#b3331d','#b6a756']

const colors = [
  {palleteName: "Default Color", hexValues: defaultColor},
  {palleteName: "Demo Color", hexValues: defaultColor},
  {palleteName: "Nuriel Stone", hexValues: NurielStone},
  {palleteName: "Jewel Bright", hexValues: JewelBright},
  {palleteName: "DataBlick", hexValues: DataBlick},
  {palleteName: "Semiotic", hexValues: semioticDefault},
]

const dematrixifiedEdges1 = [
  { source: "a", target: "a", value: 10},
  { source: "a", target: "b", value: 10},
  { source: "a", target: "c", value: 10},
  { source: "b", target: "a", value: 10},
  { source: "b", target: "b", value: 10},
  { source: "b", target: "c", value: 10},
  { source: "c", target: "a", value: 10},
  { source: "c", target: "b", value: 10},
  { source: "c", target: "c", value: 10},
]

const dematrixifiedEdges2 = [
  { source: "a", target: "a", value: 5},
  { source: "a", target: "b", value: 5},
  { source: "a", target: "c", value: 5},
  { source: "b", target: "a", value: 5},
  { source: "b", target: "b", value: 5},
  { source: "b", target: "c", value: 5},
  { source: "c", target: "a", value: 5},
  { source: "c", target: "b", value: 5},
  { source: "c", target: "c", value: 5},
]

const configStyles = {
    sheetSelect: {
      nodeFill: "#fff",
      nodeStroke: "#000",
      edgeFill: "#fff",
      edgeStroke: "#000",
      edgeOpacity: 0.5
    },
    field0Select: {
      nodeFill: demoColors,
      nodeStroke: "#000",
      edgeFill: "#fff",
      edgeStroke: "#000",
      edgeOpacity: 0.5
    },
    field1Select: {
      nodeFill: demoColors,
      nodeStroke: "#000",
      edgeFill: "#fff",
      edgeStroke: "#000",
      edgeOpacity: 0.5
    },
    field2Select: {
      nodeFill: "#fff",
      nodeStroke: "#000",
      edgeFill: demoColors,
      edgeStroke: "#000",
      edgeOpacity: 0.5
    },
    field3Select: {
      nodeFill: "#fff",
      nodeStroke: "#000",
      edgeFill: demoColors,
      edgeStroke: "#000",
      edgeOpacity: 0.5
    }
};


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
      height: 300,
      width: 300,
      dashboardName: '',
      sheetNames: [],
      selectedSheet: undefined,
      selectedSheetObject: [],
      tableauSettings: [],
      configuration: false,
      columns: [],
      stringColumns: [],
      numberColumns: [],
      data: [],
      demoData: dematrixifiedEdges1,
      color: [],
      colors: colors,
      edgeRender: "normal",
      nodeRender: "normal",
      edgeColor: "target",
      padAngle: 0.01,
      hoverAnnotation: false
    };

    this.unregisterEventFn = undefined;

    this.filterChanged = this.filterChanged.bind(this);
    this.getSummaryData = this.getSummaryData.bind(this);
    this.selectSheet = this.selectSheet.bind(this);
    this.selectColumn0 = this.selectColumn0.bind(this);
    this.selectColumn1 = this.selectColumn1.bind(this);
    this.selectColumn2 = this.selectColumn2.bind(this);
    this.selectColumn3 = this.selectColumn3.bind(this);
    this.customCallBack = this.customCallBack.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.clearSheet = this.clearSheet.bind(this);
    this.clearSplash = this.clearSplash.bind(this);
    this.getColumnIndexes = this.getColumnIndexes.bind(this);
    this.convertRowToObject = this.convertRowToObject.bind(this);
    this.configure = this.configure.bind(this);
  }

handleChange = event => {
  //console.log(event.target.label, event.target.name, event.target.value);
  tableauExt.settings.set(event.target.name, event.target.value);
  tableauExt.settings.saveAsync().then(() => {
    this.setState({ [event.target.name]: event.target.value });
  });
};

getSelectedSheet (selectedSheet) {
  const sheetName = selectedSheet || this.state.selectedSheet;
  return tableauExt.dashboardContent.dashboard.worksheets.find(worksheet => worksheet.name === sheetName);
}

selectSheet (sheetName) {
  console.log(sheetName);
  tableauExt.settings.set('sheet', sheetName);
  tableauExt.settings.saveAsync().then(() => {
    this.setState({ selectedSheet: sheetName, demoData: dematrixifiedEdges1 });
  });
}

selectColumn0 (columnName) {
  console.log(columnName);

  let cols = this.state.stringColumns;
  cols = cols.filter(e => e !== columnName);
  console.log('cols', cols);

  tableauExt.settings.set('field0', columnName);
  tableauExt.settings.saveAsync().then(() => {
    this.setState({
      demoData: dematrixifiedEdges2,
      stringColumns: cols,
      tableauSettings: tableauExt.settings.getAll()
    });
  });
}

selectColumn1 (columnName) {
  console.log(columnName);

  let cols = this.state.stringColumns;
  cols = cols.filter(e => e !== columnName);

  if (columnName !== this.state.tableauSettings.field0) {
    tableauExt.settings.set('field1', columnName);
    tableauExt.settings.saveAsync().then(() => {
      this.setState({
        demoData: dematrixifiedEdges1,
        stringColumns: cols,
        tableauSettings: tableauExt.settings.getAll()
      });
    });
  }
}

selectColumn2 (columnName) {
  console.log(columnName);

  let cols = this.state.numberColumns;
  cols = cols.filter(e => e !== columnName);

  if (columnName !== this.state.tableauSettings.field0 && columnName !== this.state.tableauSettings.field1) {
    tableauExt.settings.set('field2', columnName);
    tableauExt.settings.saveAsync().then(() => {
      this.setState({
        numberColumns: cols,
        tableauSettings: tableauExt.settings.getAll()
      });
    });
  }
}

selectColumn3 (columnName) {
  console.log(columnName);

  let cols = this.state.numberColumns;
  cols = cols.filter(e => e !== columnName);

  if (columnName !== this.state.tableauSettings.field0 && columnName !== this.state.tableauSettings.field1 && columnName !== this.state.tableauSettings.field2) {
    tableauExt.settings.set('field3', columnName);
    tableauExt.settings.saveAsync().then(() => {
      this.setState({
        numberColumns: cols,
        tableauSettings: tableauExt.settings.getAll()
      });
      tableauExt.ui.closeDialog("false");
    });
  }
}

customCallBack () {
  tableauExt.settings.set('configuration', true);
  tableauExt.settings.saveAsync().then(() => {
    this.setState({ configuration: true });
  });
}


// need to be updated to re-query data based on extensions settings configured by user
filterChanged (e) {
  console.log('filter changed', e);
  this.getSummaryData(this.state.selectedSheet);
}

getSummaryData (selectedSheet) {
  //clean up event listeners (taken from tableau expample)
  if (this.unregisterEventFn) {
    this.unregisterEventFn();
  }

  console.log(selectedSheet, "in getData");

  // get sheet information this.state.selectedSheet should be syncronized with settings
  const sheetName = selectedSheet || this.state.selectedSheet;
  const sheetObject = tableauExt.dashboardContent.dashboard.worksheets.find(worksheet => worksheet.name === sheetName);

  this.setState({ isLoading: true });
  //working here on pulling out summmary data
  //may want to limit to a single row when getting column names
  sheetObject.getSummaryDataAsync(options).then((t) => {
    console.log(t);

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

        if (this.state.tableauSettings.field0 && t.columns[k].fieldName === this.state.tableauSettings.field0) {
          console.log('in soure', t.columns[k].fieldName, k);
          col_indexes['name'] = k;
          if (t.columns[k].fieldName !== 'name') {
            delete col_indexes[t.columns[k].fieldName];
          }
        }


        if (this.state.tableauSettings.field1 && t.columns[k].fieldName === this.state.tableauSettings.field1) {
          console.log('in target', t.columns[k].fieldName)
          col_indexes['child'] = k;
          if (t.columns[k].fieldName !== 'child') {
            delete col_indexes[t.columns[k].fieldName];
          }
        }

        if (this.state.tableauSettings.field2 && t.columns[k].fieldName === this.state.tableauSettings.field2) {
          console.log('in value', t.columns[k].fieldName)
          col_indexes['valueMetric'] = parseFloat(k);
          if (t.columns[k].fieldName !== 'valueMetric') {
            delete col_indexes[t.columns[k].fieldName];
          }
        }

        if (this.state.tableauSettings.field3 && t.columns[k].fieldName === this.state.tableauSettings.field3) {
          console.log('in color', t.columns[k].fieldName)
          col_indexes['colorMetric'] = parseFloat(k);
          if (t.columns[k].fieldName !== 'colorMetric') {
            delete col_indexes[t.columns[k].fieldName];
          }
        }
    }

    // console.log('columns', col_names, col_indexes);

    for (let j = 0, len = t.data.length; j < len; j++) {
      //console.log(this.convertRowToObject(tableauData[j], col_indexes));
      data.push(this.convertRowToObject(t.data[j], col_indexes));
    }

    console.log('flat data', data);

    this.setState({
      isLoading: false,
      columns: col_names,
      stringColumns: col_names_S,
      numberColumns: col_names_N,
      data: data
    });
    // console.log(this.state.data);
  });

  this.unregisterEventFn = sheetObject.addEventListener(
    window.tableau.TableauEventType.FilterChanged,
    this.filterChanged
  );
}

clearSheet () {
  console.log("triggered erase");
  // erase all the settings, there has got be a better way. 
  tableauExt.settings.erase('sheet');
  tableauExt.settings.erase('field0');
  tableauExt.settings.erase('field1');
  tableauExt.settings.erase('field2');
  tableauExt.settings.erase('field3');
  tableauExt.settings.erase('configuration');

  // save async the erased settings
  tableauExt.settings.saveAsync().then(() => {
    this.setState({
      selectedSheet: undefined,
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

getColumnIndexes(table, required_keys) {
  let colIdxMaps = {};
  let ref = table.columns;
  for (let j = 0; j < ref.length; j++) {
    let c = ref[j];
    let fn = c.fieldName;
    for (let x = 0; x < required_keys.length; x++) {
      if (required_keys[x] === fn) {
        colIdxMaps[fn] = c.index;
      }
    }
  }
  return colIdxMaps;
};

convertRowToObject(row, attrs_map) {
  let o = {};
  let name = "";
  for (name in attrs_map) {
    let id = attrs_map[name];
    o[name] = row[id].value === "%null%" ? null : row[id].value;
  }
  return o;
};

configure () {
  this.clearSheet();
  const popUpUrl = window.location.href + '#true';
  const popUpOptions = {
  	height: 500,
  	width: 700,
  };

  tableauExt.ui.displayDialogAsync(popUpUrl, "", popUpOptions).then((closePayload) => {
    console.log('configuring', closePayload, tableauExt.settings.getAll());
    if (closePayload === 'false') {
      this.setState({
        isSplash: false,
        isConfig: false,
      });
    }
	}).catch(function(error) {
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

    console.log('checking field in getAll()', tableauExt.settings.getAll().field0, tableauExt.settings.get('field0'));

    this.setState({
      isLoading: false,
      height: thisHeight,
      width: thisWidth,
      sheetNames: sheetNames,
      dashboardName: dashboardName,
      tableauSettings: tableauExt.settings.getAll(),
    });

    if (this.state.tableauSettings.field0 && this.state.tableauSettings.field1 && this.state.tableauSettings.field2 && this.state.tableauSettings.field3) {
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
  //console.log(tableauExt.settings.getAll());

  //get selectedSheet from Settings
  const selectedSheet = tableauExt.settings.get('sheet');
  if (selectedSheet && this.state.selectedSheet !== nextState.selectedSheet) {
    this.getSummaryData(selectedSheet);
  } //get field3 from Settings
  else if (tableauExt.settings.get('field3') && this.state.tableauSettings.field3 !== nextState.tableauSettings.field3) {
    console.log('calling summary data', this.state.data);
    this.getSummaryData(selectedSheet);
  }
}

// just logging this for now, may be able to remove later
componentDidUpdate() {
  console.log('did update', this.state, tableauExt.settings.getAll());
}

render() {
    const { classes } = this.props;

    // config screen jsx
    if (this.state.isConfig) {
      console.log('in config', this.state);
      //return (<LoadingIndicatorComponent msg='Loading' />);

      // sheet selector jsx
      // left off here working with grid layout
      // need to add drag and drop between sides with scrollable list
      // left off here with config screen component, need to figure out props for styles on each call
      if (!this.state.selectedSheet) {
        return (
          <ConfigScreen
            sheetNames = {this.state.sheetNames}
            selectSheet = {this.selectSheet}
            demoData = {this.state.demoData}
            height = {this.state.height}
            width = {this.state.width}
            configStyles = {configStyles.sheetSelect}
            configTitle = "Step 1: Start by Picking a Sheet"
            listTitle = "Pick the sheet with data"
          />
        );
      }

      if (!this.state.tableauSettings.field0) {
        return (
          <ConfigScreen
            sheetNames = {this.state.stringColumns}
            selectSheet = {this.selectColumn0}
            demoData = {this.state.demoData}
            height = {this.state.height}
            width = {this.state.width}
            adjustColor = {0}
            configStyles = {configStyles.field0Select}
            configTitle = "Step 2: Pick the parent field"
            listTitle = "Pick the parent"
          />
        );
      }

      if (!this.state.tableauSettings.field1) {
        return (
          <ConfigScreen
            sheetNames = {this.state.stringColumns}
            selectSheet = {this.selectColumn1}
            demoData = {this.state.demoData}
            adjustColor = {2}
            height = {this.state.height}
            width = {this.state.width}
            configStyles = {configStyles.field1Select}
            configTitle = "Step 3: Pick the child"
            listTitle = "Pick the child"
          />
        );
      }

      if (!this.state.tableauSettings.field2) {
        return (
          <ConfigScreen
            sheetNames = {this.state.numberColumns}
            selectSheet = {this.selectColumn2}
            demoData = {this.state.demoData}
            adjustColor = {2}
            height = {this.state.height}
            width = {this.state.width}
            configStyles = {configStyles.field2Select}
            configTitle = "Step 4: Pick the value by metric"
            listTitle = "Pick the value metric"
          />
        );
      }

      if (!this.state.tableauSettings.field3) {
        return (
          <ConfigScreen
            sheetNames = {this.state.numberColumns}
            selectSheet = {this.selectColumn3}
            demoData = {this.state.demoData}
            adjustColor = {2}
            height = {this.state.height}
            width = {this.state.width}
            configStyles = {configStyles.field3Select}
            configTitle = "Step 5: Pick a color by metric"
            listTitle = "Pick the color metric"
          />
        );
      }
    }

    //loading screen jsx
    if (this.state.isLoading) {
      return (<LoadingIndicatorComponent msg='Loading' />);
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

    console.log('this', this, this.state.data);
    return (
      <div className="App">
        <SemioticHierarchy
          className={classes.chart}
          color={this.state.color}
          defaultColor={defaultColor}
          width={this.state.width}
          height={this.state.height}
          hierarchyData={this.state.data}

          //networkTypeProps
          networkType={"tree"}
          networkProjection={"vertical"}

          //render mode props
          nodeRender={this.state.nodeRender}
          edgeRender={this.state.edgeRender}

          //edge styling props
          edgeShow
          edgeColor={"#94D0C0"}
          edgeOpacity={.75}
          //edgeWidthField || edgeWidthStroke

          //node styling props
          nodeShow
          nodeColor={"#8175AA"}
          nodeOpacity={.75}
          //nodeWidthField || nodeWidthStroke
        
          //interactivity props
          hoverAnnotation={this.state.hoverAnnotation}
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
