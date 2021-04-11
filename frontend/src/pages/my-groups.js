import axios from 'axios';
import React, { Component } from 'react';
import { Alert, Button, Card, Modal } from 'react-bootstrap';
import { withStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Navigation from '../components/navigation';
import UserAuth from '../shared/user-auth';
import config from '../shared/config';
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

class MyGroups extends Component {
  constructor() {
    super();
    this.state = {
      groups: [],
      showModal: false,
    };

    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.onLinkClick = this.onLinkClick.bind(this);
    this.onGroupAction = this.onGroupAction.bind(this);
    this.onLeaveGroup = this.onLeaveGroup.bind(this);
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

  onLinkClick(e, status) {
    if (status !== InviteStatus.Accepted) {
      e.preventDefault();
    }
  }

  onGroupAction(e, groupId, status) {
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
        this.setState({ groups: [] });
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
          const { owesAmount, owedAmount } = response.data.result[0];
          if (!owesAmount && !owedAmount) {
            return { groupId, status };
          }
          this.handleOpen();
        }
        return null;
      })
      .then((data) => {
        if (data) {
          this.onGroupAction(e, data.groupId, data.status);
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
    const { groups, showModal } = this.state;
    const { classes } = this.props;

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
          <h2>My groups</h2>

          {groups.length === 0 && <em>No groups to show</em>}
          {groups.map((input) => (
            <Link
              to={`/group/${input.groupId}`}
              className={classes.redirect}
              onClick={(e) => this.onLinkClick(e, input.status)}
            >
              <Card style={{ marginTop: '0.5rem' }}>
                <Card.Body>
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
                    {input.status === 3 && <em>Your current status: LEFT</em>}
                  </Card.Text>

                  {input.status === 0 && (
                    <div style={{ float: 'right' }}>
                      <Button
                        size="sm"
                        variant="success"
                        style={{ marginRight: '1rem' }}
                        onClick={(e) =>
                          this.onGroupAction(
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
                          this.onGroupAction(
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
                          this.onLeaveGroup(e, input.groupId, InviteStatus.Left)
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
                <Button variant="secondary" onClick={this.handleClose}>
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
)(MyGroups);
