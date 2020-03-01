import React from 'react';

import { CustomScreen, InteractionScreen } from './';
import { OptionColumn } from './CustomizeUIElements';

const CustomizeHierarchy = (props) => (
  <React.Fragment>
    <div class="content-container">
      <h4 style={{color: "#BDBDBD"}}>{props.title}</h4>
      <div className="clearfix">
        <OptionColumn className="grid--5">
          { props.configType === 'customize'
            ? 
              <CustomScreen 
                configTitle={props.configTitle}
                handleChange={props.handleChange}
                customCallBack={props.customCallBack}
                field={props.field}
                color={props.color}
                tableauSettings={props.tableauSettings}
              />
            : 
              <InteractionScreen 
                configTitle={props.configTitle}
                handleChange={props.handleChange}
                customCallBack={props.customCallBack}
                field={props.field}
                color={props.color}
                tableauSettings={props.tableauSettings}
                configSheetColumns={props.configSheetColumns}
              />
          }
    </OptionColumn>
        <OptionColumn className="grid--7" style={{border: 0}}>
        </OptionColumn>
      </div>
    </div>
  </React.Fragment>
);

export default CustomizeHierarchy;