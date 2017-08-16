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
    this.state = {value: "", versionInput: ""}
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
              <ReleasesMenu versions={[
                  "Nightly: 57.0a1",
                  "Beta: 56.0b1",
                  "Release: 55.0",
                  "ESR: 52.3.0esr",
                ]}
                handleSelectVersion={this.handleSelectVersion}
              />
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

function ReleasesMenu(props) {
  return (
    <ul>
      {props.versions.map(title =>
        <li key={title}>
          <Button
            bsStyle="link"
            onClick={() => props.handleSelectVersion(title)}>
            {title}
          </Button>
        </li>
      )}
    </ul>
  )
}

export default App;
