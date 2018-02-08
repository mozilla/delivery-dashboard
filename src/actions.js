// @flow

import {
  ADD_CHECK_RESULT,
  REFRESH_CHECK_RESULT,
  ADD_SERVER_ERROR,
  SET_VERSION,
  UPDATE_PRODUCT_VERSIONS,
  UPDATE_POLLBOT_VERSION,
  UPDATE_RELEASE_INFO,
  REQUEST_ONGOING_VERSIONS,
  REQUEST_POLLBOT_VERSION,
  UPDATE_URL,
  REFRESH_STATUS,
  REQUEST_STATUS
} from "./types";
import type {
  AddCheckResult,
  AddServerError,
  APIVersionData,
  CheckResult,
  VersionsDict,
  Product,
  RefreshCheckResult,
  RefreshStatus,
  ReleaseInfo,
  RequestOngoingVersions,
  RequestPollbotVersion,
  RequestStatus,
  SetVersion,
  UpdateProductVersions,
  UpdatePollbotVersion,
  UpdateReleaseInfo,
  UpdateUrl
} from "./types";

// Small utility function.
export const localUrlFromVersion = ([product, version]: [Product, string]) =>
  `#pollbot/${product}/${version}`;

/*
 * action creators
 */

export function setVersion(product: Product, version: string): SetVersion {
  return { type: SET_VERSION, product, version };
}

export const sortByVersion = (a: string, b: string) => {
  const partsA = a.split(".");
  const partsB = b.split(".");
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

export const capitalize = (item: string) =>
  item.charAt(0).toUpperCase() + item.slice(1);

export const capitalizeChannel = ([channel, version]: [string, string]) => [
  capitalize(channel),
  version
];

export function updateProductVersions(
  product: Product,
  versions: VersionsDict
): UpdateProductVersions {
  return { type: UPDATE_PRODUCT_VERSIONS, product, versions };
}

export function updatePollbotVersion(
  version: APIVersionData
): UpdatePollbotVersion {
  return { type: UPDATE_POLLBOT_VERSION, version };
}

export function updateReleaseInfo(releaseInfo: ReleaseInfo): UpdateReleaseInfo {
  return { type: UPDATE_RELEASE_INFO, releaseInfo };
}

export function addCheckResult(
  title: string,
  result: CheckResult
): AddCheckResult {
  return { type: ADD_CHECK_RESULT, title, result };
}

export function refreshCheckResult(title: string): RefreshCheckResult {
  return { type: REFRESH_CHECK_RESULT, title };
}

export function addServerError(title: string, err: string): AddServerError {
  return { type: ADD_SERVER_ERROR, title, err };
}

// For sagas
export function requestPollbotVersion(): RequestPollbotVersion {
  return { type: REQUEST_POLLBOT_VERSION };
}

export function requestOngoingVersions(): RequestOngoingVersions {
  return { type: REQUEST_ONGOING_VERSIONS };
}

export function updateUrl(): UpdateUrl {
  return { type: UPDATE_URL };
}

export function refreshStatus(): RefreshStatus {
  return { type: REFRESH_STATUS };
}

export function requestStatus(
  product: Product,
  version: string
): RequestStatus {
  return { type: REQUEST_STATUS, product, version };
}
