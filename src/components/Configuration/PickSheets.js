import React from 'react';

import { ConfigScreen } from './../Configuration';
import { OptionColumn } from './CustomizeUIElements';

const PickSheets = (props) => (
  <React.Fragment>
    <div className="content-container">
      <h1 className="title">{props.title}</h1>
      <div className="clearfix">
        <OptionColumn className="grid--12">
          <ConfigScreen
                sheetNames = {props.sheetNames}
                selectSheet = {props.configCallBack}
                configTitle = "Select a Data Sheet"
                listTitle = "Available Sheets"
                field="ConfigSheet"
                selectedValue={props.ConfigSheet || ""}
          />
        </OptionColumn>
      </div> 
    </div>
  </React.Fragment>
);

export default PickSheets;