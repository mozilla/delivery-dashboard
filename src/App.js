import React, { Component } from 'react';
import {
  Button,
  ButtonGroup,
  Col,
  Grid,
  Navbar,
  Panel,
  Row
} from 'react-bootstrap';
import './App.css';

class App extends Component {
  constructor() {
    super()
    this.state = {
      version: "",
      versionInput: "",
      latestChannelVersions: null,
      statuses: {
        archive: null,
        release_notes: null,
        security_advisories: null,
        download_links: null,
        product_details: null,
      }
    }
    fetch("https://pollbot.dev.mozaws.net/v1/firefox/ongoing-versions")
    .then(resp => resp.json())
    .then(data => {
      this.setState({latestChannelVersions: data})
    })
    .catch(err => console.error("Failed getting the latest channel versions", err))
  }

  handleSearchBoxChange = (e) => {
    this.setState({versionInput: e.target.value})
  }

  handleDismissSearchBoxVersion = () => {
    this.setState({version: "", versionInput: ""})
  }

  handleSelectVersion = (version) => {
    this.setState({version: version, versionInput: version})
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.handleSelectVersion(this.state.versionInput)
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
            <CurrentRelease version={this.state.version} statuses={this.state.statuses}/>
          </Col>
          <Col sm={3}>
            <Panel header={<strong>Firefox Releases</strong>}>
              <ReleasesMenu
                onSelectVersion={this.handleSelectVersion}
                versions={this.state.latestChannelVersions}/>
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}

class SearchForm extends Component {
  render() {
    return (
      <form
        className="search-form well"
        onSubmit={this.props.onSubmit}>
        <ClearableTextInput
          onChange={this.props.handleSearchBoxChange}
          onClick={this.props.handleDismissSearchBoxVersion}
          value={this.props.value}/>
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
        placeholder={"Firefox version, eg. \"57.0\""}
        type="search"
        value={props.value}/>
      <span
        className="text-clear-btn"
        onClick={props.onClick}>
        <i className="glyphicon glyphicon-remove"/>
      </span>
    </ButtonGroup>
  )
}

function Spinner(props) {
  return (
    <div className="loader"/>
  )
}

function ReleasesMenu(props) {
  let releasesMenu = <Spinner/>
  if (props.versions !== null) {
    const releaseItem = (title, version) => {
      return (
        <li key={title}>
        <Button
            bsStyle="link"
            onClick={() => props.onSelectVersion(version)}>
            {title + ": " + version}
          </Button>
        </li>)
    }
    releasesMenu = <ul>
        {releaseItem("Nightly", props.versions.nightly)}
        {releaseItem("Beta", props.versions.beta)}
        {releaseItem("Release", props.versions.release)}
        {releaseItem("ESR", props.versions.esr)}
      </ul>
  }
  return releasesMenu
}

function CurrentRelease({version, statuses}) {
  if (version === "") {
    return (
      <p>Learn more about a specific version.
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
        />)
  }
}

function Dashboard({
  archive,
  product_details,
  release_notes,
  security_advisories,
  download_links,
  version}) {
  return (
    <div>
      <table className="table">
        <tbody>
          <tr>
            <td>
              <h2>Release</h2>
              <DisplayStatus url={"#"} data={null/*releaseStatus(archive, product_details, release_notes, security_advisories)*/}/>
            </td>

            <td>
              <h2>Archives</h2>
              <DisplayStatus url={"https://archive.mozilla.org/pub/firefox/releases/" + version + "/"} data={archive}/>
            </td>

            <td>
              <h2>Product Details</h2>
              <DisplayStatus url={"https://product-details.mozilla.org/1.0/firefox.json"} data={product_details}/>
            </td>
          </tr>

          <tr>
            <td>
              <h2>Release Notes</h2>
              <DisplayStatus url={"https://www.mozilla.org/en-US/firefox/" + version + "/releasenotes/"} data={release_notes}/>
            </td>

            <td>
              <h2>Security Advisories</h2>
              <DisplayStatus url={"https://www.mozilla.org/en-US/security/known-vulnerabilities/firefox/"} data={security_advisories}/>
            </td>

            <td>
              <h2>Download links</h2>
              <DisplayStatus url={"https://www.mozilla.org/en-US/firefox/all/"} data={download_links}/>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function DisplayStatus({url, data}) {
  if (data === null) {
    return (
      <Spinner/>
    )
  } else {
    const {status, message} = data
    const statusToLabelClass = {
      Error: "label-warning",
      Exists: "label-success",
      Incomplete: "label-info",
      Missing: "label-danger",
    }
    const labelText = (status === "Error") ? ("Error: " + message) : status
    return (
      <a className={"label " + statusToLabelClass[status]} title={message} href={url}>
        {labelText}
      </a>
    )
  }
}

export default App;
