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
} from './types';
import type {
  AddCheckResult,
  APIVersionData,
  CheckResult,
  OngoingVersions,
  RefreshStatus,
  ReleaseInfo,
  RequestOngoingVersions,
  RequestPollbotVersion,
  RequestStatus,
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

const sortVersions = filters => {
  return filters.sort((a, b) => {
    const versionA = (typeof a[1] === 'string' && a[1]) || '';
    const versionB = (typeof b[1] === 'string' && b[1]) || '';
    const partsA = versionA.split('.');
    const partsB = versionB.split('.');
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
      // Both versions have the same parts, but one has more parts, eg 56.0 and 56.0.1.
      return partsB.length - partsA.length;
    }
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
      if (subPartA[2] && !subPartB[2]) {
        return 1;
      }
      if (subPartB[2] && !subPartA[2]) {
        return -1;
      }
      return subPartB[2].localeCompare(subPartA[2]);
    }
    if (subPartA[3] !== subPartB[3]) {
      return parseInt(subPartB[3], 10) - parseInt(subPartA[3], 10);
    }
    return parseInt(partsB[2], 10) - parseInt(partsA[2], 10);
  });
};

export function updateLatestChannelVersions(
  versions: OngoingVersions,
): UpdateLatestChannelVersions {
  let versionsArray = Object.entries(versions).map(([channel, version]) => [
    channel,
    (typeof version === 'string' && version) || '',
  ]);
  sortVersions(versionsArray);
  return {type: UPDATE_LATEST_CHANNEL_VERSIONS, versions: versionsArray};
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

export function requestStatus(version: string): RequestStatus {
  return {type: REQUEST_STATUS, version: version};
}
