import {
  ADD_CHECK_RESULT,
  SET_VERSION,
  SUBMIT_VERSION,
  UPDATE_LATEST_CHANNEL_VERSIONS,
  UPDATE_POLLBOT_VERSION,
  UPDATE_VERSION_INPUT,
  UPDATE_RELEASE_INFO,
} from './types';
import {deliveryDashboard, initialState} from './reducers';

const stateWith = stateCrumbs => Object.assign({}, initialState, stateCrumbs);

describe('deliveryDashboard reducer', () => {
  it('returns the initial state', () => {
    expect(deliveryDashboard(undefined, {})).toEqual(initialState);
  });
  it('handles ADD_CHECK_RESULT', () => {
    expect(
      deliveryDashboard(undefined, {
        type: ADD_CHECK_RESULT,
        title: 'some test',
        result: 'some result',
      }),
    ).toEqual(
      stateWith({
        checkResults: {
          'some test': 'some result',
        },
      }),
    );

    expect(
      deliveryDashboard(
        stateWith({
          checkResults: {
            'some test': 'some result',
          },
        }),
        {
          type: ADD_CHECK_RESULT,
          title: 'some other test',
          result: 'some other result',
        },
      ),
    ).toEqual(
      stateWith({
        checkResults: {
          'some test': 'some result',
          'some other test': 'some other result',
        },
      }),
    );
  });
  it('handles SET_VERSION', () => {
    expect(
      deliveryDashboard(undefined, {
        type: SET_VERSION,
        version: '50.0',
      }),
    ).toEqual(stateWith({version: '50.0', versionInput: '50.0'}));
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
    ).toEqual(stateWith({version: '51.0', versionInput: '51.0'}));
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
});
