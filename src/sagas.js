// @flow

// import type {Action} from './types';
import {REQUEST_POLLBOT_VERSION} from './types';
import {call, put, takeEvery} from 'redux-saga/effects';
import {getPollbotVersion} from './PollbotAPI';
import {updatePollbotVersion} from './actions';

export function* fetchPollbotVersion(): Generator<*, void, *> {
  try {
    const version = yield call(getPollbotVersion);
    yield put(updatePollbotVersion(version));
  } catch (e) {
    console.error('Failed getting the pollbot version', e);
  }
}

export function* rootSaga(): Generator<*, void, *> {
  yield [takeEvery(REQUEST_POLLBOT_VERSION, fetchPollbotVersion)];
}
