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
  REQUEST_STATUS,
  REQUEST_LOGIN,
  REQUEST_LOGOUT,
  LOGGED_IN,
  LOGGED_OUT,
  LOGIN_REQUESTED,
  UPDATE_USER_INFO,
} from './types';
import type {
  AddCheckResult,
  APIVersionData,
  CheckResult,
  LoginRequested,
  LoggedIn,
  LoggedOut,
  OngoingVersions,
  RefreshStatus,
  ReleaseInfo,
  RequestLogin,
  RequestLogout,
  RequestOngoingVersions,
  RequestPollbotVersion,
  RequestStatus,
  SetVersion,
  SubmitVersion,
  UpdateLatestChannelVersions,
  UpdatePollbotVersion,
  UpdateReleaseInfo,
  UpdateUrl,
  UpdateUserInfo,
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

export const sortByVersion = (a: string, b: string) => {
  const partsA = a.split('.');
  const partsB = b.split('.');
  if (partsA.length < 2 || partsB.length < 2) {
    // Bogus version, list it last.
    return 1;
  }
  let i = 0;
  while (partsA[i] === partsB[i] && i <= partsA.length) {
    // Skip all the parts that are equal.
    i++;
  }
  if (!partsA[i] || !partsB[i]) {
    // Both versions have the same first parts, but one may have more parts, eg
    // 56.0 and 56.0.1.
    return partsB.length - partsA.length;
  }
  // We have been through all the similar parts, we now have to deal with the
  // first part which is different.
  const subPartRegex = /^(\d+)([a-zA-Z]+)?(\d+)?([a-zA-Z]+)?/; // Eg: 0b12pre
  const subPartA = partsA[i].match(subPartRegex); // Eg: ["0b1pre", "0", "b", "12", "pre"]
  const subPartB = partsB[i].match(subPartRegex);
  if (!subPartA || !subPartB) {
    // Bogus version, list it last.
    return 1;
  }
  if (subPartA[1] !== subPartB[1]) {
    return parseInt(subPartB[1], 10) - parseInt(subPartA[1], 10);
  }
  if (subPartA[2] !== subPartB[2]) {
    // Suffix like 'a' or 'b'.
    if (subPartA[2] && !subPartB[2]) {
      return 1;
    }
    if (subPartB[2] && !subPartA[2]) {
      return -1;
    }
    return subPartB[2].localeCompare(subPartA[2]);
  }
  return parseInt(subPartB[3], 10) - parseInt(subPartA[3], 10);
};

export const capitalizeChannel = ([channel, version]: [string, string]) => [
  channel.charAt(0).toUpperCase() + channel.slice(1),
  version,
];

export function updateLatestChannelVersions(
  versions: OngoingVersions,
): UpdateLatestChannelVersions {
  let versionsArray = Object.entries(versions).map(([channel, version]) => {
    return [channel, (typeof version === 'string' && version) || ''];
  });
  versionsArray.sort((a, b) => sortByVersion(a[1], b[1]));
  const capitalized = versionsArray.map(capitalizeChannel);
  return {type: UPDATE_LATEST_CHANNEL_VERSIONS, versions: capitalized};
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

export function loggedIn(): LoggedIn {
  return {type: LOGGED_IN};
}

export function loggedOut(): LoggedOut {
  return {type: LOGGED_OUT};
}

export function loginRequested(): LoginRequested {
  return {type: LOGIN_REQUESTED};
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

export function requestStatus(version: string): RequestStatus {
  return {type: REQUEST_STATUS, version: version};
}

export function requestLogin(): RequestLogin {
  return {type: REQUEST_LOGIN};
}

export function requestLogout(): RequestLogout {
  return {type: REQUEST_LOGOUT};
}

export function updateUserInfo(userInfo: any): UpdateUserInfo {
  return {type: UPDATE_USER_INFO, userInfo};
}
