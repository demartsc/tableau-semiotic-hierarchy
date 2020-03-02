import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

//semiotic
import { ResponsiveNetworkFrame } from 'semiotic';

//material ui
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import { InputLabelWithTooltip, OptionWrapper, OptionTitle, TextField } from './CustomizeUIElements';

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
    display: 'inherit',
  },
});

// the example on material ui has this function statement
class InteractionScreen extends React.Component {
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
    // console.log('we are in custom', this.props);
    const {
      classes,
      handleChange,
      configSheetColumns,
      tableauSettings } = this.props;

    return (
      <div className="sheetScreen">
        <OptionWrapper>
          <div class="content-container">
            <OptionTitle>{this.props.configTitle}</OptionTitle>
            <FormControl className={classes.formControl}>
              <InputLabelWithTooltip
                    title="Hover Action"
                    tooltipText="Toggle and select which action to take on hover"
                  />
              <Select
                value={tableauSettings.hoverAction || "No Action"}
                onChange={handleChange}
                input={<Input name="hoverAction" id="hoverAction-helper" />}
              >
                 <MenuItem value={"No Action"}>No Action</MenuItem>
                 <MenuItem value={"Highlight"}>Highlight</MenuItem>
                 <MenuItem value={"Filter"}>Filter</MenuItem>
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabelWithTooltip
                    title="Hover Identifying Field"
                    tooltipText="Select which STRING field to take action on (we require string for interaction)"
                  />
              <Select
                value={tableauSettings.hoverField || "None"}
                onChange={handleChange}
                input={<Input name="hoverField" id="hoverField-helper" />}
              >
                 <MenuItem value={"None"}>None</MenuItem>
                 {
                  configSheetColumns.map(f => (
                    <MenuItem value={f} key={f}>{f}</MenuItem>
                  ))
                };
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabelWithTooltip
                    title="Click Action"
                    tooltipText="Toggle and select which action to take on click"
                  />
              <Select
                value={tableauSettings.clickAction || "No Action"}
                onChange={handleChange}
                input={<Input name="clickAction" id="clickAction-helper" />}
              >
                 <MenuItem value={"No Action"}>No Action</MenuItem>
                 <MenuItem value={"Highlight"}>Highlight</MenuItem>
                 <MenuItem value={"Filter"}>Filter</MenuItem>
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabelWithTooltip
                    title="Click Identifying Field"
                    tooltipText="Select which STRING field to take action on (we require string for interaction)"
                  />
              <Select
                value={tableauSettings.clickField || "None"}
                onChange={handleChange}
                input={<Input name="clickField" id="clickField-helper" />}
              >
                 <MenuItem value={"None"}>None</MenuItem>
                 {
                  configSheetColumns.map(f => (
                    <MenuItem value={f} key={f}>{f}</MenuItem>
                  ))
                };
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabelWithTooltip 
                  title="Show Tooltip"
                  tooltipText="Toggle whether to show the tooltip"
              />
              <Select
                value={tableauSettings.hoverAnnotation === "true"}
                onChange={handleChange}
                input={<Input name="hoverAnnotation" id="hoverAnnotation-helper" />}
              >
                 <MenuItem value={false}>False</MenuItem>
                 <MenuItem value={true}>True</MenuItem>
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabelWithTooltip 
                  title="Show Highlight"
                  tooltipText="Toggle whether to highlight based on Tableau selections"
              />
              <Select
                value={tableauSettings.highlightAnnotation === "true"}
                onChange={handleChange}
                input={<Input name="highlightAnnotation" id="highlightAnnotation-helper" />}
              >
                 <MenuItem value={false}>False</MenuItem>
                 <MenuItem value={true}>True</MenuItem>
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabelWithTooltip 
                    title="Color Config"
                    tooltipText="The way color will be applied"
              />
              <Select
                value={tableauSettings.colorConfig || "solid"}
                onChange={handleChange}
                input={<Input name="colorConfig" id="colorConfig-helper" />}
              >
                 <MenuItem value={"solid"}>Single Color</MenuItem>
                 <MenuItem value={"scale"}>Color Scale</MenuItem>
                 <MenuItem value={"field"}>Color Field</MenuItem>
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabelWithTooltip 
                title="Color"
                tooltipText="For single, enter 1 hex code for scale enter two, e.g., #ccc,#ddd"
              />
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
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabelWithTooltip 
                title="Node Fill Opacity"
                tooltipText="A decimal from 0 to 1 that will control node opacity"
              />
              <TextField  
                id="nodeFillOpacity-helper"
                name="nodeFillOpacity"
                label="Node Fill Opacity"
                placeholder=".35"
                className={classes.textField}
                value={tableauSettings.nodeFillOpacity}
                onChange={handleChange}
                margin="normal"
              />
            </FormControl>
          </div>
        </OptionWrapper>
      </div>
      );
    }
}

InteractionScreen.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(InteractionScreen);
