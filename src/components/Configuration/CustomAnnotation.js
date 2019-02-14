import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

//material ui
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import { InputLabelWithTooltip, OptionColumn, OptionWrapper, OptionTitle, TextField } from './CustomizeUIElements';

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
    display: 'inherit',
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
      title,
      configTitle,
      handleChange,
      tableauSettings } = this.props;

    console.log('we are in custom annotations', this.props);
    return (
      <React.Fragment>
        <div className="content-container">
          <h4 style={{color: "#BDBDBD"}}>{title}</h4>
          <div className="clearfix">
            <OptionColumn className="grid--8  ">
              <div className="sheetScreen">
              <OptionWrapper>
                <div className="content-container">
                  <OptionTitle>{configTitle}</OptionTitle>
                  <FormControl className={classes.formControl}>
                    <InputLabelWithTooltip 
                        title="Annotation Type"
                        tooltipText="Select the style of annotation for your comment"
                      />
                    <Select
                      value={tableauSettings.annotationType || "enclose"}
                      onChange={handleChange}
                      input={<Input name="annotationType" id="annotationType-helper" />}
                    >
                      <MenuItem value={"enclose"}>Circle</MenuItem>
                      <MenuItem value={"enclose-rect"}>Rectangle</MenuItem>
                      <MenuItem value={"enclose-hull"}>Hull</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl className={classes.formControl}>
                    <InputLabelWithTooltip 
                      title="Color"
                      tooltipText="Enter 1 hex code e.g., #ccc OR #ddd"
                    />
                    <TextField  
                      id="annotationColor-helper"
                      name="annotationColor"
                      label="Annotation Color(s)"
                      placeholder="#000000 or #333333"
                      className={classes.textField}
                      value={tableauSettings.annotationColor}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </FormControl>
                  <FormControl className={classes.formControl}>
                    <InputLabelWithTooltip 
                      title="Comment"
                      tooltipText="Enter your annotation comment"
                    />
                    <TextField  
                      id="annotationComment-helper"
                      name="annotationComment"
                      label="Annotation Comment"
                      placeholder="Enter the text for your comment here"
                      className={classes.textField}
                      value={tableauSettings.annotationComment}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </FormControl>
                  <FormControl className={classes.formControl}>
                    <InputLabelWithTooltip 
                      title="Annotation Padding"
                      tooltipText="Spacing added through annotation"
                    />
                    <TextField  
                      id="annotationPadding-helper"
                      name="annotationPadding"
                      label="Annotation Padding/Spacing"
                      placeholder="1"
                      className={classes.textField}
                      value={tableauSettings.annotationPadding}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </FormControl>
                  <FormControl className={classes.formControl}>
                    <InputLabelWithTooltip 
                      title="Annotation Stroke Width"
                      tooltipText="Width of enclose and connector"
                    />
                    <TextField  
                      id="annotationStrokeWidth-helper"
                      name="annotationStrokeWidth"
                      label="Annotation Stroke Width"
                      placeholder="1"
                      className={classes.textField}
                      value={tableauSettings.annotationStrokeWidth}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </FormControl>
                </div>
              </OptionWrapper>
            </div>
          </OptionColumn>
          <OptionColumn className="grid--7" style={{border: 0}}></OptionColumn>
        </div>
      </div>
    </React.Fragment>
    );
  }
}

ConfigScreen.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ConfigScreen);
