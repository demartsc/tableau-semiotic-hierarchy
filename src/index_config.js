import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import AppWrapper from './AppWrapper';
import "typeface-roboto";

ReactDOM.render(<AppWrapper configState={true} />, document.getElementById('root'));
