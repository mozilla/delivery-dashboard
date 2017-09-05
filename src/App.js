// @flow
import * as React from 'react';
import {ButtonGroup, Col, Grid, Navbar, Panel, Row} from 'react-bootstrap';
import './App.css';
import {connect} from 'react-redux';
import {
  setVersion,
  updateVersionInput,
  submitVersion,
  requestStatus,
  updateUrl,
  localUrlFromVersion,
  requestOngoingVersions,
} from './actions.js';
import type {
  Dispatch,
  OngoingVersions,
  State,
  CheckResult,
  Statuses,
} from './types.js';

function requestNotificationPermission(): void {
  if (
    Notification.permission !== 'denied' &&
    Notification.permission !== 'granted'
  ) {
    Notification.requestPermission();
  }
}

const parseUrl = (
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

class ConnectedApp extends React.Component<{dispatch: Dispatch}, void> {
  refreshIntervalId: ?number;

  constructor(props: {dispatch: Dispatch}): void {
    super(props);
    this.refreshIntervalId = null;
  }

  componentDidMount(): void {
    this.props.dispatch(requestOngoingVersions());
    // Setup auto-refresh.
    this.refreshIntervalId = setInterval(
      () => this.props.dispatch(requestStatus()),
      5000,
    );
    // Setup notifications.
    requestNotificationPermission();
    // Listen to url hash changes.
    window.onhashchange = this.versionFromHash;
    // Check if we have a version in the url.
    this.versionFromHash();
  }

  componentWillUnmount(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
  }

  versionFromHash = (): void => {
    const parsedUrl = parseUrl(window.location.hash);
    if (parsedUrl) {
      const version = parsedUrl.version;
      this.props.dispatch(setVersion(version));
      this.props.dispatch(requestStatus(version));
    }
  };

  render() {
    return (
      <Grid fluid>
        <Navbar collapseOnSelect fluid>
          <Navbar.Header>
            <Navbar.Brand>
              <a href=".">Delivery Dashboard</a>
            </Navbar.Brand>
          </Navbar.Header>
        </Navbar>
        <Row>
          <Col sm={9}>
            <VersionInput />
            <CurrentRelease />
          </Col>
          <Col sm={3} className="firefox-releases-menu">
            <Panel header={<strong>Firefox Releases</strong>}>
              <SideBar />
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}
const App = connect()(ConnectedApp);

const VersionInput = connect(
  // mapStateToProps
  (state: State) => ({
    value: state.versionInput,
  }),
  // mapDispatchToProps
  (dispatch: Dispatch) => ({
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
  }),
)(SearchForm);

type SearchFormProps = {
  onSubmit: (e: SyntheticEvent<HTMLInputElement>) => void,
  handleSearchBoxChange: (e: SyntheticEvent<HTMLInputElement>) => void,
  handleDismissSearchBoxVersion: () => void,
  value: string,
};

function SearchForm({
  onSubmit,
  handleSearchBoxChange,
  handleDismissSearchBoxVersion,
  value,
}: SearchFormProps) {
  return (
    <form className="search-form well" onSubmit={onSubmit}>
      <ClearableTextInput
        onChange={handleSearchBoxChange}
        onClick={handleDismissSearchBoxVersion}
        value={value}
      />
    </form>
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
    <ButtonGroup className="clearable-text">
      <input
        className="form-control"
        onChange={onChange}
        placeholder={'Firefox version, eg. "57.0"'}
        type="search"
        value={value}
      />
      <span className="text-clear-btn" onClick={onClick}>
        <i className="glyphicon glyphicon-remove" />
      </span>
    </ButtonGroup>
  );
}

function Spinner() {
  return <div className="loader" />;
}

const SideBar = connect(
  // mapStateToProps
  (state: State) => ({
    versions: state.latestChannelVersions,
  }),
  // mapDispatchToProps
  null,
)(ReleasesMenu);

function ReleasesMenu({versions}: {versions: OngoingVersions}) {
  let releasesMenu = <Spinner />;
  if (versions) {
    const {nightly, beta, release, esr} = versions;
    releasesMenu = (
      <ul>
        <ReleaseItem title="Nightly" version={nightly} />
        <ReleaseItem title="Beta" version={beta} />
        <ReleaseItem title="Release" version={release} />
        <ReleaseItem title="ESR" version={esr} />
      </ul>
    );
  }
  return releasesMenu;
}

function ReleaseItem({title, version}: {title: string, version: string}) {
  return (
    <li key={title}>
      <a href={localUrlFromVersion(version)}>
        {title + ': ' + version}
      </a>
    </li>
  );
}

const CurrentRelease = connect(
  // mapStateToProps
  (state: State) => ({
    statuses: state.statuses,
    version: state.version,
  }),
  // mapDispatchToProps
  null,
)(Dashboard);

type DashboardPropType = {
  version: string,
  statuses: Statuses,
};

function Dashboard({statuses, version}: DashboardPropType) {
  if (version === '') {
    return (
      <p>
        Learn more about a specific version.
        <strong> Select or enter your version number.</strong>
      </p>
    );
  } else {
    const {
      archive,
      product_details,
      release_notes,
      security_advisories,
      download_links,
    } = statuses;
    return (
      <div>
        <table className="table">
          <tbody>
            <tr>
              <td>
                <h2>Archives</h2>
                <DisplayStatus
                  url={
                    'https://archive.mozilla.org/pub/firefox/releases/' +
                    version +
                    '/'
                  }
                  data={archive}
                />
              </td>

              <td>
                <h2>Product Details</h2>
                <DisplayStatus
                  url={'https://product-details.mozilla.org/1.0/firefox.json'}
                  data={product_details}
                />
              </td>
            </tr>

            <tr>
              <td>
                <h2>Release Notes</h2>
                <DisplayStatus
                  url={
                    'https://www.mozilla.org/en-US/firefox/' +
                    version +
                    '/releasenotes/'
                  }
                  data={release_notes}
                />
              </td>

              <td>
                <h2>Security Advisories</h2>
                <DisplayStatus
                  url={
                    'https://www.mozilla.org/en-US/security/known-vulnerabilities/firefox/'
                  }
                  data={security_advisories}
                />
              </td>

              <td>
                <h2>Download links</h2>
                <DisplayStatus
                  url={'https://www.mozilla.org/en-US/firefox/all/'}
                  data={download_links}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

function DisplayStatus({url, data}: {url: string, data: ?CheckResult}) {
  if (!data) {
    return <Spinner />;
  } else {
    const {status, message} = data;
    const statusToLabelClass = {
      error: 'label-warning',
      exists: 'label-success',
      incomplete: 'label-info',
      missing: 'label-danger',
    };
    const msg = message || '';
    const labelText = status === 'error' ? 'Error: ' + msg : status;
    return (
      <a
        className={'label ' + statusToLabelClass[status]}
        title={message}
        href={url}
      >
        {labelText}
      </a>
    );
  }
}

export default App;
