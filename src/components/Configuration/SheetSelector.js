import React from 'react';
import PropTypes from 'prop-types';

//semiotic
import { ResponsiveNetworkFrame } from 'semiotic';

//material ui
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

//sheets radio
import RadioButtonsGroup from './SheetsRadio';

const styles = {
  root: {
    flexGrow: 1,
  },
};

function ConfigScreen(props) {
  const {
    classes,
    selectSheet,
    sheetNames,
    height,
    demoData,
    adjustColor,
    configStyles,
    configTitle,
    listTitle } = props;

  //console.log('configStyles', configStyles);
  return (
    <div className="sheetScreen" style={{padding : 10 }}>
      <Grid
        container
        alignItems="center"
        justify="space-between"
        direction="row"
        spacing={8} >


        <Grid item xs={12} >
          <Typography
            variant="display1"
            align="left" >
            {configTitle}
          </Typography>
        </Grid>

        <Grid item xs={6} >
          <div className="SheetPicker" >
            <RadioButtonsGroup
              sheets={sheetNames}
              title={listTitle}
              sheetCallBack={selectSheet}
            />
          </div>
        </Grid>
        <Grid item xs={6} >
          <Grid
            container
            alignItems="stretch"
            justify="space-between"
            direction="column"
            spacing={8} >
            {/*
            <Grid item xs={12}>
              <Paper>
                <Typography
                  variant="display2"
                  align="left" >
                  Data
                </Typography>
              </Paper>
            </Grid>

            <Grid item style={{ height:'25%' }}>
              <Paper>
                <Typography
                  variant="subheading"
                  align="center" >
                  Drop sheet with data here
                </Typography>
              </Paper>
            </Grid>
            */}
            {/* left off here, the chord is still not sized dynamically */}
            <Grid item xs={12} >
                <div className="Chord" style={{ padding: 10, height: height*.65, flex: 1, float: 'none', margin: '0 auto' }}>
                  <ResponsiveNetworkFrame
                    responsiveWidth
                    responsiveHeight
                    edges={demoData}
                    nodeRenderMode={"sketchy"}
                    edgeRenderMode={"sketchy"}
                    nodeStyle={(d,i) => ({ fill: configStyles.nodeFill[d.index-adjustColor], stroke: configStyles.nodeStroke })}
                    edgeStyle={(d,i) => ({ fill: configStyles.edgeFill[d.target.index-adjustColor], stroke: configStyles.edgeStroke, opacity: configStyles.edgeOpacity })}
                    nodeSizeAccessor={5}
                    sourceAccessor={d => d.source}
                    targetAccessor={d => d.target}
                    edgeWidthAccessor={d => d.value}
                    networkType={{ type: "chord", padAngle: 0.01 }}
                  />
                </div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
    );
}

ConfigScreen.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ConfigScreen);
