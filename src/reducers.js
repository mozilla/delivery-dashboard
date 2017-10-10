// @flow

import {
  ADD_CHECK_RESULT,
  SET_VERSION,
  SUBMIT_VERSION,
  UPDATE_LATEST_CHANNEL_VERSIONS,
  UPDATE_POLLBOT_VERSION,
  UPDATE_VERSION_INPUT,
  UPDATE_RELEASE_INFO,
  LOGGED_IN,
  LOGGED_OUT,
  LOGIN_REQUESTED,
} from './types';
import type {Action, State} from './types';

export const initialState: State = {
  version: '',
  versionInput: '',
  latestChannelVersions: [],
  releaseInfo: null,
  checkResults: {},
  pollbotVersion: null,
  shouldRefresh: false,
  login: LOGGED_OUT,
};

export function deliveryDashboard(
  state: State = initialState,
  action: Action,
): State {
  switch (action.type) {
    case ADD_CHECK_RESULT:
      return Object.assign({}, state, {
        checkResults: Object.assign({}, state.checkResults, {
          [action.title]: action.result,
        }),
        shouldRefresh:
          action.result.status !== 'exists' ? true : state.shouldRefresh,
      });
    case SET_VERSION:
      return Object.assign({}, state, {
        version: action.version,
        versionInput: action.version,
        checkResults: {},
        shouldRefresh: false,
      });
    case UPDATE_VERSION_INPUT:
      return Object.assign({}, state, {
        versionInput: action.version,
      });
    case SUBMIT_VERSION:
      return Object.assign({}, state, {
        version: state.versionInput,
      });
    case UPDATE_LATEST_CHANNEL_VERSIONS:
      return Object.assign({}, state, {
        latestChannelVersions: action.versions,
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
      });
    case LOGIN_REQUESTED:
      return Object.assign({}, state, {
        login: LOGIN_REQUESTED,
      });
    default:
      return state;
  }
}
