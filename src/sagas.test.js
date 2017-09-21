import {call, put, takeEvery} from 'redux-saga/effects';
import {getPollbotVersion} from './PollbotAPI';
import {updatePollbotVersion} from './actions';
import {REQUEST_POLLBOT_VERSION} from './types';
import {fetchPollbotVersion, rootSaga} from './sagas';

describe('sagas', () => {
  it('handles requestPollbotVersion', () => {
    const pollbotVersion = {
      name: 'pollbot',
      source: 'https://github.com/mozilla/PollBot.git',
      version: '0.2.1-22-g8e09a0f',
      commit: '8e09a0f8e995344ea24fbb940a6bddc17e0edaed',
    };
    const saga = fetchPollbotVersion();
    expect(saga.next().value).toEqual(call(getPollbotVersion));
    expect(saga.next(pollbotVersion).value).toEqual(
      put(updatePollbotVersion(pollbotVersion)),
    );
  });
});

describe('rootSaga', () => {
  it('uses takeEvery on each saga available', () => {
    const saga = rootSaga();
    expect(saga.next().value).toEqual([
      takeEvery(REQUEST_POLLBOT_VERSION, fetchPollbotVersion),
    ]);
  });
});
