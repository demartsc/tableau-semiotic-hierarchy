import React from 'react';

import { CustomScreen } from './';
import { OptionColumn } from './CustomizeUIElements';

const CustomizeHierarchy = (props) => (
  <React.Fragment>
    <div class="content-container">
      <h4 style={{color: "#BDBDBD"}}>{props.title}</h4>
      <div className="clearfix">
        <OptionColumn className="grid--5">
          <CustomScreen 
            configTitle={props.configTitle}
            handleChange={props.handleChange}
            customCallBack={props.customCallBack}
            field={props.field}
            d3Projections={props.d3Projections}
            projectionName={props.projectionName}
            color={props.color}
            tableauSettings={props.tableauSettings}
          />
        </OptionColumn>
        <OptionColumn className="grid--7" style={{border: 0}}>
        </OptionColumn>
      </div>
    </div>
  </React.Fragment>
);

export default CustomizeHierarchy;