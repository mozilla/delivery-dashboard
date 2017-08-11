import React, { Component } from 'react';
import {
  Button,
  ButtonGroup,
  Col,
  Glyphicon,
  Grid,
  Navbar,
  Panel,
  Row
} from 'react-bootstrap';
import './App.css';

class App extends Component {
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
            <SearchForm/>
            {/* <CurrentRelease/> */}
          </Col>
          <Col sm={3}>
            <Panel header={<strong>Firefox Releases</strong>}>
              {/* <ReleasesMenu/> */}
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
      <form className="search-form well">
        <ClearableTextInput/>
      </form>
    );
  }
}

class ClearableTextInput extends Component {
  render() {
    return (
      <ButtonGroup className="clearable-text">
        <input
          type="search"
          className="form-control"
          placeholder={"Firefox version, eg. \"57.0\""}
        />
        <span className="text-clear-btn"><i className="glyphicon glyphicon-remove"/></span>
      </ButtonGroup>
    );
  }
}

export default App;
