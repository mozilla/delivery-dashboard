// @flow

import {
  ADD_CHECK_RESULT,
  SET_VERSION,
  SUBMIT_VERSION,
  UPDATE_LATEST_CHANNEL_VERSIONS,
  UPDATE_POLLBOT_VERSION,
  UPDATE_VERSION_INPUT,
  UPDATE_RELEASE_INFO,
} from './types.js';
import type {Action, State} from './types.js';

const initialState: State = {
  version: '',
  versionInput: '',
  latestChannelVersions: null,
  releaseInfo: null,
  checkResults: {},
  pollbotVersion: null,
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
      });
    case SET_VERSION:
      return Object.assign({}, state, {
        version: action.version,
        versionInput: action.version,
        checkResults: {},
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
    default:
      return state;
  }
}
