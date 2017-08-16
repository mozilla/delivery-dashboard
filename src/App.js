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
      value: "",
      versionInput: "",
      latestChannelVersions: null,
    }
  }

  handleSearchBoxChange = (e) => {
    this.setState({versionInput: e.target.value})
  }

  handleDismissSearchBoxVersion = () => {
    this.setState({value: "", versionInput: ""})
  }

  handleSelectVersion = (version) => {
    this.setState({value: version, versionInput: version})
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.handleSelectVersion(this.state.versionInput)
  }

  render() {
    let releasesMenu = <Spinner/>
    if (this.state.latestChannelVersions !== null) {
      const releaseItem = (title, version) => {
        <li key={title}>
          <Button
            bsStyle="link"
            onClick={() => this.handleSelectVersion(version)}>
            {title + ": " + version}
          </Button>
        </li>
      }
      releasesMenu = <ul
        handleSelectVersion={this.handleSelectVersion}>
          {releaseItem("Nightly", this.state.latestChannelVersions.nightly)}
          {releaseItem("Beta", this.state.latestChannelVersions.beta)}
          {releaseItem("Release", this.state.latestChannelVersions.release)}
          {releaseItem("ESR", this.state.latestChannelVersions.esr)}
        </ul>
    }
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
              {releasesMenu}
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
export default App;
