import React from 'react';

import { CustomScreen } from './';
import { OptionColumn } from './CustomizeUIElements';

const CustomizeHierarchy = (props) => (
  <React.Fragment>
    <div class="content-container">
      <h1 className="title">{props.title}</h1>
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
        <OptionColumn className="grid--7">
        </OptionColumn>
      </div>
    </div>
  </React.Fragment>
);

export default CustomizeHierarchy;