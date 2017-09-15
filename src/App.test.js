import React from 'react';
import renderer from 'react-test-renderer';
import {Provider} from 'react-redux';
import {shallow} from 'enzyme';
import {App, ConnectedApp, parseUrl} from './App';
import createStore from './create-store';
import {SERVER} from './PollbotAPI';

// Mock the Notification API.
global.Notification = {
  requestPermission: jest.fn(),
};

// Mock the Pollbot version (version won't be visible in the rendered
// component, as it's only visible after the state has been updated, not on
// first render.
function fetchMocker(response) {
  return jest
    .fn()
    .mockImplementation(() => Promise.resolve({json: () => response}));
}

global.fetch = fetchMocker({
  version: 'pollbot-version-number',
  commit: 'pollbot-commit-hash',
  source: 'https://github.com/mozilla/PollBot.git',
  name: 'pollbot',
});

// Mock the delivery-dashboard version
jest.mock('./version', () => ({
  version: 'version-number',
  commit: 'commit-hash',
  source: 'https://github.com/mozilla/delivery-dashboard.git',
  name: 'delivery-dashboard',
}));

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.clearAllTimers();
});

describe('<App />', () => {
  it('renders without crashing', () => {
    const app = renderer.create(
      <Provider store={createStore()}>
        <ConnectedApp />
      </Provider>,
    );
    expect(app.toJSON()).toMatchSnapshot();
  });
  it('requests for Notification permissions', () => {
    renderer.create(
      <Provider store={createStore()}>
        <ConnectedApp />
      </Provider>,
    );
    expect(global.Notification.requestPermission).toHaveBeenCalled();
  });
  it('requests PollBot for its version', () => {
    renderer.create(
      <Provider store={createStore()}>
        <ConnectedApp />
      </Provider>,
    );
    expect(global.fetch).toHaveBeenCalledWith(`${SERVER}/__version__`);
  });
  it('calls requestStatus(version) with the version from the hash', () => {
    global.window.location.hash = '#pollbot/firefox/123.0';

    const module = require('./actions');
    module.requestStatus = jest.fn();

    const store = createStore();
    // We also need to mock the dispatch function, as it doesn't like to be
    // called with a mock.
    store.dispatch = jest.fn();

    renderer.create(
      <Provider store={store}>
        <ConnectedApp />
      </Provider>,
    );
    expect(module.requestStatus).toHaveBeenCalledWith('123.0');
  });
  it('sets up auto-refresh', () => {
    const module = require('./actions');
    module.requestStatus = jest.fn();

    // We also need to mock the dispatch function, as it doesn't like to be
    // called with a mock.
    const dispatch = jest.fn();

    const app = shallow(<App dispatch={dispatch} />).instance();
    app.stopAutoRefresh = jest.fn();

    // Shouldn't auto-refresh => stop auto refresh.
    app.shouldRefresh = jest.fn(() => false);
    expect(app.refreshIntervalId).toBeNull();
    app.setUpAutoRefresh();
    expect(app.stopAutoRefresh).toHaveBeenCalledTimes(1);
    expect(app.refreshIntervalId).toBeNull();
    jest.runOnlyPendingTimers();
    // Called once, on mounting the component.
    expect(module.requestStatus).toHaveBeenCalledTimes(1);
    // Should auto-refresh => start auto refresh.
    app.shouldRefresh = jest.fn(() => true);
    expect(app.refreshIntervalId).toBeNull();
    app.setUpAutoRefresh();
    expect(app.stopAutoRefresh).toHaveBeenCalledTimes(1); // Not called again.
    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(app.refreshIntervalId).toBeTruthy();
    jest.runOnlyPendingTimers();
    expect(module.requestStatus).toHaveBeenCalledTimes(2);
    // Should auto-refresh, but already set up => don't start auto refresh.
    app.setUpAutoRefresh();
    expect(app.stopAutoRefresh).toHaveBeenCalledTimes(1); // Not called again.
    expect(setInterval).toHaveBeenCalledTimes(1); // Not called again.
    expect(app.refreshIntervalId).toBeTruthy();
    expect(module.requestStatus).toHaveBeenCalledTimes(2); // Not called again.
  });
  it('stops auto-refresh', () => {
    const app = shallow(<App />).instance();

    // Shouldn't call clearInterval if not needed.
    expect(app.refreshIntervalId).toBeNull();
    app.stopAutoRefresh();
    expect(clearInterval).toHaveBeenCalledTimes(0);
    // Should call clearInterval if needed.
    app.refreshIntervalId = 123;
    app.stopAutoRefresh();
    expect(clearInterval).toHaveBeenCalledWith(123);
    expect(app.refreshIntervalId).toBeNull();
  });
});

describe('parseUrl', () => {
  it('returns null for a non matching url', () => {
    expect(parseUrl('')).toBeNull();
    expect(parseUrl('#foobar')).toBeNull();
  });
  it('returns the proper structure for a matching url', () => {
    expect(parseUrl('#pollbot/firefox/50.0')).toEqual({
      service: 'pollbot',
      product: 'firefox',
      version: '50.0',
    });
  });
});
