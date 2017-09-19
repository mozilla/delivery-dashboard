import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  ADD_CHECK_RESULT,
  SET_VERSION,
  UPDATE_VERSION_INPUT,
  SUBMIT_VERSION,
  UPDATE_LATEST_CHANNEL_VERSIONS,
  UPDATE_POLLBOT_VERSION,
  UPDATE_RELEASE_INFO,
} from './types';
import {
  addCheckResult,
  requestOngoingVersions,
  requestStatus,
  setVersion,
  submitVersion,
  updateLatestChannelVersions,
  updatePollbotVersion,
  updateReleaseInfo,
  updateVersionInput,
} from './actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('action creators', () => {
  it('returns a UPDATE_VERSION_INPUT action for setVersion', () => {
    expect(setVersion('123')).toEqual({type: SET_VERSION, version: '123'});
  });
  it('returns a UPDATE_VERSION_INPUT action for updateVersionInput', () => {
    expect(updateVersionInput('123')).toEqual({
      type: UPDATE_VERSION_INPUT,
      version: '123',
    });
  });
  it('returns a SUBMIT_VERSION action for submitVersion', () => {
    expect(submitVersion()).toEqual({type: SUBMIT_VERSION});
  });
  it('returns a UPDATE_LATEST_CHANNEL_VERSIONS action for updateLatestChannelVersions', () => {
    const ongoingVersions = {
      nightly: '57.0a1',
      beta: '56.0b12',
      release: '55.0.3',
      esr: '52.3.0esr',
    };
    expect(updateLatestChannelVersions(ongoingVersions)).toEqual({
      type: UPDATE_LATEST_CHANNEL_VERSIONS,
      versions: ongoingVersions,
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
});

describe('thunk action creator requestStatus', () => {
  it('does nothing if no version requested and no version in state', async () => {
    // No version requested, no version in the state => do nothing.
    const store = mockStore({});
    await store.dispatch(requestStatus());
    expect(store.getActions()).toEqual([]);
  });
  it('requests the version from the state if none is provided', async () => {
    const mockReleaseInfo = {
      channel: 'release',
      product: 'firefox',
      version: '50.0',
      checks: [
        {
          title: 'some test',
          url: 'some url',
        },
      ],
    };
    const mockCheckResult = {
      status: 'exists',
      message: 'check succesful',
      link: 'some link',
    };
    // Mock the pollbot api calls.
    const module = require('./PollbotAPI');
    module.getReleaseInfo = jest.fn(() => mockReleaseInfo);
    module.checkStatus = jest.fn(() => mockCheckResult);

    // No version requested, version 50.0 in the state.
    let expectedActions = [
      {type: 'SET_VERSION', version: '50.0'},
      {
        releaseInfo: mockReleaseInfo,
        type: 'UPDATE_RELEASE_INFO',
      },
      {
        result: mockCheckResult,
        title: 'some test',
        type: 'ADD_CHECK_RESULT',
      },
    ];

    const store = mockStore({
      version: '50.0',
      checkResults: {},
    });
    await store.dispatch(requestStatus());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('requests the version given instead of the one in the state', async () => {
    const mockReleaseInfo = {
      channel: 'release',
      product: 'firefox',
      version: '51.0',
      checks: [
        {
          title: 'some test',
          url: 'some url',
        },
      ],
    };
    const mockCheckResult = {
      status: 'exists',
      message: 'check succesful',
      link: 'some link',
    };
    // Mock the pollbot API calls.
    const module = require('./PollbotAPI');
    module.getReleaseInfo = jest.fn(() => mockReleaseInfo);
    module.checkStatus = jest.fn(() => mockCheckResult);

    // Version 51.0 requested, version 50.0 in the state.
    let expectedActions = [
      {type: 'SET_VERSION', version: '51.0'},
      {
        releaseInfo: mockReleaseInfo,
        type: 'UPDATE_RELEASE_INFO',
      },
      {
        result: mockCheckResult,
        title: 'some test',
        type: 'ADD_CHECK_RESULT',
      },
    ];

    const store = mockStore({
      version: '50.0',
      checkResults: {},
    });
    await store.dispatch(requestStatus('51.0'));
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('notifies if there were different previous results', async () => {
    const mockReleaseInfo = {
      channel: 'release',
      product: 'firefox',
      version: '51.0',
      checks: [
        {
          title: 'some test',
          url: 'some url',
        },
      ],
    };
    const mockCheckIncompleteResult = {
      status: 'incomplete',
      message: 'check incomplete',
      link: 'some link',
    };
    const mockCheckExistsResult = {
      status: 'exists',
      message: 'check succesful',
      link: 'some link',
    };
    // Mock the pollbot API calls.
    const module = require('./PollbotAPI');
    module.getReleaseInfo = jest.fn(() => mockReleaseInfo);
    module.checkStatus = jest.fn(() => mockCheckExistsResult);
    // Mock the Notification API call.
    global.Notification = jest.fn();
    global.Notification.permission = 'granted';

    // Version 51.0 requested, previous test was incomplete.
    let expectedActions = [
      {type: 'SET_VERSION', version: '51.0'},
      {
        releaseInfo: mockReleaseInfo,
        type: 'UPDATE_RELEASE_INFO',
      },
      {
        result: mockCheckExistsResult,
        title: 'some test',
        type: 'ADD_CHECK_RESULT',
      },
    ];

    const store = mockStore({
      version: '51.0',
      checkResults: {
        'some test': mockCheckIncompleteResult,
      },
    });
    await store.dispatch(requestStatus());
    expect(store.getActions()).toEqual(expectedActions);
    expect(global.Notification).toHaveBeenCalledWith(
      'some test: status changed (exists).',
    );
  });
  it('logs an error to the console if a check went wrong', async () => {
    const mockReleaseInfo = {
      channel: 'release',
      product: 'firefox',
      version: '51.0',
      checks: [
        {
          title: 'some test',
          url: 'some url',
        },
      ],
    };
    // Mock the pollbot API calls.
    const module = require('./PollbotAPI');
    module.getReleaseInfo = jest.fn(() => mockReleaseInfo);
    module.checkStatus = jest.fn(() => {
      throw 'some error';
    });
    // Mock the console.error call.
    console.error = jest.fn();
    const store = mockStore({version: '51.0', checkResults: {}});
    await store.dispatch(requestStatus());
    expect(console.error).toHaveBeenCalledWith(
      'Failed getting the release info for 51.0',
      'some error',
    );
  });
});

describe('thunk action creator requestOngoingVersions', () => {
  it('updates the ongoing versions', async () => {
    const ongoingVersions = {
      nightly: '57.0a1',
      beta: '56.0b12',
      release: '55.0.3',
      esr: '52.3.0esr',
    };
    // Mock the pollbot API calls.
    const module = require('./PollbotAPI');
    module.getOngoingVersions = jest.fn(() => ongoingVersions);

    const expectedActions = [
      {type: 'UPDATE_LATEST_CHANNEL_VERSIONS', versions: ongoingVersions},
    ];
    const store = mockStore({});
    await store.dispatch(requestOngoingVersions());
    expect(store.getActions()).toEqual(expectedActions);
  });
  it('logs an error to the console if something went wrong', async () => {
    // Mock the pollbot API calls.
    const module = require('./PollbotAPI');
    module.getOngoingVersions = jest.fn(() => {
      throw 'some error';
    });
    // Mock the console.error call.
    console.error = jest.fn();
    const store = mockStore({});
    await store.dispatch(requestOngoingVersions());
    expect(console.error).toHaveBeenCalledWith(
      'Failed getting the latest channel versions',
      'some error',
    );
  });
});
