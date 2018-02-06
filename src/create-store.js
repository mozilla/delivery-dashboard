// @flow

import { createStore, applyMiddleware, compose } from "redux";
import { deliveryDashboard } from "./reducers";
import createSagaMiddleware from "redux-saga";
import thunkMiddleware from "redux-thunk";
import { createLogger } from "redux-logger";
import type { Store } from "./types";
import { rootSaga } from "./sagas";

/**
 * Isolate the store creation into a function, so that it can be used outside of the
 * app's execution context, e.g. for testing.
 * @return {object} Redux store.
 */
export default function initializeStore(): Store {
  const loggerMiddleware = createLogger();
  const sagaMiddleware = createSagaMiddleware();
  // This is the middleware needed for the redux-devtools extension.
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  let store: Store = createStore(
    deliveryDashboard,
    // $FlowFixMe
    composeEnhancers(
      applyMiddleware(
        sagaMiddleware,
        thunkMiddleware, // lets us dispatch() functions
        loggerMiddleware // neat middleware that logs actions
      )
    )
  );
  sagaMiddleware.run(rootSaga);

  return store;
}
