// @flow

import {
  REQUEST_ONGOING_VERSIONS,
  REQUEST_POLLBOT_VERSION,
  UPDATE_URL,
  REFRESH_STATUS,
  REQUEST_STATUS,
  REQUEST_LOGIN,
  REQUEST_LOGOUT,
} from './types';
import type {
  APIVersionData,
  CheckResult,
  OngoingVersionsDict,
  ReleaseInfo,
  RequestStatus,
  State,
} from './types';
import {all, call, put, select, takeEvery} from 'redux-saga/effects';
import {
  checkStatus,
  getOngoingVersions,
  getPollbotVersion,
  getReleaseInfo,
} from './PollbotAPI';
import {
  addCheckResult,
  addServerError,
  localUrlFromVersion,
  loggedOut,
  loginRequested,
  refreshCheckResult,
  setVersion,
  updateLatestChannelVersions,
  updatePollbotVersion,
  updateReleaseInfo,
} from './actions';
import {login, logout} from './auth0';

type Saga = Generator<*, void, *>;

// Fetching the version from the Pollbot service.
export function* fetchPollbotVersion(): Saga {
  try {
    const version: APIVersionData = yield call(getPollbotVersion);
    yield put(updatePollbotVersion(version));
  } catch (err) {
    console.error('Failed getting the pollbot version', err);
  }
}

// Fetching the ongoing versions.
export function* fetchOngoingVersions(): Saga {
  try {
    const ongoingVersions: OngoingVersionsDict = yield call(getOngoingVersions);
    yield put(updateLatestChannelVersions(ongoingVersions));
  } catch (err) {
    console.error('Failed getting the latest channel versions', err);
  }
}

// Update the url from the version stored in the state.
export function* updateUrl(): Saga {
  const state: State = yield select();
  window.location.hash = localUrlFromVersion(state.version);
}

export function* checkResultAndUpdateAndNotify(
  title: string,
  url: string,
  prevResult: CheckResult,
): Saga {
  const notifyChanges = (checkTitle, status) => {
    if (Notification.permission === 'granted') {
      new Notification(`${checkTitle}: status changed (${status}).`);
    }
  };

  // Make sure the check we're refreshing is shown as being refreshed.
  yield put(refreshCheckResult(title));
  yield call(checkResultAndUpdate, title, url);
  const state: State = yield select();
  const result: CheckResult = state.checkResults && state.checkResults[title];
  if (prevResult && result && prevResult.status !== result.status) {
    notifyChanges(title, result.status);
  }
}

// Refreshing a status for the current version.
export function* refreshStatus(): Saga {
  const state: State = yield select();
  // Save previous results so we can check if something changed.
  const prevResults = state.checkResults;
  if (state.releaseInfo && state.releaseInfo.checks) {
    yield all(
      state.releaseInfo.checks
        // only refresh checks that were failing.
        .filter(({title}) => state.checkResults[title].status !== 'exists')
        .map(({url, title}) =>
          call(checkResultAndUpdateAndNotify, title, url, prevResults[title]),
        ),
    );
  }
}

export function* checkResultAndUpdate(title: string, url: string): Saga {
  try {
    const result = yield call(checkStatus, url);
    yield put(addCheckResult(title, result));
  } catch (err) {
    console.error(`Failed getting ${title} check result`, err);
    yield put(addServerError(title, err));
  }
}

// Requesting a status for a new version.
export function* requestStatus(action: RequestStatus): Saga {
  let {version} = action;
  let state: State = yield select();
  try {
    if (Object.keys(state.latestChannelVersions).length === 0) {
      yield call(fetchOngoingVersions);
      state = yield select();
    }
    if (state.latestChannelVersions.hasOwnProperty(version)) {
      version = state.latestChannelVersions[version];
    }
    yield put(setVersion(version));
    yield call(updateUrl);
    const releaseInfo: ReleaseInfo = yield call(getReleaseInfo, version);
    yield put(updateReleaseInfo(releaseInfo));
    yield all(
      releaseInfo.checks.map(({url, title}) =>
        call(checkResultAndUpdate, title, url),
      ),
    );
  } catch (err) {
    console.error(`Failed getting the release info for ${version}`, err);
  }
}

// Requesting a auth0 login.
export function* requestLogin(): Saga {
  try {
    yield put(loginRequested());
    yield call(login);
  } catch (err) {
    console.error('Login failed', err);
    yield put(loggedOut());
  }
}

// Requesting a logout.
export function* requestLogout(): Saga {
  try {
    yield call(logout);
    yield put(loggedOut());
  } catch (err) {
    console.error('Logout failed', err);
  }
}

// Root saga.
export function* rootSaga(): Saga {
  yield all([
    takeEvery(REQUEST_ONGOING_VERSIONS, fetchOngoingVersions),
    takeEvery(REQUEST_POLLBOT_VERSION, fetchPollbotVersion),
    takeEvery(UPDATE_URL, updateUrl),
    takeEvery(REFRESH_STATUS, refreshStatus),
    takeEvery(REQUEST_STATUS, requestStatus),
    takeEvery(REQUEST_LOGIN, requestLogin),
    takeEvery(REQUEST_LOGOUT, requestLogout),
  ]);
}
