import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

//semiotic
import { ResponsiveNetworkFrame } from 'semiotic';

//material ui
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

// icons
import Save from '@material-ui/icons/Save';


const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
});

// the example on material ui has this function statement
class ConfigScreen extends React.Component {
  constructor (props) {
    super(props);
  }

  // for call back to work with field included
  handleClick = event => {
    console.log('handleClick', this.props);
    // update this if to include the minimum required fields
    // if (this.props.tableauSettings.ChoroFillScale && this.props.tableauSettings.ChoroFillScaleColors) {
      this.props.customCallBack(this.props.field)
    // }
  }
  
  render() {
    const {
      classes,
      theme,
      sheetNames,
      height,
      configTitle,
      listTitle,
      customCallBack,
      handleChange,
      colors,
      colorHex,
      color,
      edgeType,
      edgeRender,
      nodeRender,
      edgeColor,
      padAngle,
      hoverAnnotation, 
      tableauSettings } = this.props;

    console.log('we are in custom', this.props);
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
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="edgeType-helper">edgeType</InputLabel>
              <Select
                value={tableauSettings.edgeType || "normal"}
                onChange={handleChange}
                input={<Input name="edgeType" id="edgeType-helper" />}
              >
                 <MenuItem value={"normal"}>Normal</MenuItem>
                 <MenuItem value={"linearc"}>Line Arc</MenuItem>
                 <MenuItem value={"curve"}>Curve</MenuItem>
              </Select>
              <FormHelperText>The way edges will be drawn</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="networkProjection-helper">networkProjection</InputLabel>
              <Select
                value={tableauSettings.networkProjection || "vertical"}
                onChange={handleChange}
                input={<Input name="networkProjection" id="networkProjection-helper" />}
              >
                 <MenuItem value={"vertical"}>Vertical</MenuItem>
                 <MenuItem value={"horizontal"}>Horizontal</MenuItem>
                 <MenuItem value={"radial"}>Radial</MenuItem>
              </Select>
              <FormHelperText>Layout of the hierarchy</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="edgeRender-helper">edgeRender</InputLabel>
              <Select
                value={tableauSettings.edgeRender || "normal"}
                onChange={handleChange}
                input={<Input name="edgeRender" id="edgeRender-helper" />}
              >
                 <MenuItem value={"normal"}>Normal</MenuItem>
                 <MenuItem value={"sketchy"}>Sketchy</MenuItem>
                 <MenuItem value={"painty"}>Painty</MenuItem>
              </Select>
              <FormHelperText>The way edges will be rendered</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="nodeRender-helper">nodeRender</InputLabel>
              <Select
                value={tableauSettings.nodeRender || "normal"}
                onChange={handleChange}
                input={<Input name="nodeRender" id="nodeRender-helper" />}
              >
                 <MenuItem value={"normal"}>Normal</MenuItem>
                 <MenuItem value={"sketchy"}>Sketchy</MenuItem>
                 <MenuItem value={"painty"}>Painty</MenuItem>
              </Select>
              <FormHelperText>The way nodes will be rendered</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="padAngle-helper">padAngle</InputLabel>
              <Select
                value={parseFloat(tableauSettings.padAngle || 0.01)}
                onChange={handleChange}
                input={<Input name="padAngle" id="padAngle-helper" />}
              >
                 <MenuItem value={0}>0</MenuItem>
                 <MenuItem value={0.01}>0.01</MenuItem>
                 <MenuItem value={0.2}>0.2</MenuItem>
                 <MenuItem value={0.4}>0.4</MenuItem>
              </Select>
              <FormHelperText>Spacing between arcs in the chord</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="hoverAnnotation-helper">hoverAnnotation</InputLabel>
              <Select
                value={tableauSettings.hoverAnnotation === "true"}
                onChange={handleChange}
                input={<Input name="hoverAnnotation" id="hoverAnnotation-helper" />}
              >
                 <MenuItem value={false}>False</MenuItem>
                 <MenuItem value={true}>True</MenuItem>
              </Select>
              <FormHelperText>Show annotation on hover</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="colorConfig-helper">colorConfig</InputLabel>
              <Select
                value={tableauSettings.colorConfig || "solid"}
                onChange={handleChange}
                input={<Input name="colorConfig" id="colorConfig-helper" />}
              >
                 <MenuItem value={"solid"}>Single Color</MenuItem>
                 <MenuItem value={"scale"}>Color Scale</MenuItem>
                 <MenuItem value={"field"}>Color Field</MenuItem>
              </Select>
              <FormHelperText>The way color will be applied</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="nodeColor-helper"></InputLabel>
              <TextField  
                id="nodeColor-helper"
                name="nodeColor"
                label="Node Fill Color(s)"
                placeholder="#CCCCCC or #CCCCCC,#DDDDDD"
                className={classes.textField}
                value={tableauSettings.nodeColor}
                onChange={handleChange}
                margin="normal"
              />
              <FormHelperText>Node Fill</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="nodeSize-helper">nodeSize</InputLabel>
              <Select
                value={tableauSettings.nodeSize || "none"}
                onChange={handleChange}
                input={<Input name="nodeSize" id="nodeSize-helper" />}
              >
                 <MenuItem value={"none"}>None</MenuItem>
                 <MenuItem value={"value"}>Value</MenuItem>
              </Select>
              <FormHelperText>Toggle node size from value field</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="markerMinRadius-helper"></InputLabel>
              <TextField  
                id="markerMinRadius-helper"
                name="markerMinRadius"
                label="Minimum Radius for Markers"
                placeholder="1"
                className={classes.textField}
                value={tableauSettings.markerMinRadius}
                onChange={handleChange}
                margin="normal"
              />
              <FormHelperText>Minimum radius for map markers</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="markerMaxRadius-helper"></InputLabel>
              <TextField  
                id="markerMaxRadius-helper"
                name="markerMaxRadius"
                label="Maximum Radius for Markers"
                placeholder="25"
                className={classes.textField}
                value={tableauSettings.markerMaxRadius}
                onChange={handleChange}
                margin="normal"
              />
              <FormHelperText>Maximum radius for map markers</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={6} >
            <div className="customButton" >
              <Button
                variant="outlined"
                color="primary"
                size="large"
                className={classes.button}
                onClick={this.handleClick}
              >
                <Save className={classNames(classes.leftIcon, classes.iconSmall)} />
                Save
              </Button>
            </div>
          </Grid>
        </Grid>
      </div>
      );
    }
}

ConfigScreen.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ConfigScreen);
