import {call, put, select, takeEvery} from 'redux-saga/effects';
import {cloneableGenerator} from 'redux-saga/utils';
import {getOngoingVersions, getPollbotVersion} from './PollbotAPI';
import {updateLatestChannelVersions, updatePollbotVersion} from './actions';
import {
  REQUEST_ONGOING_VERSIONS,
  REQUEST_POLLBOT_VERSION,
  UPDATE_URL,
} from './types';
import {
  fetchOngoingVersions,
  fetchPollbotVersion,
  rootSaga,
  updateUrl,
} from './sagas';

describe('sagas', () => {
  it('handles fetchPollbotVersion', () => {
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

  it('handles fetchOngoingVersions', () => {
    const data = {};
    data.saga = cloneableGenerator(fetchOngoingVersions)();

    const ongoingVersions = {
      nightly: '57.0a1',
      beta: '56.0b12',
      release: '55.0.3',
      esr: '52.3.0esr',
    };
    expect(data.saga.next().value).toEqual(call(getOngoingVersions));

    // Clone to test success and failure of getOngoingVersions.
    data.sagaThrow = data.saga.clone();

    expect(data.saga.next(ongoingVersions).value).toEqual(
      put(updateLatestChannelVersions(ongoingVersions)),
    );
    expect(data.saga.next().done).toBe(true);

    expect(data.sagaThrow.throw('error').value).toEqual(
      console.error('Failed getting the latest channel versions', 'error'),
    );
    expect(data.sagaThrow.next().done).toBe(true);
  });

  it('handles updateUrl', () => {
    const saga = updateUrl();

    expect(saga.next().value).toEqual(select());
    expect(window.location.hash).not.toEqual('#pollbot/firefox/50.0');
    saga.next({version: '50.0'});
    expect(window.location.hash).toEqual('#pollbot/firefox/50.0');
  });
});

describe('rootSaga', () => {
  it('uses takeEvery on each saga available', () => {
    const saga = rootSaga();
    expect(saga.next().value).toEqual([
      takeEvery(REQUEST_ONGOING_VERSIONS, fetchOngoingVersions),
      takeEvery(REQUEST_POLLBOT_VERSION, fetchPollbotVersion),
      takeEvery(UPDATE_URL, updateUrl),
    ]);
    expect(saga.next().done).toBe(true);
  });
});
