// @flow

import {
  ADD_CHECK_RESULT,
  SET_VERSION,
  UPDATE_VERSION_INPUT,
  SUBMIT_VERSION,
  UPDATE_LATEST_CHANNEL_VERSIONS,
  UPDATE_POLLBOT_VERSION,
  UPDATE_RELEASE_INFO,
} from './types';
import {
  checkStatus,
  getOngoingVersions,
  getPollbotVersion,
  getReleaseInfo,
} from './PollbotAPI';
import type {
  AddCheckResult,
  APIVersionData,
  CheckInfo,
  CheckResult,
  Dispatch,
  GetState,
  OngoingVersions,
  ReleaseInfo,
  SetVersion,
  SubmitVersion,
  UpdateLatestChannelVersions,
  UpdatePollbotVersion,
  UpdateReleaseInfo,
  UpdateVersionInput,
} from './types';

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

export function updatePollbotVersion(
  version: APIVersionData,
): UpdatePollbotVersion {
  return {type: UPDATE_POLLBOT_VERSION, version};
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

// Refreshing a status for the current version.
export function refreshStatus() {
  const notifyChanges = (checkTitle, status) => {
    if (Notification.permission === 'granted') {
      new Notification(`${checkTitle}: status changed (${status}).`);
    }
  };

  return async function(dispatch: Dispatch, getState: GetState) {
    const state = getState();
    // Save previous results so we can check if something changed.
    const prevResults = state.checkResults;
    dispatch(setVersion(state.version));
    if (state.releaseInfo) {
      const checks = state.releaseInfo.checks.map(
        async ({url, title}: CheckInfo) => {
          const result = await checkStatus(url);
          const prevResult = prevResults[title];
          if (prevResult && prevResult.status !== result.status) {
            notifyChanges(title, result.status);
          }
          dispatch(addCheckResult(title, result));
        },
      );
      try {
        await Promise.all(checks);
      } catch (err) {
        console.error(`Failed getting check results for ${state.version}`, err);
      }
    }
  };
}

// Requesting a status for a new version.
export function requestStatus(version: string) {
  return async function(dispatch: Dispatch) {
    dispatch(setVersion(version));
    const releaseInfo = await getReleaseInfo(version);
    dispatch(updateReleaseInfo(releaseInfo));
    const checks = releaseInfo.checks.map(async ({url, title}: CheckInfo) => {
      const result = await checkStatus(url);
      dispatch(addCheckResult(title, result));
    });
    try {
      await Promise.all(checks);
    } catch (err) {
      console.error(`Failed getting check results for ${version}`, err);
    }
  };
}

// Fetching the ongoing versions.
export function requestOngoingVersions() {
  return async function(dispatch: Dispatch) {
    try {
      const ongoingVersions = await getOngoingVersions();
      dispatch(updateLatestChannelVersions(ongoingVersions));
    } catch (err) {
      console.error('Failed getting the latest channel versions', err);
    }
  };
}

// Update the url from the version stored in the state.
// We do that in a thunk action to have access to the state via "getState".
export const localUrlFromVersion = (version: string) =>
  `#pollbot/firefox/${version}`;
export function updateUrl() {
  return function(dispatch: Dispatch, getState: GetState) {
    window.location.hash = localUrlFromVersion(getState().version);
  };
}

// Fetching the pollbot version.
export function requestPollbotVersion() {
  return async function(dispatch: Dispatch) {
    try {
      const pollbotVersion = await getPollbotVersion();
      dispatch(updatePollbotVersion(pollbotVersion));
    } catch (err) {
      console.error('Failed getting the pollbot version', err);
    }
  };
}
