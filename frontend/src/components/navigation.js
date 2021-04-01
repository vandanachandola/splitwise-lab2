import React from 'react';
import { useHistory } from 'react-router-dom';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { connect } from 'react-redux';
import Avatar from '@material-ui/core/Avatar';

import defaultAvatar from '../images/default-avatar.png';
import logo from '../images/default-group-logo.svg';
import config from '../shared/config';
import { logoutCurrentUser } from '../redux-store/actions/index';

const Navigation = (props) => {
  const history = useHistory();
  const { userName, profilePicture } = props;

  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      variant="dark"
      style={{ background: '#5bc5a7', color: 'white' }}
    >
      <Navbar.Brand href="/">
        <img
          src={logo}
          alt="Splitwise"
          style={{ width: '25px', marginRight: '0.25rem' }}
        />
        <span style={{ fontWeight: '600' }}>Splitwise</span>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Nav>
          {!userName && (
            <div>
              <button
                type="button"
                className="btn btn-large btn-mint"
                style={{ marginRight: '1rem', border: '1px solid #eee' }}
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
                className="btn btn-large btn-orange"
                style={{ color: 'white', backgroundColor: '#17a2b8' }}
                onClick={() => {
                  history.push('/signup');
                }}
                variant="outline-info"
              >
                Sign Up
              </button>
            </div>
          )}
          {userName && (
            <div style={{ display: 'flex' }}>
              {profilePicture && (
                <Avatar
                  alt={userName}
                  src={`${config.server.url}/${profilePicture}`}
                />
              )}
              {!profilePicture && <Avatar alt={userName} src={defaultAvatar} />}

              <NavDropdown
                style={{ color: 'white' }}
                title={userName}
                id="collapsible-nav-dropdown"
              >
                <NavDropdown.Item
                  onClick={() => {
                    history.push('/profile');
                  }}
                >
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item
                  onClick={() => {
                    history.push('/new-group');
                  }}
                >
                  Create group
                </NavDropdown.Item>
                <NavDropdown.Item
                  onClick={() => {
                    history.push('/my-groups');
                  }}
                >
                  My groups
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  onClick={() => {
                    props.logoutCurrentUser();
                    history.push('/login');
                  }}
                >
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </div>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

function mapStateToProps(state) {
  return {
    userName: state.currentUser ? state.currentUser.name : null,
    profilePicture: state.currentUser ? state.currentUser.profilePicture : null,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    logoutCurrentUser: () => dispatch(logoutCurrentUser()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
