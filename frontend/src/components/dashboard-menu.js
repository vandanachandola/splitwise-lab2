import React, { Component } from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { withStyles } from '@material-ui/styles';
import axios from 'axios';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import FlagIcon from '@material-ui/icons/Flag';
import ListIcon from '@material-ui/icons/List';
import DraftsIcon from '@material-ui/icons/Drafts';

import config from '../shared/config';
import UserAuth from '../shared/user-auth';

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
    this.handleGroupClick = this.handleGroupClick.bind(this);
  }

  componentDidMount() {
    this.getMyGroups();
  }

  handleGroupClick(id) {
    this.props.navigation.navigate(`/group/${id}`);
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
              <DraftsIcon
                style={{ fontSize: 'medium', marginRight: '0.5rem' }}
              />
              Dashboard
            </Nav.Link>
          </LinkContainer>
          <LinkContainer
            to="/activity"
            className={selectedLink === 'activity' ? classes.selected : ''}
          >
            <Nav.Link className={classes.link} eventKey={2}>
              <FlagIcon style={{ fontSize: 'medium', marginRight: '0.5rem' }} />
              Recent activity
            </Nav.Link>
          </LinkContainer>
          <LinkContainer
            to="/all-groups"
            className={selectedLink === 'all-groups' ? classes.selected : ''}
          >
            <Nav.Link className={classes.link} eventKey={3}>
              <ListIcon style={{ fontSize: 'medium', marginRight: '0.5rem' }} />
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
              to={`/group/${input._id}`}
              className={
                selectedLink === `group_${input._id}` ? classes.selected : ''
              }
              onClick={() => {
                this.handleGroupClick(input._id);
              }}
            >
              <Nav.Link className={classes.link} eventKey={index + 4}>
                <LocalOfferIcon
                  style={{ fontSize: 'medium', marginRight: '0.5rem' }}
                />
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
