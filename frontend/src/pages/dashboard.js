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
import TransactionType from '../enums/transaction-type';

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
    this.refreshDashboard();
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
      selectedUserName: value.borrowerName,
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
        let totalExpense = 0;
        if (response.status === 200) {
          const youOweInfo = [];
          if (response.data.result && response.data.result.length > 0) {
            const expenseInfo = response.data.result[0];
            const userInfo = response.data.result[1];

            userInfo.forEach((element) => {
              const expenses = expenseInfo.filter(
                (item) => item.lenderId === element._id
              );

              let totalExpenseForUser = 0;
              expenses.forEach((expense) => {
                totalExpenseForUser += expense.expenseAmount;
              });
              totalExpense += totalExpenseForUser;

              const info = {
                id: element._id,
                expenses,
                profile_picture: element.profilePicture,
                totalExpenseForUser,
                lenderName: element.name,
              };
              youOweInfo.push(info);
            });
          }
          this.setState({
            owesList: youOweInfo || [],
            errorMsg: '',
          });
        }
        return totalExpense;
      })
      .then((totalExpense) => {
        this.setState({
          youOwe: totalExpense,
        });
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
        let totalExpense = 0;
        if (response.status === 200) {
          const youAreOwedInfo = [];
          if (response.data.result && response.data.result.length > 0) {
            const expenseInfo = response.data.result[0];
            const userInfo = response.data.result[1];

            userInfo.forEach((element) => {
              const expenses = expenseInfo.filter(
                (item) => item.borrowerId === element._id
              );

              let totalExpenseForUser = 0;
              expenses.forEach((expense) => {
                totalExpenseForUser += expense.expenseAmount;
              });
              totalExpense += totalExpenseForUser;

              const info = {
                id: element._id,
                expenses,
                profile_picture: element.profilePicture,
                totalExpenseForUser,
                borrowerName: element.name,
              };
              youAreOwedInfo.push(info);
            });
          }
          this.setState({
            owedList: youAreOwedInfo || [],
            errorMsg: '',
          });
        }
        return totalExpense;
      })
      .then((totalExpense) => {
        this.setState({
          youAreOwed: totalExpense,
        });
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
        }
        return response.data.result;
      })
      .then((settledGroups) => this.recordTransaction(settledGroups))
      .then(() => {
        this.refreshDashboard();
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

  refreshDashboard() {
    // this.getDashboardInfo();
    this.getBorrowedFromInfo();
    this.getLendedToInfo();
  }

  recordTransaction(settledGroups) {
    const { selectedUserName } = this.state;

    Object.entries(settledGroups).forEach(([key, value]) => {
      const data = {
        userId: UserAuth.getUserId(),
        userName: UserAuth.getName(),
        groupId: key,
        groupName: value,
        description: ` settled up with ${selectedUserName} in group "${value}".`,
        type: TransactionType.SettleUp,
      };
      axios.post(`${config.server.url}/api/transactions/transaction`, data);
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
                                  alt={item.lenderName}
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
                                  {item.lenderName}
                                </div>
                                <div className={classes.youOweDescriptiveText}>
                                  you owe{' '}
                                  {numeral(item.totalExpenseForUser).format(
                                    '$0.00'
                                  )}{' '}
                                </div>
                              </Col>
                            </Row>

                            <Row>
                              <ul
                                style={{
                                  marginLeft: '5rem',
                                  fontSize: 'small',
                                }}
                              >
                                {item.expenses.map((individualExpense) => (
                                  <li>
                                    <span
                                      className={classes.youOweDescriptiveText}
                                    >
                                      {numeral(
                                        individualExpense.expenseAmount
                                      ).format('$0.00')}
                                    </span>{' '}
                                    for &quot;{individualExpense.expenseName}
                                    &quot;.
                                  </li>
                                ))}
                              </ul>
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
                                  alt={item.borrowerName}
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
                                  {item.borrowerName}
                                </div>
                                <div
                                  className={classes.youAreOwedDescriptiveText}
                                >
                                  owes you{' '}
                                  {numeral(item.totalExpenseForUser).format(
                                    '$0.00'
                                  )}
                                </div>
                              </Col>
                            </Row>

                            <Row>
                              <ul
                                style={{
                                  marginLeft: '5rem',
                                  fontSize: 'small',
                                }}
                              >
                                {item.expenses.map((individualExpense) => (
                                  <li>
                                    <span
                                      className={
                                        classes.youAreOwedDescriptiveText
                                      }
                                    >
                                      {numeral(
                                        individualExpense.expenseAmount
                                      ).format('$0.00')}
                                    </span>{' '}
                                    for &quot;{individualExpense.expenseName}
                                    &quot;.
                                  </li>
                                ))}
                              </ul>
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
                  getOptionLabel={(option) => option.borrowerName}
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
