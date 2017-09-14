import React from 'react';
import {App, parseUrl} from './App';
import renderer from 'react-test-renderer';
import {Provider} from 'react-redux';
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

describe('App', () => {
  it('renders without crashing', () => {
    const app = renderer.create(
      <Provider store={createStore()}>
        <App />
      </Provider>,
    );
    expect(app.toJSON()).toMatchSnapshot();
  });
  it('requests for Notification permissions', () => {
    renderer.create(
      <Provider store={createStore()}>
        <App />
      </Provider>,
    );
    expect(global.Notification.requestPermission).toHaveBeenCalled();
  });
  it('requests PollBot for its version', () => {
    renderer.create(
      <Provider store={createStore()}>
        <App />
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
        <App />
      </Provider>,
    );
    expect(module.requestStatus).toBeCalledWith('123.0');
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
