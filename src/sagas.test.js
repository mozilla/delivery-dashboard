import {call, put, takeEvery} from 'redux-saga/effects';
import {cloneableGenerator} from 'redux-saga/utils';
import {getPollbotVersion} from './PollbotAPI';
import {updatePollbotVersion} from './actions';
import {REQUEST_POLLBOT_VERSION} from './types';
import {fetchPollbotVersion, rootSaga} from './sagas';

describe('sagas', () => {
  it('handles requestPollbotVersion', () => {
    const data = {};
    data.saga = cloneableGenerator(fetchPollbotVersion)();

    const pollbotVersion = {
      name: 'pollbot',
      source: 'https://github.com/mozilla/PollBot.git',
      version: '0.2.1-22-g8e09a0f',
      commit: '8e09a0f8e995344ea24fbb940a6bddc17e0edaed',
    };
    expect(data.saga.next().value).toEqual(call(getPollbotVersion));

    // Clone to test success and failure of getPollbotVersion.
    data.sagaThrow = data.saga.clone();

    expect(data.saga.next(pollbotVersion).value).toEqual(
      put(updatePollbotVersion(pollbotVersion)),
    );
    expect(data.saga.next().done).toBe(true);

    expect(data.sagaThrow.throw('error').value).toEqual(
      console.error('Failed getting the pollbot version', 'error'),
    );
    expect(data.sagaThrow.next().done).toBe(true);
  });
});

describe('rootSaga', () => {
  it('uses takeEvery on each saga available', () => {
    const saga = rootSaga();
    expect(saga.next().value).toEqual([
      takeEvery(REQUEST_POLLBOT_VERSION, fetchPollbotVersion),
    ]);
    expect(saga.next().done).toBe(true);
  });
});
