import React, { Component } from 'react';
import {
  ButtonGroup,
  Col,
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
  constructor() {
    super()
    this.state = {value: ""}
  }

  handleChange = (e) => {
    this.setState({value: e.target.value})
  }

  handleClick = () => {
    this.setState({value: ""})
  }

  render() {
    return (
      <form className="search-form well">
        <ClearableTextInput
          onChange={this.handleChange}
          onClick={this.handleClick}
          value={this.state.value}/>
      </form>
    );
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

export default App;
