// @flow

import {
  ADD_CHECK_RESULT,
  SET_VERSION,
  UPDATE_VERSION_INPUT,
  SUBMIT_VERSION,
  UPDATE_LATEST_CHANNEL_VERSIONS,
  UPDATE_POLLBOT_VERSION,
  UPDATE_RELEASE_INFO,
  REQUEST_ONGOING_VERSIONS,
  REQUEST_POLLBOT_VERSION,
  UPDATE_URL,
  REFRESH_STATUS,
} from './types';
import {checkStatus, getReleaseInfo} from './PollbotAPI';
import type {
  AddCheckResult,
  APIVersionData,
  CheckInfo,
  CheckResult,
  Dispatch,
  OngoingVersions,
  RefreshStatus,
  ReleaseInfo,
  RequestOngoingVersions,
  RequestPollbotVersion,
  SetVersion,
  SubmitVersion,
  UpdateLatestChannelVersions,
  UpdatePollbotVersion,
  UpdateReleaseInfo,
  UpdateUrl,
  UpdateVersionInput,
} from './types';

// Small utility function.
export const localUrlFromVersion = (version: string) =>
  `#pollbot/firefox/${version}`;

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

// For sagas
export function requestPollbotVersion(): RequestPollbotVersion {
  return {type: REQUEST_POLLBOT_VERSION};
}

export function requestOngoingVersions(): RequestOngoingVersions {
  return {type: REQUEST_ONGOING_VERSIONS};
}

export function updateUrl(): UpdateUrl {
  return {type: UPDATE_URL};
}

export function refreshStatus(): RefreshStatus {
  return {type: REFRESH_STATUS};
}

// ASYNC (THUNK) ACTIONS.

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
