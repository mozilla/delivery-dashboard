import React from 'react';
import App from './App';
import renderer from 'react-test-renderer';
import {Provider} from 'react-redux';
import createStore from './create-store';

function fetchMocker(response) {
  return jest
    .fn()
    .mockImplementation(() => Promise.resolve({json: () => response}));
}

describe('App', () => {
  global.Notification = {
    requestPermission: jest.fn(),
  };
  global.fetch = fetchMocker({
    version: '0.2.1-13-g0d7bd3d',
    commit: '0d7bd3d68f334ef8cf126fefa858100aab6de46b',
    source: 'https://github.com/mozilla/PollBot.git',
    name: 'pollbot',
  });

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
