import PropTypes from 'prop-types';
import React, {Component} from 'react';
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

function requestNotificationPermission() {
  if (
    Notification.permission !== 'denied' &&
    Notification.permission !== 'granted'
  ) {
    Notification.requestPermission();
  }
}

const parseUrl = url => {
  const re = /^#(\w+)\/(\w+)\/([^/]+)\/?/; // Eg: #pollbot/firefox/50.0
  const parsed = url.match(re);
  if (parsed === null) {
    return {};
  }
  const [_, service, product, version] = parsed;
  return {
    service: service,
    product: product,
    version: version,
  };
};

class App extends Component {
  constructor(props) {
    super(props);
    this.refreshIntervalId = null;
  }

  componentDidMount() {
    this.props.dispatch(requestOngoingVersions());
    // Setup auto-refresh.
    this.refreshIntervalId = setInterval(this.refreshStatus, 5000);
    // Setup notifications.
    requestNotificationPermission();
    // Listen to url hash changes.
    window.onhashchange = this.versionFromHash;
    // Check if we have a version in the url.
    this.versionFromHash();
  }

  componentWillUnmount() {
    clearInterval(this.refreshIntervalId);
  }

  versionFromHash = () => {
    const parsedUrl = parseUrl(window.location.hash);
    if ('version' in parsedUrl) {
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
App = connect()(App);
App.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const VersionInput = connect(
  // mapStateToProps
  state => {
    return {
      value: state.versionInput,
    };
  },
  // mapDispatchToProps
  dispatch => {
    return {
      onSubmit: e => {
        e.preventDefault();
        dispatch(submitVersion());
        dispatch(updateUrl());
      },
      handleSearchBoxChange: e => {
        dispatch(updateVersionInput(e.target.value));
      },
      handleDismissSearchBoxVersion: () => {
        window.location.hash = '';
        dispatch(setVersion(''));
      },
    };
  },
)(SearchForm);

function SearchForm({
  onSubmit,
  handleSearchBoxChange,
  handleDismissSearchBoxVersion,
  value,
}) {
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
SearchForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleSearchBoxChange: PropTypes.func.isRequired,
  handleDismissSearchBoxVersion: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

function ClearableTextInput(props) {
  return (
    <ButtonGroup className="clearable-text">
      <input
        className="form-control"
        onChange={props.onChange}
        placeholder={'Firefox version, eg. "57.0"'}
        type="search"
        value={props.value}
      />
      <span className="text-clear-btn" onClick={props.onClick}>
        <i className="glyphicon glyphicon-remove" />
      </span>
    </ButtonGroup>
  );
}
ClearableTextInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

function Spinner() {
  return <div className="loader" />;
}

const SideBar = connect(
  // mapStateToProps
  state => {
    return {
      versions: state.latestChannelVersions,
    };
  },
  // mapDispatchToProps
  null,
)(ReleasesMenu);

function ReleasesMenu({versions}) {
  let releasesMenu = <Spinner />;
  if (versions !== null) {
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

function ReleaseItem({title, version}) {
  return (
    <li key={title}>
      <a href={localUrlFromVersion(version)}>
        {title + ': ' + version}
      </a>
    </li>
  );
}
ReleaseItem.propTypes = {
  title: PropTypes.string,
  version: PropTypes.string,
};

const CurrentRelease = connect(
  // mapStateToProps
  state => {
    return {
      statuses: state.statuses,
      version: state.version,
    };
  },
  // mapDispatchToProps
  null,
)(Dashboard);

function Dashboard({statuses, version}) {
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
                <h2>Release</h2>
                <DisplayStatus
                  url={'#'}
                  data={releaseStatus(
                    archive,
                    product_details,
                    release_notes,
                    security_advisories,
                    download_links,
                  )}
                />
              </td>

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
const StatusPropType = PropTypes.shape({
  status: PropTypes.string.isRequired,
  message: PropTypes.string,
});
Dashboard.propTypes = {
  version: PropTypes.string.isRequired,
  statuses: PropTypes.shape({
    archive: StatusPropType,
    product_details: StatusPropType,
    release_notes: StatusPropType,
    security_advisories: StatusPropType,
    download_links: StatusPropType,
  }),
};

function DisplayStatus({url, data}) {
  if (data === null) {
    return <Spinner />;
  } else {
    const {status, message} = data;
    const statusToLabelClass = {
      error: 'label-warning',
      exists: 'label-success',
      incomplete: 'label-info',
      missing: 'label-danger',
    };
    const labelText = status === 'error' ? 'Error: ' + message : status;
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
DisplayStatus.propTypes = {
  url: PropTypes.string.isRequired,
  data: StatusPropType,
};

function releaseStatus(
  archive,
  product_details,
  release_notes,
  security_advisories,
  download_links,
) {
  if (
    archive === null &&
    product_details === null &&
    release_notes === null &&
    security_advisories === null &&
    download_links === null
  ) {
    return null;
  }

  if (
    archive !== null &&
    archive.status === 'exists' &&
    (product_details !== null && product_details.status === 'exists') &&
    (release_notes !== null && release_notes.status === 'exists') &&
    (security_advisories !== null && security_advisories.status === 'exists') &&
    (download_links !== null && download_links.status === 'exists')
  ) {
    return {
      status: 'exists',
      message: 'All checks validates, the release is complete.',
    };
  }

  return {
    status: 'incomplete',
    message: 'One or more of the release checks did not validate.',
  };
}

export default App;
