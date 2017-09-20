import React from 'react';
import renderer from 'react-test-renderer';
import {Provider} from 'react-redux';
import {mount, shallow} from 'enzyme';
import {
  App,
  ConnectedApp,
  Dashboard,
  DisplayStatus,
  parseUrl,
  SearchForm,
  Spinner,
  versionInputDispatchProps,
} from './App';
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
    module.refreshStatus = jest.fn();

    // We also need to mock the dispatch function, as it doesn't like to be
    // called with a mock.
    const dispatch = jest.fn();

    const wrapper = shallow(<App dispatch={dispatch} />);
    const app = wrapper.instance();
    app.stopAutoRefresh = jest.fn();

    // Shouldn't auto-refresh => stop auto refresh.
    wrapper.setProps({shouldRefresh: false});
    expect(app.refreshIntervalId).toBeNull();
    app.setUpAutoRefresh();
    expect(app.stopAutoRefresh).toHaveBeenCalledTimes(1);
    expect(app.refreshIntervalId).toBeNull();
    jest.runOnlyPendingTimers();
    // Called once, on mounting the component.
    expect(module.requestStatus).toHaveBeenCalledTimes(1);
    expect(module.refreshStatus).toHaveBeenCalledTimes(0);

    // Should auto-refresh => start auto refresh.
    wrapper.setProps({shouldRefresh: true});
    expect(app.refreshIntervalId).toBeNull();
    app.setUpAutoRefresh();
    expect(app.stopAutoRefresh).toHaveBeenCalledTimes(1); // Not called again.
    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(app.refreshIntervalId).toBeTruthy();
    jest.runOnlyPendingTimers();
    expect(module.requestStatus).toHaveBeenCalledTimes(1);
    expect(module.refreshStatus).toHaveBeenCalledTimes(1);

    // Should auto-refresh, but already set up => don't start auto refresh.
    wrapper.setProps({shouldRefresh: true});
    app.setUpAutoRefresh();
    expect(app.stopAutoRefresh).toHaveBeenCalledTimes(1); // Not called again.
    expect(setInterval).toHaveBeenCalledTimes(1); // Not called again.
    expect(app.refreshIntervalId).toBeTruthy();
    expect(module.requestStatus).toHaveBeenCalledTimes(1);
    expect(module.refreshStatus).toHaveBeenCalledTimes(1); // Not called again.
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
  it('stops the auto-refresh on unmount', () => {
    const wrapper = shallow(<App />);
    const app = wrapper.instance();
    app.stopAutoRefresh = jest.fn();
    wrapper.unmount();
    expect(app.stopAutoRefresh).toHaveBeenCalledTimes(1);
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

describe('<SearchForm />', () => {
  it('handles input text change', () => {
    const module = require('./actions');
    module.updateVersionInput = jest.fn();

    const {handleSearchBoxChange} = versionInputDispatchProps(jest.fn());
    const wrapper = mount(
      <SearchForm handleSearchBoxChange={handleSearchBoxChange} />,
    );
    const input = wrapper.find('input');
    input.node.value = 'foobar'; // Workaround for https://github.com/airbnb/enzyme/issues/218
    input.simulate('change', input);
    expect(module.updateVersionInput).toHaveBeenCalledWith('foobar');
  });
  it('handles dismissing a version', () => {
    const module = require('./actions');
    module.setVersion = jest.fn();

    const {handleDismissSearchBoxVersion} = versionInputDispatchProps(
      jest.fn(),
    );
    const wrapper = mount(
      <SearchForm
        handleDismissSearchBoxVersion={handleDismissSearchBoxVersion}
      />,
    );
    wrapper.find('.text-clear-btn').simulate('click');
    expect(global.window.location.hash).toBe('');
    expect(module.setVersion).toHaveBeenCalledWith('');
  });
  it('handles the form submission', () => {
    const module = require('./actions');
    module.submitVersion = jest.fn();
    module.updateUrl = jest.fn();

    const {onSubmit} = versionInputDispatchProps(jest.fn());
    const wrapper = mount(<SearchForm onSubmit={onSubmit} />);
    wrapper.simulate('submit');
    expect(module.submitVersion).toHaveBeenCalled();
    expect(module.updateUrl).toHaveBeenCalled();
  });
});

describe('<Dashboard />', () => {
  it('displays a help text when no version is selected', () => {
    const wrapper = shallow(<Dashboard version="" />);
    expect(wrapper.text()).toContain('enter your version number');
  });
  it('displays a spinner when a version is selected', () => {
    const wrapper = shallow(<Dashboard version="50.0" />);
    expect(wrapper.find(Spinner).length).toBe(1);
  });
  it('displays a list of check results when a release info is present', () => {
    const releaseInfo = {
      channel: 'nightly',
      product: 'firefox',
      version: '50.0',
      checks: [
        {url: 'some-url', title: 'some title'},
        {url: 'some-url-2', title: 'some title 2'},
      ],
    };
    const checkResults = {
      'some title': {
        status: 'exists',
        message: 'check is successful',
        link: 'some link',
      },
      'some title 2': {
        status: 'exists',
        message: 'check is successful',
        link: 'some link',
      },
    };
    const wrapper = shallow(
      <Dashboard
        version="50.0"
        releaseInfo={releaseInfo}
        checkResults={checkResults}
      />,
    );
    expect(wrapper.find(Spinner).length).toBe(0);
    expect(wrapper.find(DisplayStatus).length).toBe(2);
  });
});

describe('<DisplayStatus />', () => {
  const checkDisplayStatus = (status, label, message) => {
    const wrapper = shallow(
      <DisplayStatus status={status} message="check message" url="check url" />,
    );
    const link = wrapper.find('a');
    expect(link.prop('className')).toContain(`label-${label}`);
    expect(link.prop('title')).toEqual('check message');
    expect(link.prop('href')).toEqual('check url');
    expect(link.text()).toEqual(message || status);
  };
  it('displays the status when the status is exists', () => {
    checkDisplayStatus('exists', 'success');
  });
  it('displays the status when the status is incomplete', () => {
    checkDisplayStatus('incomplete', 'info');
  });
  it('displays the status when the status is missing', () => {
    checkDisplayStatus('missing', 'danger');
  });
  it('displays the error message when there an error', () => {
    checkDisplayStatus('error', 'warning', 'Error: check message');
  });
});
