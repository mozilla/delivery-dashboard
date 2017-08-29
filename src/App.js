import React, { Component } from 'react'
import {
  Button,
  ButtonGroup,
  Col,
  Grid,
  Navbar,
  Panel,
  Row
} from 'react-bootstrap'
import './App.css'


function requestNotificationPermission() {
  if (Notification.permission !== "denied" &&
      Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

function notifyChanges(changed) {
  if (Notification.permission === "granted") {
    const names = changed.map((s) => s.replace("_", " ")).join(", ");
    new Notification(`${document.title}: Status of ${names} changed.`);
  }
}

function fetchStatus(version) {
  const stateToUrl = {
    archive: 'archive',
    release_notes: 'bedrock/release-notes',
    security_advisories: 'bedrock/security-advisories',
    download_links: 'bedrock/download-links',
    product_details: 'product-details'
  }
  return Promise.all(Object.keys(stateToUrl).map(key => {
      const endpoint = stateToUrl[key];
      return fetch(`https://pollbot.dev.mozaws.net/v1/firefox/${version}/${endpoint}`)
        .then(resp => resp.json())
        .then(details => ({key, details}))
    }))
    .then(results => results.reduce((acc, {key, details}) => {
      acc[key] = details;
      return acc;
    }, {}));
}


function fetchOngoingVersions() {
  return fetch('https://pollbot.dev.mozaws.net/v1/firefox/ongoing-versions')
    .then(resp => resp.json())
}


const initStatuses = () => {
  return {
    archive: null,
    release_notes: null,
    security_advisories: null,
    download_links: null,
    product_details: null
  }
}

class App extends Component {
  constructor() {
    super()
    this.state = {
      version: '',
      versionInput: '',
      latestChannelVersions: null,
      statuses: initStatuses()
    }

    this.refreshIntervalId = null;
  }

  componentDidMount() {
    fetchOngoingVersions()
      .then(data => {
        this.setState({ latestChannelVersions: data })
      })
      .catch(err =>
        console.error('Failed getting the latest channel versions', err)
      );
    // Setup auto-refresh.
    this.refreshIntervalId = setInterval(this.refreshStatus, 5000);
    // Setup notifications.
    requestNotificationPermission();
  }

  componentWillUnmount(){
    clearInterval(this.refreshIntervalId);
  }

  handleSearchBoxChange = e => {
    this.setState({ versionInput: e.target.value })
  }

  handleDismissSearchBoxVersion = () => {
    this.setState({ version: '', versionInput: '' })
  }

  handleSelectVersion = version => {
    this.setState({
      version: version,
      versionInput: version,
      statuses: initStatuses()
    })
    this.refreshStatus(version)
  }

  handleSubmit = e => {
    e.preventDefault()
    this.handleSelectVersion(this.state.versionInput)
  }

  refreshStatus = version => {
    version = version || this.state.version;
    if (!version) {
      return;
    }
    fetchStatus(version)
      .then(statuses => {
        // Detect if some status changed, and notify!
        const changed = Object.keys(statuses).filter((key) => {
          const previous = this.state.statuses[key];
          return previous !== null && previous.status !== statuses[key].status;
        });
        if (changed.length > 0) {
          notifyChanges(changed);
        }
        // Save current state.
        this.setState({statuses});
      })
      .catch(err =>
        console.error('Failed getting the latest channel versions', err)
      );
  }

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
            <SearchForm
              handleSearchBoxChange={this.handleSearchBoxChange}
              handleDismissSearchBoxVersion={this.handleDismissSearchBoxVersion}
              onSubmit={this.handleSubmit}
              value={this.state.versionInput}
            />
            <CurrentRelease
              version={this.state.version}
              statuses={this.state.statuses}
            />
          </Col>
          <Col sm={3} className="firefox-releases-menu">
            <Panel header={<strong>Firefox Releases</strong>}>
              <ReleasesMenu
                onSelectVersion={this.handleSelectVersion}
                versions={this.state.latestChannelVersions}
              />
            </Panel>
          </Col>
        </Row>
      </Grid>
    )
  }
}

class SearchForm extends Component {
  render() {
    return (
      <form className="search-form well" onSubmit={this.props.onSubmit}>
        <ClearableTextInput
          onChange={this.props.handleSearchBoxChange}
          onClick={this.props.handleDismissSearchBoxVersion}
          value={this.props.value}
        />
      </form>
    )
  }
}

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
  )
}

function Spinner(props) {
  return <div className="loader" />
}

function ReleasesMenu(props) {
  let releasesMenu = <Spinner />
  if (props.versions !== null) {
    const releaseItem = (title, version) => {
      return (
        <li key={title}>
          <Button bsStyle="link" onClick={() => props.onSelectVersion(version)}>
            {title + ': ' + version}
          </Button>
        </li>
      )
    }
    releasesMenu = (
      <ul>
        {releaseItem('Nightly', props.versions.nightly)}
        {releaseItem('Beta', props.versions.beta)}
        {releaseItem('Release', props.versions.release)}
        {releaseItem('ESR', props.versions.esr)}
      </ul>
    )
  }
  return releasesMenu
}

function CurrentRelease({ version, statuses }) {
  if (version === '') {
    return (
      <p>
        Learn more about a specific version.
        <strong> Select or enter your version number.</strong>
      </p>
    )
  } else {
    return (
      <Dashboard
        archive={statuses.archive}
        product_details={statuses.product_details}
        release_notes={statuses.release_notes}
        security_advisories={statuses.security_advisories}
        download_links={statuses.download_links}
        version={version}
      />
    )
  }
}

function Dashboard({
  archive,
  product_details,
  release_notes,
  security_advisories,
  download_links,
  version
}) {
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
                  download_links
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
  )
}

function DisplayStatus({ url, data }) {
  if (data === null) {
    return <Spinner />
  } else {
    const { status, message } = data
    const statusToLabelClass = {
      error: 'label-warning',
      exists: 'label-success',
      incomplete: 'label-info',
      missing: 'label-danger'
    }
    const labelText = status === 'error' ? 'Error: ' + message : status
    return (
      <a
        className={'label ' + statusToLabelClass[status]}
        title={message}
        href={url}
      >
        {labelText}
      </a>
    )
  }
}

function releaseStatus(
  archive,
  product_details,
  release_notes,
  security_advisories,
  download_links
) {
  if (
    archive === null &&
    product_details === null &&
    release_notes === null &&
    security_advisories === null &&
    download_links === null
  ) {
    return null
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
      message: 'All checks validates, the release is complete.'
    }
  }

  return {
    status: 'incomplete',
    message: 'One or more of the release checks did not validate.'
  }
}

export default App
