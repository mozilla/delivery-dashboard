// @flow
import './index.css';
import ConnectedApp from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import {Provider} from 'react-redux';
import createStore from './create-store';

ReactDOM.render(
  <Provider store={createStore()}>
    <ConnectedApp />
  </Provider>,
  document.getElementById('root'),
);
registerServiceWorker();
