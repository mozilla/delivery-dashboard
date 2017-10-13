import {
  ADD_CHECK_RESULT,
  LOGGED_IN,
  LOGGED_OUT,
  LOGIN_REQUESTED,
  SET_VERSION,
  SUBMIT_VERSION,
  UPDATE_LATEST_CHANNEL_VERSIONS,
  UPDATE_POLLBOT_VERSION,
  UPDATE_VERSION_INPUT,
  UPDATE_RELEASE_INFO,
  UPDATE_USER_INFO,
} from './types';
import {deliveryDashboard, initialState} from './reducers';

const stateWith = stateCrumbs => Object.assign({}, initialState, stateCrumbs);

describe('deliveryDashboard reducer', () => {
  it('returns the initial state', () => {
    expect(deliveryDashboard(undefined, {})).toEqual(initialState);
  });
  it('handles ADD_CHECK_RESULT', () => {
    const checkResult = {
      status: 'exists',
      message: 'successful test',
      link: 'some url',
    };
    expect(
      deliveryDashboard(undefined, {
        type: ADD_CHECK_RESULT,
        title: 'some test',
        result: checkResult,
      }),
    ).toEqual(
      stateWith({
        checkResults: {
          'some test': checkResult,
        },
        shouldRefresh: false,
      }),
    );

    const otherCheckResult = {
      status: 'exists',
      message: 'successful test',
      link: 'some url',
    };
    expect(
      deliveryDashboard(
        stateWith({
          checkResults: {
            'some test': checkResult,
          },
        }),
        {
          type: ADD_CHECK_RESULT,
          title: 'some other test',
          result: otherCheckResult,
        },
      ),
    ).toEqual(
      stateWith({
        checkResults: {
          'some test': checkResult,
          'some other test': otherCheckResult,
        },
        shouldRefresh: false,
      }),
    );

    const failingCheckResult = {
      status: 'incomplete',
      message: 'successful test',
      link: 'some url',
    };
    expect(
      deliveryDashboard(
        stateWith({
          checkResults: {
            'some test': checkResult,
          },
        }),
        {
          type: ADD_CHECK_RESULT,
          title: 'some other test',
          result: failingCheckResult,
        },
      ),
    ).toEqual(
      stateWith({
        checkResults: {
          'some test': checkResult,
          'some other test': failingCheckResult,
        },
        shouldRefresh: true,
      }),
    );
  });
  it('handles SET_VERSION', () => {
    expect(
      deliveryDashboard(undefined, {
        type: SET_VERSION,
        version: '50.0',
      }),
    ).toEqual(
      stateWith({version: '50.0', versionInput: '50.0', shouldRefresh: false}),
    );
    expect(
      deliveryDashboard(
        stateWith({
          version: '50.0',
          versionInput: '50.0',
        }),
        {
          type: SET_VERSION,
          version: '51.0',
        },
      ),
    ).toEqual(
      stateWith({version: '51.0', versionInput: '51.0', shouldRefresh: false}),
    );
  });
  it('handles UPDATE_VERSION_INPUT', () => {
    expect(
      deliveryDashboard(undefined, {
        type: UPDATE_VERSION_INPUT,
        version: '50.0',
      }),
    ).toEqual(stateWith({versionInput: '50.0'}));
    expect(
      deliveryDashboard(
        stateWith({
          versionInput: '50.0',
        }),
        {
          type: UPDATE_VERSION_INPUT,
          version: '51.0',
        },
      ),
    ).toEqual(stateWith({versionInput: '51.0'}));
  });
  it('handles SUBMIT_VERSION', () => {
    expect(
      deliveryDashboard(undefined, {
        type: SUBMIT_VERSION,
      }),
    ).toEqual(stateWith({version: ''})); // No versionInput.
    expect(
      deliveryDashboard(
        stateWith({
          versionInput: '50.0',
        }),
        {
          type: SUBMIT_VERSION,
        },
      ),
    ).toEqual(stateWith({version: '50.0', versionInput: '50.0'}));
  });
  it('handles UPDATE_LATEST_CHANNEL_VERSIONS', () => {
    expect(
      deliveryDashboard(undefined, {
        type: UPDATE_LATEST_CHANNEL_VERSIONS,
        versions: 'some new versions',
      }),
    ).toEqual(stateWith({latestChannelVersions: 'some new versions'}));
    expect(
      deliveryDashboard(
        stateWith({
          latestChannelVersions: 'some versions',
        }),
        {
          type: UPDATE_LATEST_CHANNEL_VERSIONS,
          versions: 'some new versions',
        },
      ),
    ).toEqual(stateWith({latestChannelVersions: 'some new versions'}));
  });
  it('handles UPDATE_RELEASE_INFO', () => {
    expect(
      deliveryDashboard(undefined, {
        type: UPDATE_RELEASE_INFO,
        releaseInfo: 'some new release info',
      }),
    ).toEqual(stateWith({releaseInfo: 'some new release info'}));
    expect(
      deliveryDashboard(
        stateWith({
          releaseInfo: 'some release info',
        }),
        {
          type: UPDATE_RELEASE_INFO,
          releaseInfo: 'some new release info',
        },
      ),
    ).toEqual(stateWith({releaseInfo: 'some new release info'}));
  });
  it('handles UPDATE_POLLBOT_VERSION', () => {
    expect(
      deliveryDashboard(undefined, {
        type: UPDATE_POLLBOT_VERSION,
        version: 'some new pollbot version',
      }),
    ).toEqual(stateWith({pollbotVersion: 'some new pollbot version'}));
    expect(
      deliveryDashboard(
        stateWith({
          pollbotVersion: 'some pollbot version',
        }),
        {
          type: UPDATE_POLLBOT_VERSION,
          version: 'some new pollbot version',
        },
      ),
    ).toEqual(stateWith({pollbotVersion: 'some new pollbot version'}));
  });
  it('handles LOGGED_IN', () => {
    expect(
      deliveryDashboard(undefined, {
        type: LOGGED_IN,
      }),
    ).toEqual(stateWith({login: LOGGED_IN}));
    expect(
      deliveryDashboard(
        stateWith({
          login: LOGGED_OUT,
        }),
        {
          type: LOGGED_IN,
        },
      ),
    ).toEqual(stateWith({login: LOGGED_IN}));
  });
  it('handles LOGGED_OUT', () => {
    expect(
      deliveryDashboard(undefined, {
        type: LOGGED_OUT,
      }),
    ).toEqual(stateWith({login: LOGGED_OUT}));
    expect(
      deliveryDashboard(
        stateWith({
          login: LOGGED_IN,
        }),
        {
          type: LOGGED_OUT,
        },
      ),
    ).toEqual(stateWith({login: LOGGED_OUT}));
  });
  it('handles LOGIN_REQUESTED', () => {
    expect(
      deliveryDashboard(undefined, {
        type: LOGIN_REQUESTED,
      }),
    ).toEqual(stateWith({login: LOGIN_REQUESTED}));
    expect(
      deliveryDashboard(
        stateWith({
          login: LOGGED_OUT,
        }),
        {
          type: LOGIN_REQUESTED,
        },
      ),
    ).toEqual(stateWith({login: LOGIN_REQUESTED}));
  });
  it('handles UPDATE_USER_INFO', () => {
    expect(
      deliveryDashboard(undefined, {
        type: UPDATE_USER_INFO,
        userInfo: 'foo',
      }),
    ).toEqual(stateWith({userInfo: 'foo'}));
    expect(
      deliveryDashboard(
        stateWith({
          userInfo: 'foo',
        }),
        {
          type: UPDATE_USER_INFO,
          userInfo: 'bar',
        },
      ),
    ).toEqual(stateWith({userInfo: 'bar'}));
  });
});
