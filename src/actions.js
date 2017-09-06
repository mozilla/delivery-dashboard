// @flow

import {
  SET_VERSION,
  UPDATE_VERSION_INPUT,
  SUBMIT_VERSION,
  UPDATE_LATEST_CHANNEL_VERSIONS,
  UPDATE_STATUSES,
  UPDATE_RELEASE_INFO,
} from './types.js';
import {getOngoingVersions, getReleaseInfo, getStatuses} from './PollbotAPI.js';
import type {
  Dispatch,
  GetState,
  OngoingVersions,
  ReleaseInfo,
  SetVersion,
  Statuses,
  SubmitVersion,
  ThunkAction,
  UpdateLatestChannelVersions,
  UpdateReleaseInfo,
  UpdateStatuses,
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

export function updateStatuses(statuses: Statuses): UpdateStatuses {
  return {type: UPDATE_STATUSES, statuses};
}

export function updateReleaseInfo(releaseInfo: ReleaseInfo): UpdateReleaseInfo {
  return {type: UPDATE_RELEASE_INFO, releaseInfo};
}

// ASYNC (THUNK) ACTIONS.

// Fetching the statuses.
export function requestStatus(version: ?string): ThunkAction<void> {
  const notifyChanges = changed => {
    if (Notification.permission === 'granted') {
      const names = changed.map(s => s.replace('_', ' ')).join(', ');
      new Notification(`${document.title}: Status of ${names} changed.`);
    }
  };

  return function(dispatch: Dispatch, getState: GetState) {
    const versionToCheck = version || getState().version;
    if (!versionToCheck) {
      return;
    }
    getReleaseInfo(versionToCheck)
      .then(releaseInfo => {
        dispatch(updateReleaseInfo(releaseInfo));
      })
      .catch((err: string) => {
        console.error(
          `Failed getting the release info for ${versionToCheck}`,
          err,
        );
      });

    getStatuses(versionToCheck)
      .then(statuses => {
        // Detect if some status changed, and notify!
        const changed = Object.keys(statuses).filter(key => {
          const previous = getState().statuses[key];
          return previous !== null && previous.status !== statuses[key].status;
        });
        if (changed.length > 0) {
          notifyChanges(changed);
        }
        // Save current state.
        const normalizedStatuses: Statuses = {
          archive: statuses.archive || null,
          product_details: statuses.product_details || null,
          release_notes: statuses.release_notes || null,
          security_advisories: statuses.security_advisories || null,
          download_links: statuses.download_links || null,
        };
        dispatch(updateStatuses(normalizedStatuses));
      })
      .catch((err: string) => {
        console.error(`Failed getting the statuses for ${versionToCheck}`, err);
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
