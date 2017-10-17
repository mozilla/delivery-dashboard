// @flow
import ConnectedApp from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import {Provider} from 'react-redux';
import createStore from './create-store';

const root = document && document.getElementById('root');

if (root) {
  ReactDOM.render(
    <Provider store={createStore()}>
      <ConnectedApp />
    </Provider>,
    root,
  );
  registerServiceWorker();
}
