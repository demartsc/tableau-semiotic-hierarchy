import React, { Component } from 'react';
import App from './App';
import parse from 'url-parse';

class AppWrapper extends Component {

  render() {
    const configState = parse(window.location.href).hash === '#true';
    const annotationState = parse(window.location.href).hash === '#annotation';

    return(
      <App
        isConfig = {configState}
        isAnnotation = {annotationState}
      >
      </App>
    );
  }

}

export default (AppWrapper);
