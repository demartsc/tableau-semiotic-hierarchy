import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

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

// this component is under development and does not work, is not connected yet. 
class MapboxStyle extends React.Component {
  constructor (props) {
    super(props);
  }

  render() {
    const {
      classes,
      theme,
      accessToken,
      mapStyle,
      mapCenter,
      mapZoom,
      height,
      configTitle,
      listTitle,
      customCallBack,
      handleChange
    } = this.props;

    console.log('we are in mapStyle', this.props);
    return (
      <div className="map-style-screen" style={{padding : 10 }}>
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
              <TextField
                id="accessToken-text"
                label="Mapbox Access Token"
                //placeholder="Placeholder"
                className={classes.textField}
                margin="normal"
                value={this.state.name}
                onChange={this.handleChange('name')}
              />
              <FormHelperText>Enter your mapbox token</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
              <TextField
                id="mapStyle-text"
                label="Mapbox Style"
                //placeholder="Placeholder"
                className={classes.textField}
                margin="normal"
                value={this.state.name}
                onChange={this.handleChange('name')}
              />
              <FormHelperText>Enter your mapbox style of choice</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="nodeRender-helper">nodeRender</InputLabel>
              <Select
                value={nodeRender}
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
              <InputLabel htmlFor="edgeColor-helper">edgeColor</InputLabel>
              <Select
                value={edgeColor}
                onChange={handleChange}
                input={<Input name="edgeColor" id="edgeColor-helper" />}
              >
                 <MenuItem value={"source"}>Source</MenuItem>
                 <MenuItem value={"target"}>Target</MenuItem>
              </Select>
              <FormHelperText>Color edges based on source or target</FormHelperText>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="padAngle-helper">padAngle</InputLabel>
              <Select
                value={padAngle}
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
                value={hoverAnnotation}
                onChange={handleChange}
                input={<Input name="hoverAnnotation" id="hoverAnnotation-helper" />}
              >
                 <MenuItem value={false}>False</MenuItem>
                 <MenuItem value={true}>True</MenuItem>
              </Select>
              <FormHelperText>Show annotation on hover</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={6} >
            <div className="customButton" >
              <Button
                variant="outlined"
                color="primary"
                size="large"
                className={classes.button}
                onClick={customCallBack}
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
