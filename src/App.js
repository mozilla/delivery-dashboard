import React, { Component } from 'react';
import { Col, Grid, Navbar, Panel, Row } from 'react-bootstrap';
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
            {/* <SearchForm/> */}
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

export default App;
