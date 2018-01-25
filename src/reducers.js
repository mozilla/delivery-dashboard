// @flow

import {
  ADD_CHECK_RESULT,
  REFRESH_CHECK_RESULT,
  ADD_SERVER_ERROR,
  SET_VERSION,
  UPDATE_LATEST_CHANNEL_VERSIONS,
  UPDATE_POLLBOT_VERSION,
  UPDATE_RELEASE_INFO,
  LOGGED_IN,
  LOGGED_OUT,
  LOGIN_REQUESTED,
  UPDATE_USER_INFO,
} from './types';
import type {Action, State} from './types';

export const initialState: State = {
  version: ['', ''],
  latestChannelVersions: {firefox: {}, devedition: {}},
  releaseInfo: null,
  checkResults: {},
  pollbotVersion: null,
  shouldRefresh: false,
  login: LOGGED_OUT,
  userInfo: null,
  errors: [],
};

export function deliveryDashboard(
  state: State = initialState,
  action: Action,
): State {
  let errors;
  let updatedCheckResults;
  switch (action.type) {
    case ADD_CHECK_RESULT:
      return Object.assign({}, state, {
        checkResults: Object.assign({}, state.checkResults, {
          [action.title]: action.result,
        }),
        shouldRefresh:
          action.result.status !== 'exists' ? true : state.shouldRefresh,
      });
    case REFRESH_CHECK_RESULT:
      updatedCheckResults = Object.assign({}, state.checkResults);
      delete updatedCheckResults[action.title];
      return Object.assign({}, state, {
        checkResults: updatedCheckResults,
      });
    case ADD_SERVER_ERROR:
      errors = state.errors.slice();
      errors.push([action.title, action.err]);
      return Object.assign({}, state, {
        errors: errors,
        shouldRefresh: true,
      });
    case SET_VERSION:
      return Object.assign({}, state, {
        version: [action.product, action.version],
        checkResults: {},
        shouldRefresh: false,
        errors: [],
      });
    case UPDATE_LATEST_CHANNEL_VERSIONS:
      return Object.assign({}, state, {
        latestChannelVersions: Object.assign({}, state.latestChannelVersions, {
          [action.product]: action.versions,
        }),
      });
    case UPDATE_RELEASE_INFO:
      return Object.assign({}, state, {
        releaseInfo: action.releaseInfo,
      });
    case UPDATE_POLLBOT_VERSION:
      return Object.assign({}, state, {
        pollbotVersion: action.version,
      });
    case LOGGED_IN:
      return Object.assign({}, state, {
        login: LOGGED_IN,
      });
    case LOGGED_OUT:
      return Object.assign({}, state, {
        login: LOGGED_OUT,
        userInfo: null,
      });
    case LOGIN_REQUESTED:
      return Object.assign({}, state, {
        login: LOGIN_REQUESTED,
      });
    case UPDATE_USER_INFO:
      return Object.assign({}, state, {
        userInfo: action.userInfo,
      });
    default:
      return state;
  }
}
