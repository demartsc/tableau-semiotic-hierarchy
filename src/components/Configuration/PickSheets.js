import React from 'react';

import { ConfigScreen } from './../Configuration';
import { OptionColumn } from './CustomizeUIElements';

const PickSheets = (props) => (
  <React.Fragment>
    <div className="content-container">
      <h1 className="title">{props.title}</h1>
      <div className="clearfix">
        <OptionColumn className="grid--6">
          <ConfigScreen
                sheetNames = {props.sheetNames}
                selectSheet = {props.configCallBack}
                configTitle = "Choropleth Sheet"
                listTitle = "Available Sheets"
                field="ChoroSheet"
                selectedValue={props.ChoroSheet || ""}
          />
        </OptionColumn>
      </div> 
    </div>
  </React.Fragment>
);

export default PickSheets;