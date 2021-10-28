import React from 'react';
import { useHistory } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import { connect } from 'react-redux';

import logo from '../images/default-group-logo.svg';
import { logoutCurrentUser } from '../redux-store/actions/index';

const NavigationWhite = () => {
  const history = useHistory();
  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      style={{
        background: 'white',
        color: '#5bc5a7',
      }}
    >
      <Navbar.Brand href="/">
        <img
          src={logo}
          alt="Splitwise"
          style={{
            width: '25px',
            marginRight: '0.25rem',
          }}
        />
        <span
          style={{
            fontWeight: '700',
            marginLeft: '0.5rem',
            marginTop: '0.75rem',
          }}
        >
          Splitwise
        </span>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Nav>
          <div>
            <button
              type="button"
              className="btn btn-large"
              style={{
                border: 'none',
                color: '#5bc5a7 ',
                fontWeight: 600,
              }}
              onClick={() => {
                history.push('/login');
              }}
              variant="outline-info"
            >
              Login
            </button>

            <span
              style={{
                marginRight: '0.5rem',
                color: 'white',
                fontWeight: '500',
              }}
            >
              or
            </span>
            <button
              type="button"
              className="btn btn-large btn-mint"
              style={{
                color: 'white',
                backgroundColor: '#17a2b8',
                fontWeight: 600,
              }}
              onClick={() => {
                history.push('/signup');
              }}
              variant="outline-info"
            >
              Sign Up
            </button>
          </div>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

function mapStateToProps(state) {
  return {
    userName: state.userProfile ? state.userProfile.name : null,
    profilePicture: state.userProfile ? state.userProfile.profilePicture : null,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    logoutCurrentUser: () => dispatch(logoutCurrentUser()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NavigationWhite);
