import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import AppWrapper from './AppWrapper';

ReactDOM.render(<AppWrapper configState={false} />, document.getElementById('root'));
