import React from 'react';
import {App, parseUrl} from './App';
import renderer from 'react-test-renderer';
import {Provider} from 'react-redux';
import createStore from './create-store';

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
    expect(
      global.Notification.requestPermission.mock.calls.length,
    ).toBeGreaterThanOrEqual(1);
  });
  it('requests PollBot for its version', () => {
    renderer.create(
      <Provider store={createStore()}>
        <App />
      </Provider>,
    );
    expect(global.fetch.mock.calls.length).toBeGreaterThanOrEqual(1);
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
