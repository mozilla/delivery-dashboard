// @flow

import type {OngoingVersions, GetState, Statuses} from './types.js';
import type {Dispatch} from 'redux';

/*
 * action types
 */
export const SET_VERSION = 'SET_VERSION';
export const UPDATE_VERSION_INPUT = 'UPDATE_VERSION_INPUT';
export const SUBMIT_VERSION = 'SUBMIT_VERSION';
export const UPDATE_LATEST_CHANNEL_VERSIONS = 'UPDATE_LATEST_CHANNEL_VERSIONS';
export const UPDATE_STATUSES = 'UPDATE_STATUSES';

type SetVersion = {
  type: 'SET_VERSION',
  version: string,
};
type UpdateVersionInput = {
  type: 'UPDATE_VERSION_INPUT',
  version: string,
};
type SubmitVersion = {
  type: 'SUBMIT_VERSION',
};
type UpdateLatestChannelVersions = {
  type: 'UPDATE_LATEST_CHANNEL_VERSIONS',
  versions: OngoingVersions,
};
type UpdateStatuses = {
  type: 'UPDATE_STATUSES',
  statuses: Statuses,
};
export type Action =
  | SetVersion
  | UpdateVersionInput
  | SubmitVersion
  | UpdateLatestChannelVersions
  | UpdateStatuses;

/*
 * action creators
 */

export function setVersion(version: string): Action {
  return {type: SET_VERSION, version};
}

export function updateVersionInput(version: string): Action {
  return {type: UPDATE_VERSION_INPUT, version};
}

export function submitVersion(): Action {
  return {type: SUBMIT_VERSION};
}

export function updateLatestChannelVersions(
  versions: OngoingVersions,
): UpdateLatestChannelVersions {
  return {type: UPDATE_LATEST_CHANNEL_VERSIONS, versions};
}

export function updateStatuses(statuses: Statuses): Action {
  return {type: UPDATE_STATUSES, statuses};
}

// ASYNC (THUNK) ACTIONS.

// Fetching the statuses.
function fetchStatus(version: string): Promise<*> {
  const stateToUrl = {
    archive: 'archive',
    release_notes: 'bedrock/release-notes',
    security_advisories: 'bedrock/security-advisories',
    download_links: 'bedrock/download-links',
    product_details: 'product-details',
  };
  return Promise.all(
    Object.keys(stateToUrl).map(key => {
      const endpoint = stateToUrl[key];
      return fetch(
        `https://pollbot.dev.mozaws.net/v1/firefox/${version}/${endpoint}`,
      )
        .then(resp => resp.json())
        .then(details => ({key, details}));
    }),
  ).then(results =>
    results.reduce((acc, {key, details}) => {
      acc[key] = details;
      return acc;
    }, {}),
  );
}

export function requestStatus(version: ?string) {
  const notifyChanges = changed => {
    // $FlowFixMe
    if (Notification.permission === 'granted') {
      const names = changed.map(s => s.replace('_', ' ')).join(', ');
      new Notification(`${document.title}: Status of ${names} changed.`);
    }
  };

  return function(dispatch: Dispatch, getState: GetState) {
    version = version || getState().version;
    if (!version) {
      return;
    }
    fetchStatus(version)
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
      .catch(err =>
        console.error('Failed getting the latest channel versions', err),
      );
  };
}

// Fetching the ongoing versions.
export function requestOngoingVersions() {
  return function(dispatch: Dispatch) {
    fetch('https://pollbot.dev.mozaws.net/v1/firefox/ongoing-versions')
      .then(resp => resp.json())
      .then(data => {
        dispatch(updateLatestChannelVersions(data));
      })
      .catch(err =>
        console.error('Failed getting the latest channel versions', err),
      );
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
