import React from 'react';
import App from './App';
// import parse from 'url-parse';

const AppWrapper = props => {
  return(
    <App
      isConfig = {props.configState}
    >
    </App>
  );
}

export default (AppWrapper);
