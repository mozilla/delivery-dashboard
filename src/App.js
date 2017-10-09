// @flow
import * as React from 'react';
import {Alert, Button, Card, Form, Icon, Input, Layout, Spin} from 'antd';
import './App.css';
import {connect} from 'react-redux';
import type {MapStateToProps} from 'react-redux';
import {
  localUrlFromVersion,
  requestOngoingVersions,
  requestPollbotVersion,
  refreshStatus,
  requestStatus,
  setVersion,
  submitVersion,
  updateUrl,
  updateVersionInput,
} from './actions';
import type {
  APIVersionData,
  CheckResult,
  CheckResults,
  Dispatch,
  OngoingVersions,
  ReleaseInfo,
  State,
  Status,
} from './types';

const deliveryDashboardVersionData: APIVersionData = require('./version.json');

function requestNotificationPermission(): void {
  if (
    Notification.permission !== 'denied' &&
    Notification.permission !== 'granted'
  ) {
    Notification.requestPermission();
  }
}

export const parseUrl = (
  url: string,
): ?{service: string, product: string, version: string} => {
  const re = /^#(\w+)\/(\w+)\/([^/]+)\/?/; // Eg: #pollbot/firefox/50.0
  const parsed: ?(string[]) = url.match(re);
  if (!parsed) {
    return null;
  }
  const [_, service, product, version] = parsed;
  return {
    service: service,
    product: product,
    version: version,
  };
};

type AppProps = {
  checkResults: CheckResults,
  dispatch: Dispatch,
  pollbotVersion: APIVersionData,
  shouldRefresh: boolean,
};
export class App extends React.Component<AppProps, void> {
  refreshIntervalId: ?number;

  constructor(props: AppProps): void {
    super(props);
    this.refreshIntervalId = null;
  }

  setUpAutoRefresh(): void {
    if (this.props.shouldRefresh) {
      if (this.refreshIntervalId) {
        // The auto-refresh is already enabled.
        return;
      }
      this.refreshIntervalId = setInterval(
        () => this.props.dispatch(refreshStatus()),
        60000,
      );
    } else {
      this.stopAutoRefresh();
    }
  }

  stopAutoRefresh(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  componentDidMount(): void {
    this.props.dispatch(requestPollbotVersion());
    this.props.dispatch(requestOngoingVersions());
    // Setup notifications.
    requestNotificationPermission();
    // Listen to url hash changes.
    window.onhashchange = this.versionFromHash;
    // Check if we have a version in the url.
    this.versionFromHash();
  }

  componentDidUpdate(): void {
    this.setUpAutoRefresh();
  }

  componentWillUnmount(): void {
    this.stopAutoRefresh();
  }

  versionFromHash = (): void => {
    const parsedUrl = parseUrl(window.location.hash);
    if (parsedUrl) {
      const version = parsedUrl.version;
      this.props.dispatch(requestStatus(version));
    }
  };

  render() {
    return (
      <div>
        <header>
          <h1>
            <a href=".">Delivery Dashboard</a>
          </h1>
          <div className="user">
            <Button icon="login">Login</Button>
          </div>
        </header>
        <Layout className="mainContent">
          <Layout.Sider breakpoint="md" collapsedWidth={0}>
            <SideBar />
          </Layout.Sider>
          <Layout.Content>
            <VersionInput />
            <CurrentRelease />
          </Layout.Content>
        </Layout>
        <footer>
          Delivery dashboard version:{' '}
          <VersionLink versionData={deliveryDashboardVersionData} />
          &nbsp;--&nbsp;Pollbot version:{' '}
          <VersionLink versionData={this.props.pollbotVersion} />
        </footer>
      </div>
    );
  }
}
const connectedAppMapStateToProps: MapStateToProps<*, *, *> = (
  state: State,
) => ({
  checkResults: state.checkResults,
  pollbotVersion: state.pollbotVersion,
  shouldRefresh: state.shouldRefresh,
});
export const ConnectedApp = connect(
  connectedAppMapStateToProps,
  (dispatch: Dispatch) => ({dispatch: dispatch}),
)(App);

export const versionInputDispatchProps = (dispatch: Dispatch) => ({
  onSubmit: (e: SyntheticEvent<HTMLInputElement>): void => {
    e.preventDefault();
    dispatch(submitVersion());
    dispatch(updateUrl());
  },
  handleSearchBoxChange: (e: SyntheticEvent<HTMLInputElement>): void => {
    dispatch(updateVersionInput(e.currentTarget.value));
  },
  handleDismissSearchBoxVersion: (): void => {
    window.location.hash = '';
    dispatch(setVersion(''));
  },
});

const VersionInput = connect(
  // mapStateToProps
  (state: State) => ({
    value: state.versionInput,
  }),
  // mapDispatchToProps
  (dispatch: Dispatch) => versionInputDispatchProps(dispatch),
)(SearchForm);

type SearchFormProps = {
  onSubmit: (e: SyntheticEvent<HTMLInputElement>) => void,
  handleSearchBoxChange: (e: SyntheticEvent<HTMLInputElement>) => void,
  handleDismissSearchBoxVersion: () => void,
  value: string,
};

export function SearchForm({
  onSubmit,
  handleSearchBoxChange,
  handleDismissSearchBoxVersion,
  value,
}: SearchFormProps) {
  return (
    <Form onSubmit={onSubmit}>
      <Form.Item>
        <ClearableTextInput
          onChange={handleSearchBoxChange}
          onClick={handleDismissSearchBoxVersion}
          value={value}
        />
      </Form.Item>
    </Form>
  );
}

type ClearableTextInputProps = {
  onChange: (e: SyntheticEvent<HTMLInputElement>) => void,
  onClick: () => void,
  value: string,
};

function ClearableTextInput({
  onChange,
  onClick,
  value,
}: ClearableTextInputProps) {
  return (
    <Input
      addonAfter={
        <Icon type="close" onClick={onClick} style={{cursor: 'pointer'}} />
      }
      onChange={onChange}
      placeholder={'Firefox version, eg. "57.0"'}
      type="search"
      value={value}
    />
  );
}

const sideBarMapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  versions: state.latestChannelVersions,
});
const SideBar = connect(sideBarMapStateToProps)(ReleasesMenu);

