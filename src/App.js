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
            {/* <CurrentRelease/> */}
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

export default App;
