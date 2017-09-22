// @flow

// import type {Action} from './types';
import {
  REQUEST_ONGOING_VERSIONS,
  REQUEST_POLLBOT_VERSION,
  UPDATE_URL,
} from './types';
import {call, put, select, takeEvery} from 'redux-saga/effects';
import {getOngoingVersions, getPollbotVersion} from './PollbotAPI';
import {
  localUrlFromVersion,
  updateLatestChannelVersions,
  updatePollbotVersion,
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

export function* rootSaga(): Saga {
  yield [
    takeEvery(REQUEST_ONGOING_VERSIONS, fetchOngoingVersions),
    takeEvery(REQUEST_POLLBOT_VERSION, fetchPollbotVersion),
    takeEvery(UPDATE_URL, updateUrl),
  ];
}
