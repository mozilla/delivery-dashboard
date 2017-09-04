// @flow
import './index.css';
import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import {deliveryDashboard} from './reducers';
import thunkMiddleware from 'redux-thunk';
import {createLogger} from 'redux-logger';
import type {Store} from './types.js';

const loggerMiddleware = createLogger();

let store: Store = createStore(
  deliveryDashboard,
  applyMiddleware(
    thunkMiddleware, // lets us dispatch() functions
    loggerMiddleware, // neat middleware that logs actions
  ),
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
registerServiceWorker();
