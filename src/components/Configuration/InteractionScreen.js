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
                    title="Tableau to Semiotic Field"
                    tooltipText="Select which STRING field to take action on (we require string for interaction)"
                  />
              <Select
                value={tableauSettings.tableauField || "None"}
                onChange={handleChange}
                input={<Input name="tableauField" id="tableauField-helper" />}
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
                title="Highlight Stroke Color"
                tooltipText="Enter a hex code for the highlight outline of a mark"
              />
              <TextField  
                id="highlightStrokeColor-helper"
                name="highlightStrokeColor"
                label="Highlight Stroke Fill Color"
                placeholder="#222222"
                className={classes.textField}
                value={tableauSettings.highlightStrokeColor}
                onChange={handleChange}
                margin="normal"
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabelWithTooltip 
                title="Highlight Stroke Opacity"
                tooltipText="A decimal from 0 to 1 that will control highlight stroke opacity"
              />
              <TextField  
                id="highlightStorkeOpacity-helper"
                name="highlightStorkeOpacity"
                label="Highlight Stroke Opacity"
                placeholder="1"
                className={classes.textField}
                value={tableauSettings.highlightStorkeOpacity}
                onChange={handleChange}
                margin="normal"
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabelWithTooltip 
                    title="Highlight Stroke Width"
                    tooltipText="Set the width of the stroke when a node is highlighted"
              />
              <Select
                value={tableauSettings.highlightStrokeWidth || 2}
                onChange={handleChange}
                input={<Input name="highlightStrokeWidth" id="highlightStrokeWidth-helper" />}
              >
                 <MenuItem value={"0.5"}>0.5</MenuItem>
                 <MenuItem value={"1"}>1</MenuItem>
                 <MenuItem value={"1.5"}>1.5</MenuItem>
                 <MenuItem value={"2"}>2</MenuItem>
                 <MenuItem value={"2.5"}>2.5</MenuItem>
                 <MenuItem value={"3"}>3</MenuItem>
                 <MenuItem value={"3.5"}>3.5</MenuItem>
                 <MenuItem value={"4"}>4</MenuItem>
                 <MenuItem value={"4.5"}>4.5</MenuItem>
                 <MenuItem value={"5"}>5</MenuItem>
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabelWithTooltip 
                title="Washout Color"
                tooltipText="Enter a hex code for the washout layer over marks, during highlight."
              />
              <TextField  
                id="washOutColor-helper"
                name="washOutColor"
                label="Washout Color"
                placeholder="#FFFFFF"
                className={classes.textField}
                value={tableauSettings.washOutColor}
                onChange={handleChange}
                margin="normal"
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabelWithTooltip 
                title="Washout Opacity"
                tooltipText="A decimal from 0 to 1 that will control how much nodes not selected are washed out."
              />
              <TextField  
                id="washOutOpacity-helper"
                name="washOutOpacity"
                label="Washout Opacity"
                placeholder="0.6"
                className={classes.textField}
                value={tableauSettings.washOutOpacity}
                onChange={handleChange}
                margin="normal"
              />
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
