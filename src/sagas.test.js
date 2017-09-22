import {all, call, put, select, takeEvery} from 'redux-saga/effects';
import {cloneableGenerator} from 'redux-saga/utils';
import {checkStatus, getOngoingVersions, getPollbotVersion} from './PollbotAPI';
import {
  addCheckResult,
  setVersion,
  updateLatestChannelVersions,
  updatePollbotVersion,
} from './actions';
import {
  REFRESH_STATUS,
  REQUEST_ONGOING_VERSIONS,
  REQUEST_POLLBOT_VERSION,
  UPDATE_URL,
} from './types';
import {
  fetchOngoingVersions,
  fetchPollbotVersion,
  refreshStatus,
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

  it('handles refreshStatus', () => {
    const data = {};
    data.saga = cloneableGenerator(refreshStatus)();

    // Mock the Notification API call.
    global.Notification = jest.fn();
    global.Notification.permission = 'granted';

    const releaseInfo = {
      channel: 'release',
      product: 'firefox',
      version: '50.0',
      checks: [
        {
          title: 'some test',
          url: 'some url',
        },
        {
          title: 'some other test',
          url: 'some other url',
        },
      ],
    };
    const checkResult = {
      status: 'exists',
      message: 'check succesful',
      link: 'some link',
    };
    const checkResultFailing = {
      status: 'incomplete',
      message: 'check incomplete',
      link: 'some link',
    };

    expect(data.saga.next().value).toEqual(select());

    // Clone to test the branch where there's no releaseInfo in the state.
    data.sagaNoReleaseInfo = data.saga.clone();

    // No releaseInfo in the state.
    expect(data.sagaNoReleaseInfo.next({version: '50.0'}).value).toEqual(
      put(setVersion('50.0')),
    );
    expect(data.sagaNoReleaseInfo.next().done).toBe(true);

    // releaseInfo in the state.
    expect(
      data.saga.next({
        version: '50.0',
        releaseInfo: releaseInfo,
        checkResults: {
          'some test': checkResult,
          'some other test': checkResultFailing,
        },
      }).value,
    ).toEqual(put(setVersion('50.0')));

    expect(data.saga.next().value).toEqual(
      all({
        'some test': call(checkStatus, 'some url'),
        'some other test': call(checkStatus, 'some other url'),
      }),
    );

    // Clone to test success and failure of checkStatus.
    data.sagaThrow = data.saga.clone();

    // checkStatus throws an error.
    expect(data.sagaThrow.throw('error').value).toEqual(
      console.error('Failed getting check results for 50.0', 'error'),
    );
    expect(data.sagaThrow.next().done).toBe(true);

    // checkStatus completes correctly.
    expect(
      data.saga.next({
        'some test': checkResult,
        'some other test': checkResult,
      }).value,
    ).toEqual(
      all([
        put(addCheckResult('some test', checkResult)),
        put(addCheckResult('some other test', checkResult)),
      ]),
    );
    expect(data.saga.next().done).toBe(true);
    // The notification has been sent for the previously failing test.
    expect(global.Notification).toHaveBeenCalledTimes(1);
    expect(global.Notification).toHaveBeenCalledWith(
      'some other test: status changed (exists).',
    );
  });
});

describe('rootSaga', () => {
  it('uses takeEvery on each saga available', () => {
    const saga = rootSaga();
    expect(saga.next().value).toEqual([
      takeEvery(REQUEST_ONGOING_VERSIONS, fetchOngoingVersions),
      takeEvery(REQUEST_POLLBOT_VERSION, fetchPollbotVersion),
      takeEvery(UPDATE_URL, updateUrl),
      takeEvery(REFRESH_STATUS, refreshStatus),
    ]);
    expect(saga.next().done).toBe(true);
  });
});
