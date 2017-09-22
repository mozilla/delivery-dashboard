// @flow

import {
  REQUEST_ONGOING_VERSIONS,
  REQUEST_POLLBOT_VERSION,
  UPDATE_URL,
  REFRESH_STATUS,
  REQUEST_STATUS,
} from './types';
import type {RequestStatus} from './types';
import {all, call, put, select, takeEvery} from 'redux-saga/effects';
import {
  checkStatus,
  getOngoingVersions,
  getPollbotVersion,
  getReleaseInfo,
} from './PollbotAPI';
import {
  addCheckResult,
  localUrlFromVersion,
  setVersion,
  updateLatestChannelVersions,
  updatePollbotVersion,
  updateReleaseInfo,
} from './actions';

type Saga = Generator<*, void, *>;

// Fetching the version from the Pollbot service.
export function* fetchPollbotVersion(): Saga {
  try {
    const version = yield call(getPollbotVersion);
    yield put(updatePollbotVersion(version));
  } catch (err) {
    console.error('Failed getting the pollbot version', err);
  }
}

// Fetching the ongoing versions.
export function* fetchOngoingVersions(): Saga {
  try {
    const ongoingVersions = yield call(getOngoingVersions);
    yield put(updateLatestChannelVersions(ongoingVersions));
  } catch (err) {
    console.error('Failed getting the latest channel versions', err);
  }
}

// Update the url from the version stored in the state.
export function* updateUrl(): Saga {
  const state = yield select();
  window.location.hash = localUrlFromVersion(state.version);
}

// Refreshing a status for the current version.
export function* refreshStatus(): Saga {
  const notifyChanges = (checkTitle, status) => {
    if (Notification.permission === 'granted') {
      new Notification(`${checkTitle}: status changed (${status}).`);
    }
  };

  const state = yield select();
  // Save previous results so we can check if something changed.
  const prevResults = state.checkResults;
  yield put(setVersion(state.version));
  if (state.releaseInfo) {
    let checks = {};
    state.releaseInfo.checks.map(
      ({url, title}) => (checks[title] = call(checkStatus, url)),
    );
    try {
      const checkResults = yield all(checks);
      const addResults = Object.keys(checkResults).map(title => {
        const result = checkResults[title];
        const prevResult = prevResults[title];
        if (prevResult && prevResult.status !== result.status) {
          notifyChanges(title, result.status);
        }
        return put(addCheckResult(title, result));
      });
      yield all(addResults);
    } catch (err) {
      console.error(`Failed getting check results for ${state.version}`, err);
    }
  }
}

// Requesting a status for a new version.
export function* requestStatus(action: RequestStatus): Saga {
  const version = action.version;
  yield put(setVersion(version));
  const releaseInfo = yield call(getReleaseInfo, version);
  yield put(updateReleaseInfo(releaseInfo));
  let checks = {};
  releaseInfo.checks.map(
    ({url, title}) => (checks[title] = call(checkStatus, url)),
  );
  try {
    const checkResults = yield all(checks);
    const addResults = Object.keys(checkResults).map(title => {
      const result = checkResults[title];
      return put(addCheckResult(title, result));
    });
    yield all(addResults);
  } catch (err) {
    console.error(`Failed getting check results for ${version}`, err);
  }
}

export function* rootSaga(): Saga {
  yield all([
    takeEvery(REQUEST_ONGOING_VERSIONS, fetchOngoingVersions),
    takeEvery(REQUEST_POLLBOT_VERSION, fetchPollbotVersion),
    takeEvery(UPDATE_URL, updateUrl),
    takeEvery(REFRESH_STATUS, refreshStatus),
    takeEvery(REQUEST_STATUS, requestStatus),
  ]);
}
