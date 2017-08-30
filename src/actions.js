/*
 * action types
 */

export const SET_VERSION = 'SET_VERSION';
export const UPDATE_VERSION_INPUT = 'UPDATE_VERSION_INPUT';
export const UPDATE_LATEST_CHANNEL_VERSIONS = 'UPDATE_LATEST_CHANNEL_VERSIONS';
export const REFRESH_STATUSES = 'REFRESH_STATUSES';

/*
 * other constants
 */

export const Channels = {
  NIGHTLY: 'Nightly',
  BETA: 'Beta',
  RELEASE: 'Release',
  ESR: 'ESR',
};

export const Statuses = {
  ERROR: 'error',
  EXISTS: 'exists',
  INCOMPLETE: 'incomplete',
  MISSING: 'missing',
};

/*
 * action creators
 */

export function setVersion(version) {
  return {type: SET_VERSION, version};
}

export function updateVersionInput(version) {
  return {type: UPDATE_VERSION_INPUT, version};
}

export function updateLatestChannelVersions(versions) {
  return {type: UPDATE_LATEST_CHANNEL_VERSIONS, versions};
}

export function refreshStatus(statuses) {
  return {type: REFRESH_STATUSES, statuses};
}
