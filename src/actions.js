/*
 * action types
 */

export const SET_VERSION = 'SET_VERSION';
export const UPDATE_VERSION_INPUT = 'UPDATE_VERSION_INPUT';
export const SUBMIT_VERSION = 'SUBMIT_VERSION';
export const UPDATE_LATEST_CHANNEL_VERSIONS = 'UPDATE_LATEST_CHANNEL_VERSIONS';
export const UPDATE_STATUSES = 'UPDATE_STATUSES';

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

export function submitVersion() {
  return {type: SUBMIT_VERSION};
}

export function updateLatestChannelVersions(versions) {
  return {type: UPDATE_LATEST_CHANNEL_VERSIONS, versions};
}

export function updateStatus(statuses) {
  return {type: UPDATE_STATUSES, statuses};
}

// ASYNC (THUNK) ACTIONS.

// Fetching the statuses.
function fetchStatus(version) {
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

export function requestStatus(version) {
  const notifyChanges = changed => {
    if (Notification.permission === 'granted') {
      const names = changed.map(s => s.replace('_', ' ')).join(', ');
      new Notification(`${document.title}: Status of ${names} changed.`);
    }
  };

  return function(dispatch, getState) {
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
        dispatch(updateStatus(statuses));
      })
      .catch(err =>
        console.error('Failed getting the latest channel versions', err),
      );
  };
}

// Fetching the ongoing versions.
export function requestOngoingVersions() {
  return function(dispatch) {
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
export const localUrlFromVersion = version => `#pollbot/firefox/${version}`;
export function updateUrl() {
  return function(dispatch, getState) {
    window.location.hash = localUrlFromVersion(getState().version);
  };
}