function ReleasesMenu({versions}: {versions: OngoingVersions}) {
  let releasesMenu = <Spin />;
  if (versions.length) {
    releasesMenu = (
      <div className="menu">
        <h2>Firefox Releases</h2>
        <ul key="sub1">
          {versions.map(([channel: string, version: string]) => (
            <li key={channel}>
              <a
                href={localUrlFromVersion(version)}
              >{`${channel}: ${version}`}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return releasesMenu;
}

const currentReleaseMapStateToProps: MapStateToProps<*, *, *> = (
  state: State,
) => ({
  checkResults: state.checkResults,
  releaseInfo: state.releaseInfo,
  version: state.version,
  shouldRefresh: state.shouldRefresh,
});
const CurrentRelease = connect(currentReleaseMapStateToProps)(Dashboard);

type DashboardPropType = {
  checkResults: CheckResults,
  releaseInfo: ?ReleaseInfo,
  version: string,
  shouldRefresh: boolean,
};

export function Dashboard({
  releaseInfo,
  checkResults,
  version,
  shouldRefresh,
}: DashboardPropType) {
  if (version === '') {
    return (
      <p>
        Learn more about a specific version.
        <strong> Select or enter your version number.</strong>
      </p>
    );
  } else if (!releaseInfo) {
    return <Spin />;
  } else {
    return (
      <div>
        <h2 style={{marginBottom: '1em'}}>
          Channel: {releaseInfo.channel}{' '}
          <Alert
            message={shouldRefresh ? 'incomplete' : 'complete'}
            type={shouldRefresh ? 'error' : 'success'}
            showIcon
            style={{display: 'inline'}}
          />
        </h2>
        <div className="dashboard">
          {releaseInfo.checks.map(check =>
            // Map on the checklist to display the results in the same order.
            DisplayCheckResult(check.title, checkResults[check.title]),
          )}
        </div>
      </div>
    );
  }
}

export function DisplayCheckResult(title: string, checkResult: ?CheckResult) {
  return (
    <Card
      title={title}
      key={title}
      noHovering={true}
      style={{textAlign: 'center'}}
    >
      {checkResult ? (
        <DisplayStatus
          status={checkResult.status}
          message={checkResult.message}
          url={checkResult.link}
        />
      ) : (
        <Spin />
      )}
    </Card>
  );
}

export function DisplayStatus({
  status,
  message,
  url,
}: {
  status: Status,
  message: string,
  url: string,
}) {
  const statusToLabelClass = {
    error: 'error',
    exists: 'success',
    incomplete: 'info',
    missing: 'warning',
  };
  return (
    <a title={message} href={url}>
      <Alert message={message} type={statusToLabelClass[status]} showIcon />
    </a>
  );
}

function VersionLink({versionData}: {versionData: APIVersionData}) {
  if (!versionData) {
    return null;
  }
  const {commit, source, version} = versionData;
  const sourceUrl = source.replace(/\.git/, '');
  const url = `${sourceUrl}/commit/${commit}`;
  return <a href={url}>{version}</a>;
}

export default ConnectedApp;
