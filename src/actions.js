// @flow

import {
  ADD_CHECK_RESULT,
  SET_VERSION,
  UPDATE_VERSION_INPUT,
  SUBMIT_VERSION,
  UPDATE_LATEST_CHANNEL_VERSIONS,
  UPDATE_RELEASE_INFO,
} from './types.js';
import {checkStatus, getOngoingVersions, getReleaseInfo} from './PollbotAPI.js';
import type {
  AddCheckResult,
  CheckInfo,
  CheckResult,
  Dispatch,
  GetState,
  OngoingVersions,
  ReleaseInfo,
  SetVersion,
  SubmitVersion,
  ThunkAction,
  UpdateLatestChannelVersions,
  UpdateReleaseInfo,
  UpdateVersionInput,
} from './types.js';

/*
 * action creators
 */

export function setVersion(version: string): SetVersion {
  return {type: SET_VERSION, version};
}

export function updateVersionInput(version: string): UpdateVersionInput {
  return {type: UPDATE_VERSION_INPUT, version};
}

export function submitVersion(): SubmitVersion {
  return {type: SUBMIT_VERSION};
}

export function updateLatestChannelVersions(
  versions: OngoingVersions,
): UpdateLatestChannelVersions {
  return {type: UPDATE_LATEST_CHANNEL_VERSIONS, versions};
}

export function updateReleaseInfo(releaseInfo: ReleaseInfo): UpdateReleaseInfo {
  return {type: UPDATE_RELEASE_INFO, releaseInfo};
}

export function addCheckResult(
  title: string,
  result: CheckResult,
): AddCheckResult {
  return {type: ADD_CHECK_RESULT, title, result};
}

// ASYNC (THUNK) ACTIONS.

// Fetching the statuses.
export function requestStatus(version: ?string): ThunkAction<void> {
  const notifyChanges = (checkTitle, status) => {
    if (Notification.permission === 'granted') {
      new Notification(`${checkTitle} : status changed (${status}).`);
    }
  };

  return function(dispatch: Dispatch, getState: GetState) {
    const versionToCheck = version || getState().version;
    if (!versionToCheck) {
      return;
    }
    dispatch(setVersion(versionToCheck));
    getReleaseInfo(versionToCheck)
      .then(releaseInfo => {
        dispatch(updateReleaseInfo(releaseInfo));
        releaseInfo.checks.map((check: CheckInfo) => {
          return checkStatus(check.url).then(result => {
            // Detect if the result changed, and notify!
            const prevResult = getState().checkResults[check.title];
            if (prevResult && prevResult.status !== result.status) {
              notifyChanges(check.title, result.status);
            }
            dispatch(addCheckResult(check.title, result));
          });
        });
      })
      .catch((err: string) => {
        console.error(
          `Failed getting the release info for ${versionToCheck}`,
          err,
        );
      });
  };
}

// Fetching the ongoing versions.
export function requestOngoingVersions() {
  return function(dispatch: Dispatch) {
    getOngoingVersions()
      .then(data => {
        dispatch(updateLatestChannelVersions(data));
      })
      .catch((err: string) =>
        console.error('Failed getting the latest channel versions', err),
      );
  };
}

// Update the url from the version stored in the state.
// We do that in a thunk action to have access to the state via "getState".
export const localUrlFromVersion = (version: string) =>
  `#pollbot/firefox/${version}`;
export function updateUrl(): ThunkAction<void> {
  return function(dispatch: Dispatch, getState: GetState) {
    window.location.hash = localUrlFromVersion(getState().version);
  };
}
