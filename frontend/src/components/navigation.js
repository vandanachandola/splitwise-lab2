import React from 'react';
import { useHistory } from 'react-router-dom';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { connect } from 'react-redux';
import Avatar from '@material-ui/core/Avatar';

import defaultAvatar from '../images/default-avatar.png';
import logo from '../images/default-group-logo.svg';
import {
  logoutCurrentUser,
  setUserProfile,
} from '../redux-store/actions/index';

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
          <div style={{ display: 'flex' }}>
            <Avatar alt={userName} src={profilePicture || defaultAvatar} />

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
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

function mapStateToProps(state) {
  return {
    userId: state.currentUser ? state.currentUser.id : null,
    userName: state.userProfile ? state.userProfile.name : null,
    profilePicture: state.userProfile ? state.userProfile.profilePicture : null,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    logoutCurrentUser: () => dispatch(logoutCurrentUser()),
    setUserProfile: (profile) => dispatch(setUserProfile(profile)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
