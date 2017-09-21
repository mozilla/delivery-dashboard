// @flow

// import type {Action} from './types';
import {REQUEST_ONGOING_VERSIONS, REQUEST_POLLBOT_VERSION} from './types';
import {call, put, takeEvery} from 'redux-saga/effects';
import {getOngoingVersions, getPollbotVersion} from './PollbotAPI';
import {updateLatestChannelVersions, updatePollbotVersion} from './actions';

// Fetching the version from the Pollbot service.
export function* fetchPollbotVersion(): Generator<*, void, *> {
  try {
    const version = yield call(getPollbotVersion);
    yield put(updatePollbotVersion(version));
  } catch (err) {
    console.error('Failed getting the pollbot version', err);
  }
}

// Fetching the ongoing versions.
export function* fetchOngoingVersions(): Generator<*, void, *> {
  try {
    const ongoingVersions = yield call(getOngoingVersions);
    yield put(updateLatestChannelVersions(ongoingVersions));
  } catch (err) {
    console.error('Failed getting the latest channel versions', err);
  }
}

export function* rootSaga(): Generator<*, void, *> {
  yield [
    takeEvery(REQUEST_ONGOING_VERSIONS, fetchOngoingVersions),
    takeEvery(REQUEST_POLLBOT_VERSION, fetchPollbotVersion),
  ];
}
