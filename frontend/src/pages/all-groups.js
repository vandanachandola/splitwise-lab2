import axios from 'axios';
import React, { Component } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Modal,
  Row,
} from 'react-bootstrap';
import { withStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';

import Navigation from '../components/navigation';
import UserAuth from '../shared/user-auth';
import config from '../shared/config';
import InviteStatus from '../enums/invite-status';
import { setAlertMessage } from '../redux-store/actions/index';
import AlertType from '../enums/alert-type';
import DashboardMenu from '../components/dashboard-menu';
import defaultGroupLogo from '../images/default-group-logo.svg';

const styles = () => ({
  root: {
    width: '100%',
  },
  redirect: {
    textDecoration: 'none',
    '&:hover': {
      color: '#999',
      textDecoration: 'none',
    },
  },
  title: {
    color: 'black',
  },
  status: {
    color: '#999',
  },
  groupPicture: {
    width: '15%',
    height: 'auto',
    float: 'left',
    marginRight: '1rem',
  },
});

class AllGroups extends Component {
  constructor() {
    super();
    this.state = {
      groups: [],
      showModal: false,
      filteredGroups: [],
    };

    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.onLinkClick = this.onLinkClick.bind(this);
    this.onGroupAction = this.onGroupAction.bind(this);
    this.onLeaveGroup = this.onLeaveGroup.bind(this);
    this.onGroupSelect = this.onGroupSelect.bind(this);
  }

  componentDidMount() {
    this.getMyGroups();
  }

  componentWillUnmount() {
    const alert = {
      type: '',
      message: '',
    };
    this.props.setAlertMessage(alert);
  }

  handleOpen() {
    this.setState({
      showModal: true,
    });
  }

  handleClose() {
    this.setState({
      showModal: false,
    });
  }

  onLinkClick(e, isAccepted) {
    if (!isAccepted) {
      e.preventDefault();
    }
  }

  onGroupAction(e, groupId, status) {
    if (e) {
      e.preventDefault();
    }

    let data = {};
    let apiEndpoint = '';
    if (status === InviteStatus.Left) {
      data = {
        userId: UserAuth.getUserId(),
        groupId,
      };
      apiEndpoint = `${config.server.url}/api/groups/leave-group`;
    } else {
      data = {
        inviteeId: UserAuth.getUserId(),
        groupId,
        updateType: status,
      };
      apiEndpoint = `${config.server.url}/api/groups/my-groups`;
    }

    axios
      .post(apiEndpoint, data)
      .then((response) => {
        if (response.status === 200) {
          const alert = {
            type: AlertType.Success,
            message: response.data.message,
          };
          this.props.setAlertMessage(alert);
        }
      })
      .then(() => {
        this.setState({ groups: [], filteredGroups: [] });
        this.getMyGroups();
      })
      .catch((err) => {
        if (err.response) {
          const alert = {
            type: AlertType.Error,
            message: err.response.data.message,
          };
          this.props.setAlertMessage(alert);
        }
      });
  }

  onLeaveGroup(e, groupId, status) {
    if (e) {
      e.preventDefault();
    }
    axios
      .get(`${config.server.url}/api/groups/check-dues`, {
        params: {
          groupId,
          userId: UserAuth.getUserId(),
        },
      })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.result && response.data.result.length > 0) {
            this.handleOpen();
          } else {
            return { groupId, status };
          }
        }
        return null;
      })
      .then((data) => {
        if (data) {
          this.onGroupAction(e, data.groupId, data.status);
        }
      })
      .catch((err) => {
        if (err.response) {
          const alert = {
            type: AlertType.Error,
            message: err.response.data.message,
          };
          this.props.setAlertMessage(alert);
        }
      });
  }

  onGroupSelect(e, value) {
    if (value) {
      this.setState({
        filteredGroups: [value],
      });
    }
    return null;
  }

  getMyGroups() {
    axios
      .get(`${config.server.url}/api/groups/my-groups`, {
        params: { userId: UserAuth.getUserId() },
      })
      .then((res) => {
        if (res.status === 200) {
          this.setState((prevState) => ({
            groups: prevState.groups.concat(res.data.result),
            filteredGroups: prevState.groups.concat(res.data.result),
          }));
        }
      })
      .catch((err) => {
        if (err.response) {
          const alert = {
            type: AlertType.Error,
            message: err.response.data.message,
          };
          this.props.setAlertMessage(alert);
        }
      });
  }

  render() {
    const { groups, showModal, filteredGroups } = this.state;
    const { classes } = this.props;
    const userId = UserAuth.getUserId();

    return (
      <div>
        <Navigation />
        {this.props.alert && this.props.alert.type === 'error' && (
          <Alert variant="danger" style={{ margin: '1rem' }}>
            {this.props.alert.message}
          </Alert>
        )}
        {this.props.alert && this.props.alert.type === 'success' && (
          <Alert variant="success" style={{ margin: '1rem' }}>
            {this.props.alert.message}
          </Alert>
        )}
        <div className="container">
          <DashboardMenu selectedLink="all-groups" />
          <Container style={{ border: '1px solid #ddd' }}>
            <div id="center_column" style={{ width: '80%', float: 'right' }}>
              <div className="dashboard header">
                <div className="topbar">
                  <h2>All Groups</h2>
                  <div className="actions">
                    <Autocomplete
                      id="combo-box-demo"
                      options={groups}
                      getOptionLabel={(option) => option.name}
                      onChange={this.onGroupSelect}
                      size="small"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select group"
                          style={{ width: 300 }}
                          variant="outlined"
                        />
                      )}
                    />
                  </div>
                </div>
                <Row>
                  <Col>
                    {filteredGroups.length === 0 && <em>No groups to show</em>}
                    {filteredGroups.map((input) => (
                      <Link
                        to={`/group/${input._id}`}
                        className={classes.redirect}
                        onClick={(e) =>
                          this.onLinkClick(
                            e,
                            input.members && input.members.includes(userId)
                          )
                        }
                      >
                        <Card style={{ marginTop: '0.5rem' }}>
                          <Card.Body>
                            <img
                              className={classes.groupPicture}
                              alt={input.name}
                              src={input.groupPicture || defaultGroupLogo}
                            />

                            <Card.Title className={classes.title}>
                              {input.name}
                            </Card.Title>
                            <Card.Text className={classes.status}>
                              {input.pendingInvites &&
                                input.pendingInvites.includes(userId) && (
                                  <em>Your current status: PENDING</em>
                                )}
                              {input.members &&
                                input.members.includes(userId) && (
                                  <em>Your current status: ACCEPTED</em>
                                )}
                            </Card.Text>

                            {input.pendingInvites &&
                              input.pendingInvites.includes(userId) && (
                                <div style={{ float: 'right' }}>
                                  <Button
                                    size="sm"
                                    variant="success"
                                    style={{ marginRight: '1rem' }}
                                    onClick={(e) =>
                                      this.onGroupAction(
                                        e,
                                        input._id,
                                        InviteStatus.Accepted
                                      )
                                    }
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={(e) =>
                                      this.onGroupAction(
                                        e,
                                        input._id,
                                        InviteStatus.Rejected
                                      )
                                    }
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            {input.members && input.members.includes(userId) && (
                              <div style={{ float: 'right' }}>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={(e) =>
                                    this.onLeaveGroup(
                                      e,
                                      input._id,
                                      InviteStatus.Left
                                    )
                                  }
                                >
                                  Leave group
                                </Button>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Link>
                    ))}

                    {showModal && (
                      <Modal
                        show={showModal}
                        onHide={this.handleClose}
                        size="lg"
                        centered
                      >
                        <Modal.Header closeButton>
                          <Modal.Title>Error!</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          All dues need to be settled before leaving the group.
                        </Modal.Body>
                        <Modal.Footer>
                          <Button
                            variant="secondary"
                            onClick={this.handleClose}
                          >
                            Close
                          </Button>
                        </Modal.Footer>
                      </Modal>
                    )}
                  </Col>
                </Row>
              </div>
            </div>
          </Container>

          {showModal && (
            <Modal show={showModal} onHide={handleClose} size="lg" centered>
              <Modal.Header closeButton>
                <Modal.Title>Error!</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                All dues need to be settled before leaving the group.
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          )}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    alert: state.alert,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setAlertMessage: (alert) => dispatch(setAlertMessage(alert)),
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles)
)(AllGroups);
