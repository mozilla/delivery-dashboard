// @flow

import {createStore, applyMiddleware} from 'redux';
import {deliveryDashboard} from './reducers';
import thunkMiddleware from 'redux-thunk';
import {createLogger} from 'redux-logger';
import type {Store} from './types';

/**
 * Isolate the store creation into a function, so that it can be used outside of the
 * app's execution context, e.g. for testing.
 * @return {object} Redux store.
 */
export default function initializeStore(): Store {
  const loggerMiddleware = createLogger();

  let store: Store = createStore(
    deliveryDashboard,
    applyMiddleware(
      thunkMiddleware, // lets us dispatch() functions
      loggerMiddleware, // neat middleware that logs actions
    ),
  );

  return store;
}
