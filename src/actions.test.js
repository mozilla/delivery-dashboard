import {
  ADD_CHECK_RESULT,
  REFRESH_CHECK_RESULT,
  ADD_SERVER_ERROR,
  SET_VERSION,
  UPDATE_PRODUCT_VERSIONS,
  UPDATE_POLLBOT_VERSION,
  UPDATE_RELEASE_INFO,
  REQUEST_ONGOING_VERSIONS,
  REQUEST_POLLBOT_VERSION,
  UPDATE_URL,
  REFRESH_STATUS,
  REQUEST_STATUS,
} from './types';
import {
  addCheckResult,
  addServerError,
  capitalizeChannel,
  requestOngoingVersions,
  requestPollbotVersion,
  refreshCheckResult,
  refreshStatus,
  requestStatus,
  setVersion,
  sortByVersion,
  updateProductVersions,
  updatePollbotVersion,
  updateReleaseInfo,
  updateUrl,
} from './actions';

describe('action creators', () => {
  it('returns a UPDATE_VERSION_INPUT action for setVersion', () => {
    expect(setVersion('firefox', '123')).toEqual({
      type: SET_VERSION,
      product: 'firefox',
      version: '123',
    });
  });
  it('returns a UPDATE_PRODUCT_VERSIONS action for updateProductVersions', () => {
    const channelVersions = {
      nightly: '57.0a1',
      beta: '56.0b12',
      release: '55.0.3',
      esr: '52.3.0esr',
    };
    expect(updateProductVersions('firefox', channelVersions)).toEqual({
      type: UPDATE_PRODUCT_VERSIONS,
      product: 'firefox',
      versions: channelVersions,
    });
  });
  it('returns a UPDATE_POLLBOT_VERSION action for updatePollbotVersion', () => {
    const pollbotVersion = {
      name: 'pollbot',
      source: 'https://github.com/mozilla/PollBot.git',
      version: '0.2.1-22-g8e09a0f',
      commit: '8e09a0f8e995344ea24fbb940a6bddc17e0edaed',
    };
    expect(updatePollbotVersion(pollbotVersion)).toEqual({
      type: UPDATE_POLLBOT_VERSION,
      version: pollbotVersion,
    });
  });
  it('returns a UPDATE_RELEASE_INFO action for updateReleaseInfo', () => {
    const releaseInfo = {
      product: 'firefox',
      checks: [
        {
          title: 'Archive Release',
          url: 'https://pollbot.dev.mozaws.net/v1/firefox/55.0.3/archive',
        },
        {
          title: 'Balrog update rules',
          url: 'https://pollbot.dev.mozaws.net/v1/firefox/55.0.3/balrog-rules',
        },
        {
          title: 'Download links',
          url:
            'https://pollbot.dev.mozaws.net/v1/firefox/55.0.3/bedrock/download-links',
        },
        {
          title: 'Product details',
          url:
            'https://pollbot.dev.mozaws.net/v1/firefox/55.0.3/product-details',
        },
        {
          title: 'Release notes',
          url:
            'https://pollbot.dev.mozaws.net/v1/firefox/55.0.3/bedrock/release-notes',
        },
        {
          title: 'Security advisories',
          url:
            'https://pollbot.dev.mozaws.net/v1/firefox/55.0.3/bedrock/security-advisories',
        },
      ],
      version: '55.0.3',
      channel: 'release',
    };
    expect(updateReleaseInfo(releaseInfo)).toEqual({
      type: UPDATE_RELEASE_INFO,
      releaseInfo: releaseInfo,
    });
  });
  it('returns a ADD_CHECK_RESULT action for addCheckResult', () => {
    const checkResult = {
      link: 'https://archive.mozilla.org/pub/firefox/releases/55.0.3/',
      status: 'exists',
      message:
        'The archive exists at https://archive.mozilla.org/pub/firefox/releases/55.0.3/ and all 95 locales are present for all platforms (linux-i686, linux-x86_64, mac, win32, win64)',
    };
    expect(addCheckResult('some check', checkResult)).toEqual({
      type: ADD_CHECK_RESULT,
      title: 'some check',
      result: checkResult,
    });
  });
  it('returns a REFRESH_CHECK_RESULT action for refreshCheckResult', () => {
    expect(refreshCheckResult('some check')).toEqual({
      type: REFRESH_CHECK_RESULT,
      title: 'some check',
    });
  });
  it('returns a ADD_SERVER_ERROR action for addServerError', () => {
    expect(addServerError('some check', 'some error')).toEqual({
      type: ADD_SERVER_ERROR,
      title: 'some check',
      err: 'some error',
    });
  });
});

describe('sagas action creator', () => {
  it('handles a REQUEST_ONGOING_VERSIONS action for requestOngoingVersions', () => {
    expect(requestOngoingVersions()).toEqual({
      type: REQUEST_ONGOING_VERSIONS,
    });
  });
  it('handles a REQUEST_POLLBOT_VERSION action for requestPollbotVersion', () => {
    expect(requestPollbotVersion()).toEqual({type: REQUEST_POLLBOT_VERSION});
  });
  it('handles a UPDATE_URL action for updateUrl', () => {
    expect(updateUrl()).toEqual({type: UPDATE_URL});
  });
  it('handles a REFRESH_STATUS action for refreshStatus', () => {
    expect(refreshStatus()).toEqual({type: REFRESH_STATUS});
  });
  it('handles a REQUEST_STATUS action for requestStatus', () => {
    expect(requestStatus('firefox', '50.0')).toEqual({
      type: REQUEST_STATUS,
      product: 'firefox',
      version: '50.0',
    });
  });
});

describe('sortByVersion helper', () => {
  it('sorts bogus versions', () => {
    expect(sortByVersion('0', '56.0')).toEqual(1);
  });
  it('sorts equal versions', () => {
    expect(sortByVersion('56.0', '56.0')).toEqual(0);
  });
  it('sorts similar versions', () => {
    expect(sortByVersion('56.0', '56.0.1')).toEqual(1);
  });
  it('sorts release versions', () => {
    expect(sortByVersion('56.0', '57.0')).toEqual(1);
    expect(sortByVersion('56.0.1', '56.0.2')).toEqual(1);
  });
  it('sorts release and beta versions', () => {
    expect(sortByVersion('56.0b1', '56.0')).toEqual(1);
    expect(sortByVersion('56.0', '56.0b1')).toEqual(-1);
  });
  it('sorts alpha and beta versions', () => {
    expect(sortByVersion('56.0a1', '56.0b1')).toEqual(1);
  });
  it('sorts beta versions', () => {
    expect(sortByVersion('56.0b1', '56.0b2')).toEqual(1);
  });
  it('sorts bogus sub versions', () => {
    expect(sortByVersion('56.0', '56.a')).toEqual(1);
  });
  it('sorts random versions', () => {
    expect(sortByVersion('55.0.3', '57.0b3')).toBeGreaterThan(0);
  });
});

describe('capitalizeChannel helper', () => {
  it('uppercases the first letter of the channel', () => {
    expect(capitalizeChannel(['foo', 'bar'])).toEqual(['Foo', 'bar']);
  });
});
