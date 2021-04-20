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
import axios from 'axios';
import { withStyles } from '@material-ui/styles';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Navigation from '../components/navigation';
import DashboardMenu from '../components/dashboard-menu';
import '../shared/styles.css';
import config from '../shared/config';
import UserAuth from '../shared/user-auth';
import InviteStatus from '../enums/invite-status';
import { setAlertMessage } from '../redux-store/actions/index';

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
});

class AllGroups extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      groups: [],
      filteredGroups: [],
    };

    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount() {
    this.getMyGroups();
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
        if (err.response.status === 400 || err.response === 500) {
          const alert = {
            type: AlertType.Error,
            message: err.response.data.message,
          };
          this.props.setAlertMessage(alert);
        }
      });
  }

  render() {
    const { showModal, groups, filteredGroups } = this.state;
    const { classes } = this.props;

    const onGroupSelect = (e, value) => {
      if (value) {
        this.setState({
          filteredGroups: [value],
        });
      }
      return null;
    };

    const onLinkClick = (e, status) => {
      console.log(status);
      if (status !== InviteStatus.Accepted) {
        e.preventDefault();
      }
    };

    const onGroupAction = (e, groupId, status) => {
      if (e) {
        e.preventDefault();
      }
      const data = {
        userId: UserAuth.getUserId(),
        groupId,
        status,
      };

      axios
        .post(`${config.server.url}/api/groups/my-groups`, data)
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
          if (err.response.status === 500) {
            const alert = {
              type: AlertType.Error,
              message: err.response.data.message,
            };
            this.props.setAlertMessage(alert);
          }
        });
    };

    const handleOpen = () => {
      this.setState({
        showModal: true,
      });
    };

    const handleClose = () => {
      this.setState({
        showModal: false,
      });
    };

    const onLeaveGroup = (e, groupId, status) => {
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
            const { owesAmount, owedAmount } = response.data.result[0];
            if (!Number(owesAmount) && !Number(owedAmount)) {
              return { groupId, status };
            }
            handleOpen();
          }
          return null;
        })
        .then((data) => {
          if (data) {
            onGroupAction(e, data.groupId, data.status);
          }
        })
        .catch((err) => {
          if (err.response.status === 500) {
            const alert = {
              type: AlertType.Error,
              message: err.response.data.message,
            };
            this.props.setAlertMessage(alert);
          }
        });
    };

    const onRedirect = (groupId) => <Redirect to={`/group/${groupId}`} />;

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
                      onChange={onGroupSelect}
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
                        to={`/group/${input.groupId}`}
                        className={classes.redirect}
                        onClick={(e) => onLinkClick(e, input.status)}
                      >
                        <Card style={{ marginTop: '0.5rem' }}>
                          <Card.Body onClick={() => onRedirect(input.groupId)}>
                            <Card.Title className={classes.title}>
                              {input.name}
                            </Card.Title>
                            <Card.Text className={classes.status}>
                              {input.status === 0 && (
                                <em>Your current status: PENDING</em>
                              )}
                              {input.status === 1 && (
                                <em>Your current status: ACCEPTED</em>
                              )}
                              {input.status === 2 && (
                                <em>Your current status: REJECTED</em>
                              )}
                              {input.status === 3 && (
                                <em>Your current status: LEFT</em>
                              )}
                            </Card.Text>
                            {input.status === 0 && (
                              <div style={{ float: 'right' }}>
                                <Button
                                  size="sm"
                                  variant="success"
                                  style={{ marginRight: '1rem' }}
                                  onClick={(e) =>
                                    onGroupAction(
                                      e,
                                      input.groupId,
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
                                    onGroupAction(
                                      e,
                                      input.groupId,
                                      InviteStatus.Rejected
                                    )
                                  }
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                            {input.status !== 0 && (
                              <div style={{ float: 'right' }}>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={(e) =>
                                    onLeaveGroup(
                                      e,
                                      input.groupId,
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
                        onHide={handleClose}
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
                          <Button variant="secondary" onClick={handleClose}>
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
