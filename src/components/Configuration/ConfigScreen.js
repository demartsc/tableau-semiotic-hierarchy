import React from 'react';
import PropTypes from 'prop-types';

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
    customChange,
    sheetNames,
    configTitle,
    listTitle, 
    field,
    selectedValue,
    helperText,
    helpJSX } = props;


  const helper = helpJSX || <Typography variant="subheading" align="center" > Placeholder for help info </Typography>;

  console.log('configScreen', props);
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

        <Grid item xs={3} >
          <div className="SheetPicker" >
            <RadioButtonsGroup
              sheets={sheetNames}
              title={listTitle}
              helperText={helperText}
              sheetCallBack={selectSheet}
              customChange={customChange}
              field={field}
              selectedValue={selectedValue}
            />
          </div>
        </Grid>
        <Grid item xs={9} >
          <Grid
            container
            alignItems="stretch"
            justify="space-between"
            direction="column"
            spacing={2} >

            <Grid item xs={12} >
                {helper}
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
