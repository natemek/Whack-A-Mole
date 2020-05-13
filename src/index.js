import React from 'react';
import ReactDOM from 'react-dom';
import Parse from 'parse/node';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

Parse.initialize("3uKXhbYQc2aMctaS6bnJa26Q4Ecn7FKLTPbI9jED", "a7PvKS1QzTfpehFDMnR0ebGdPOHwI8ZpDQaB4jkk");
Parse.serverURL = "https://parseapi.back4app.com/";

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();