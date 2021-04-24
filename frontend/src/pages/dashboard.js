import React, { Component } from 'react';
import {
  Alert,
  Card,
  Col,
  Container,
  ListGroup,
  Row,
  Modal,
  Button,
} from 'react-bootstrap';
import axios from 'axios';
import { withStyles } from '@material-ui/styles';
import numeral from 'numeral';
import Avatar from '@material-ui/core/Avatar';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';

import Navigation from '../components/navigation';
import DashboardMenu from '../components/dashboard-menu';
import '../shared/styles.css';
import config from '../shared/config';
import UserAuth from '../shared/user-auth';
import defaultAvatar from '../images/default-avatar.png';

const styles = () => ({
  root: {
    width: '100%',
  },
  youOwe: {
    color: '#ff652f',
    fontWeight: 500,
    fontSize: '18px',
  },
  youAreOwed: {
    color: '#5bc5a7 ',
    fontWeight: 500,
    fontSize: '18px',
  },
  row: {
    borderRadius: '0',
    border: 'none',
    float: 'left',
    width: '100%',
  },
  month: {
    textTransform: 'uppercase',
    fontSize: '12px',
    fontWeight: '400',
    color: '#999',
    textAlign: 'center',
  },
  date: {
    fontSize: '24px',
    textAlign: 'center',
    color: '#999',
    fontWeight: '500',
  },
  username: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#999',
  },
  youOweDescriptiveText: {
    color: '#ff652f',
  },
  youAreOwedDescriptiveText: {
    color: '#5bc5a7',
  },
  expense: {
    fontSize: '24px',
    textAlign: 'right',
    fontWeight: '500',
    color: '#999',
  },
  description: {
    fontSize: '16px',
    fontWeight: '500',
  },
  avatar: {
    width: '40px',
    height: '40px',
  },
  isSettleUpSuccess: {
    color: '#5bc5a7',
  },
});

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      youOwe: 0,
      youAreOwed: 0,
      owesList: [],
      owedList: [],
      errorMsg: '',
      showModal: false,
      selectedUserName: '',
      selectedUserId: '',
      isSettleUpSuccess: false,
    };

    this.settleUp = this.settleUp.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.onUserSelect = this.onUserSelect.bind(this);
  }

  componentDidMount() {
    this.getDashboardInfo();
    this.getBorrowedFromInfo();
    this.getLendedToInfo();
  }

  handleClose() {
    this.setState({
      showModal: false,
    });
  }

  handleOpen() {
    this.setState({
      showModal: true,
      isSettleUpSuccess: false,
      successMsg: '',
      errorMsg: '',
    });
  }

  onUserSelect(e, value) {
    console.log(value);
    this.setState({
      selectedUserName: value.name,
      selectedUserId: value.id,
    });
  }

  getDashboardInfo() {
    axios
      .get(`${config.server.url}/api/groups/dashboard`, {
        params: {
          userId: UserAuth.getUserId(),
        },
      })
      .then((response) => {
        if (response.status === 200) {
          let youOweAmt = 0;
          let youAreOwedAmt = 0;
          if (response.data.result && response.data.result.length > 0) {
            [youOweAmt, youAreOwedAmt] = response.data.result;
          }
          this.setState({
            youOwe: youOweAmt,
            youAreOwed: youAreOwedAmt,
            errorMsg: '',
          });
        }
      })
      .catch((err) => {
        if (err.response) {
          this.setState({
            errorMsg: err.response.data.message,
          });
        }
      });
  }

  getBorrowedFromInfo() {
    axios
      .get(`${config.server.url}/api/groups/get-borrow`, {
        params: {
          userId: UserAuth.getUserId(),
        },
      })
      .then((response) => {
        if (response.status === 200) {
          const youOweInfo = [];
          if (response.data.result && response.data.result.length > 0) {
            const expenseInfo = response.data.result[0];
            const userInfo = response.data.result[1];

            expenseInfo.forEach((element) => {
              const user = userInfo.filter(
                (item) => item._id === element.lenderId
              )[0];
              const info = {
                id: user._id,
                amount: element.expense,
                name: user.name,
                profile_picture: user.profilePicture,
              };
              youOweInfo.push(info);
            });
          }
          this.setState({
            owesList: youOweInfo || [],
            errorMsg: '',
          });
        }
      })
      .catch((err) => {
        if (err.response) {
          this.setState({
            errorMsg: err.response.data.message,
          });
        }
      });
  }

  getLendedToInfo() {
    axios
      .get(`${config.server.url}/api/groups/get-lended`, {
        params: {
          userId: UserAuth.getUserId(),
        },
      })
      .then((response) => {
        if (response.status === 200) {
          const youAreOwedInfo = [];
          if (response.data.result && response.data.result.length > 0) {
            const expenseInfo = response.data.result[0];
            const userInfo = response.data.result[1];

            expenseInfo.forEach((element) => {
              const user = userInfo.filter(
                (item) => item._id === element.borrowerId
              )[0];
              const info = {
                id: user._id,
                amount: element.expense,
                name: user.name,
                profile_picture: user.profilePicture,
              };
              youAreOwedInfo.push(info);
            });
          }
          this.setState({
            owedList: youAreOwedInfo || [],
            errorMsg: '',
          });
        }
      })
      .catch((err) => {
        if (err.response) {
          this.setState({
            errorMsg: err.response.data.message,
          });
        }
      });
  }

  settleUp() {
    const { selectedUserId } = this.state;
    axios
      .post(`${config.server.url}/api/groups/settle-up`, {
        userId: UserAuth.getUserId(),
        selectedUserId,
      })
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            isSettleUpSuccess: true,
            successMsg: response.data.message,
            errorMsg: '',
          });
          // this.recordTransaction();
        }
        return response.data.result;
      })
      .then(() => {
        this.getDashboardInfo();
      })
      .catch((err) => {
        if (err.response) {
          this.setState({
            isSettleUpSuccess: false,
            successMsg: '',
            errorMsg: err.response.data.message,
          });
        }
      });
  }

  recordTransaction() {
    const { selectedUserName, selectedUserId } = this.state;
    const entries = [
      {
        description: ` settled up with ${selectedUserName}.`,
        userName: UserAuth.getName(),
        userId: UserAuth.getUserId(),
      },
      {
        description: ` settled up with ${UserAuth.getName()}.`,
        userName: selectedUserName,
        userId: selectedUserId,
      },
    ];

    entries.forEach((item) => {
      const data = {
        userId: item.userId,
        groupId: null,
        userName: item.userName,
        groupName: null,
        description: item.description,
      };
      axios.post(`${config.server.url}/api/groups/transaction`, data);
    });
  }

  render() {
    const {
      youOwe,
      youAreOwed,
      owesList,
      owedList,
      successMsg,
      errorMsg,
      showModal,
      selectedUserName,
      isSettleUpSuccess,
    } = this.state;
    const { classes } = this.props;
    return (
      <div>
        <Navigation />

        {errorMsg && (
          <Alert variant="danger" style={{ margin: '1rem' }}>
            {errorMsg}
          </Alert>
        )}
        {successMsg && successMsg.length > 0 && (
          <Alert variant="success" style={{ margin: '1rem' }}>
            {successMsg}
          </Alert>
        )}

        <div className="container">
          <DashboardMenu selectedLink="dashboard" />
          <Container>
            <div id="center_column" style={{ width: '80%', float: 'right' }}>
              <div className="dashboard header">
                <div className="topbar">
                  <h2>Dashboard</h2>
                  <div className="actions">
                    <a
                      className="btn btn-large btn-mint"
                      data-toggle="modal"
                      href="#settle_up_form"
                      onClick={this.handleOpen}
                    >
                      Settle up
                    </a>
                  </div>
                  <hr />
                  <Row style={{ textAlign: 'center' }}>
                    <Col>
                      <span>total balance</span>
                      <br />
                      <span
                        className={
                          youAreOwed - youOwe < 0
                            ? classes.youOwe
                            : classes.youAreOwed
                        }
                      >
                        {numeral(youAreOwed - youOwe).format('$0.00')}
                      </span>
                    </Col>
                    <div style={{ borderLeft: '1px #ddd solid' }} />
                    <Col>
                      <span>you owe</span>
                      <br />
                      <span className={classes.youOwe}>
                        {numeral(youOwe).format('$0.00')}
                      </span>
                    </Col>
                    <div style={{ borderLeft: '1px #ddd solid' }} />

                    <Col>
                      <span>you are owed</span>
                      <br />
                      <span className={classes.youAreOwed}>
                        {numeral(youAreOwed).format('$0.00')}
                      </span>
                    </Col>
                  </Row>
                </div>
                <Row>
                  <Col>
                    <h6 style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
                      YOU OWE
                    </h6>
                    <hr />

                    <br />
                    {(!owesList || owesList.length === 0) && (
                      <div>You do not owe anything</div>
                    )}
                    {owesList.map((item) => (
                      <Card className={classes.row}>
                        <ListGroup variant="flush">
                          <ListGroup.Item>
                            <Row>
                              <Col sm={2} style={{ width: '3rem !important' }}>
                                <Avatar
                                  alt={item.name}
                                  src={
                                    item.profile_picture
                                      ? item.profile_picture
                                      : defaultAvatar
                                  }
                                  className={classes.avatar}
                                />
                              </Col>
                              <Col sm={10} style={{ width: '9rem !important' }}>
                                <div className={classes.username}>
                                  {item.name}
                                </div>
                                <div className={classes.youOweDescriptiveText}>
                                  you owe {numeral(item.amount).format('$0.00')}
                                </div>
                              </Col>
                            </Row>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card>
                    ))}
                  </Col>
                  <div style={{ borderLeft: '1px #ddd solid' }} />

                  <Col>
                    <h6 style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
                      YOU ARE OWED
                    </h6>
                    <hr />
                    <br />
                    {(!owedList || owedList.length === 0) && (
                      <div>You are not owed anything</div>
                    )}
                    {owedList.map((item) => (
                      <Card className={classes.row}>
                        <ListGroup variant="flush">
                          <ListGroup.Item>
                            <Row>
                              <Col sm={2} style={{ width: '3rem !important' }}>
                                <Avatar
                                  alt={item.name}
                                  src={
                                    item.profile_picture
                                      ? item.profile_picture
                                      : defaultAvatar
                                  }
                                  className={classes.avatar}
                                />
                              </Col>
                              <Col sm={10} style={{ width: '9rem !important' }}>
                                <div className={classes.username}>
                                  {item.name}
                                </div>
                                <div
                                  className={classes.youAreOwedDescriptiveText}
                                >
                                  owes you{' '}
                                  {numeral(item.amount).format('$0.00')}
                                </div>
                              </Col>
                            </Row>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card>
                    ))}
                  </Col>
                </Row>
              </div>
            </div>
          </Container>

          {showModal && (
            <Modal
              show={showModal}
              onHide={this.handleClose}
              size="lg"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Settle up</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Autocomplete
                  id="combo-box-demo"
                  options={Array.from(owedList)}
                  getOptionLabel={(option) => option.name}
                  onChange={this.onUserSelect}
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select user"
                      style={{ width: 300 }}
                      variant="outlined"
                    />
                  )}
                />
              </Modal.Body>
              <Modal.Footer>
                <Row style={{ width: '100%' }}>
                  <Col sm={6}>
                    {isSettleUpSuccess && (
                      <div className={classes.isSettleUpSuccess}>
                        You settled up with {selectedUserName}!
                      </div>
                    )}
                  </Col>
                  <Col sm={6} style={{ textAlign: 'right' }}>
                    <Button variant="secondary" onClick={this.handleClose}>
                      Cancel
                    </Button>
                    <button
                      type="button"
                      className="btn btn-large btn-mint"
                      variant="secondary"
                      onClick={this.settleUp}
                    >
                      Settle Up
                    </button>
                  </Col>
                </Row>
              </Modal.Footer>
            </Modal>
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Dashboard);
