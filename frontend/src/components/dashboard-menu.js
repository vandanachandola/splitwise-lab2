import React, { Component } from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { withStyles } from '@material-ui/styles';
import axios from 'axios';

import config from '../shared/config';
import UserAuth from '../shared/user-auth';
import InviteStatus from '../enums/invite-status';

const styles = () => ({
  root: {
    width: '100%',
  },
  link: {
    color: '#999',
    fontWeight: '400',
    fontSize: '16px',
    '&:hover': {
      background: '#eee',
      color: '#999',
    },
  },
  selected: {
    borderLeft: '6px solid #5bc5a7',
    color: '#5bc5a7',
    fontWeight: 'bold',
    fontSize: '17px',
  },
  groupHeader: {
    padding: '0.5rem 1rem',
    marginTop: '2rem',
    fontWeight: 500,
    background: '#ddd',
    border: 'none',
  },
});

class DashboardMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groups: [],
    };
    this.getMyGroups = this.getMyGroups.bind(this);
  }

  componentDidMount() {
    this.getMyGroups();
  }

  getMyGroups() {
    axios
      .get(`${config.server.url}/api/groups/my-groups`, {
        params: { userId: UserAuth.getUserId() },
      })
      .then((res) => {
        if (res.status === 200) {
          const onlyAcceptedGroups = res.data.result.filter(
            (item) =>
              item.members && item.members.includes(UserAuth.getUserId())
          );
          this.setState({ groups: [...onlyAcceptedGroups] });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    const { classes, selectedLink } = this.props;
    const { groups } = this.state;

    return (
      <div className={classes.root} style={{ width: '20%', float: 'left' }}>
        <Nav pullRight className="flex-column">
          <LinkContainer
            to="/dashboard"
            className={selectedLink === 'dashboard' ? classes.selected : ''}
          >
            <Nav.Link className={classes.link} eventKey={1}>
              Dashboard
            </Nav.Link>
          </LinkContainer>
          <LinkContainer
            to="/activity"
            className={selectedLink === 'activity' ? classes.selected : ''}
          >
            <Nav.Link className={classes.link} eventKey={2}>
              Recent activity
            </Nav.Link>
          </LinkContainer>
          <LinkContainer
            to="/all-groups"
            className={selectedLink === 'all-groups' ? classes.selected : ''}
          >
            <Nav.Link className={classes.link} eventKey={3}>
              All groups
            </Nav.Link>
          </LinkContainer>

          <div className={classes.groupHeader}>GROUPS</div>
          {(!groups || groups.length === 0) && (
            <em style={{ padding: '0.5rem 1rem' }}>No groups to show.</em>
          )}
          {groups.map((input, index) => (
            <LinkContainer
              key={input._id}
              to={{ pathname: `/group/${input._id}`, state: { group: input } }}
              className={
                selectedLink === `group_${input._id}` ? classes.selected : ''
              }
            >
              <Nav.Link className={classes.link} eventKey={index + 4}>
                {input.name}
              </Nav.Link>
            </LinkContainer>
          ))}
        </Nav>
      </div>
    );
  }
}

export default withStyles(styles)(DashboardMenu);
