import React, { Component } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  ListGroup,
  Modal,
  Row,
} from 'react-bootstrap';
import axios from 'axios';
import { withStyles } from '@material-ui/styles';
import numeral from 'numeral';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import swal from 'sweetalert';

import Navigation from '../components/navigation';
import DashboardMenu from '../components/dashboard-menu';
import '../shared/styles.css';
import config from '../shared/config';
import UserAuth from '../shared/user-auth';
import itemImg from '../images/item.png';
import TransactionType from '../enums/transaction-type';

const styles = () => ({
  root: {
    width: '100%',
  },
  row: {
    borderRadius: '0',
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
    fontSize: '12px',
    fontWeight: '400',
    color: '#999',
    textAlign: 'right',
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
  redirect: {
    textDecoration: 'none',
    color: '#999',
    '&:hover': {
      color: 'black',
      textDecoration: 'none',
    },
  },
});

class Group extends Component {
  constructor(props) {
    super(props);
    console.log('Props:', props);
    this.state = {
      description: '',
      expense: 0,
      expenses: [],
      showExpenseModal: false,
      showExpenseDetails: false,
      activeExpense: {},
      errorMsg: '',
      groupId: props.match.params.id,
      groupName: '',
      self: UserAuth.getName(),
      selectedLink: `group_${props.match.params.id}`,
      comment: '',
      allComments: [],
    };

    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.descriptionChange = this.descriptionChange.bind(this);
    this.expenseChange = this.expenseChange.bind(this);
    this.closeExpenseDetails = this.closeExpenseDetails.bind(this);
    this.onExpenseLinkClick = this.onExpenseLinkClick.bind(this);
    this.postComment = this.postComment.bind(this);
    this.inputChangeHandler = this.inputChangeHandler.bind(this);
    this.getComments = this.getComments.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
  }

  componentDidMount() {
    this.getGroupInfo();
    this.getExpenseInfo();
  }

  handleOpen() {
    this.setState({
      showExpenseModal: true,
      description: '',
      expense: 0,
    });
  }

  handleClose() {
    this.setState({
      showExpenseModal: false,
    });
  }

  onExpenseLinkClick(e, expense) {
    this.setState(
      {
        showExpenseDetails: true,
        activeExpense: expense,
      },
      () => {
        this.getComments();
      }
    );
  }

  getExpenseInfo() {
    const { groupId } = this.state;
    axios
      .get(`${config.server.url}/api/groups/expenses`, {
        params: {
          userId: UserAuth.getUserId(),
          groupId,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            expenses: [...response.data.result],
            successMsg: '',
            errorMsg: '',
          });
        }
      })
      .catch((err) => {
        if (err.response.status === 500) {
          this.setState({
            errorMsg: err.response.data.message,
          });
        }
      });
  }

  getGroupInfo() {
    const { groupId } = this.state;
    axios
      .get(`${config.server.url}/api/groups/group-info`, {
        params: {
          groupId,
        },
      })
      .then((resp) => {
        this.setState({
          groupName: resp.data.result ? resp.data.result.name : '',
        });
      });
  }

  getComments() {
    const { activeExpense } = this.state;
    axios
      .get(`${config.server.url}/api/groups/get-comments`, {
        params: { expenseId: activeExpense._id },
      })
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            allComments:
              res.data.result && res.data.result.length > 0
                ? [...res.data.result[0]]
                : [],
          });
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

  closeExpenseDetails() {
    this.setState({
      showExpenseDetails: false,
    });
  }

  descriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  expenseChange(e) {
    this.setState({ expense: e.target.value });
  }

  recordTransaction(response) {
    const { groupId, groupName } = this.state;
    const expense = numeral(response.totalExpense).format('$0.00');
    const data = {
      userId: UserAuth.getUserId(),
      groupId,
      userName: UserAuth.getName(),
      groupName,
      description: ` paid ${expense} for '${response.description}' in "${groupName}".`,
      type: TransactionType.AddExpense,
    };
    axios.post(`${config.server.url}/api/transactions/transaction`, data);
  }

  addAnExpense(description, expense) {
    const { groupId, groupName } = this.state;
    axios
      .post(`${config.server.url}/api/groups/new-expense`, {
        lenderId: UserAuth.getUserId(),
        groupId,
        groupName,
        description,
        totalExpense: expense,
        lenderName: UserAuth.getName(),
      })
      .then((response) => {
        if (response.status === 200) {
          console.log(response);
          this.setState({
            successMsg: response.data.message,
            errorMsg: '',
          });
        }
        return response.data.result;
      })
      .then((response) => {
        if (response) {
          this.recordTransaction(response);
        }
      })
      .then(() => {
        this.handleClose();
      })
      .then(() => {
        this.getExpenseInfo();
      })
      .catch((err) => {
        if (err.response.status === 500) {
          this.setState({
            successMsg: '',
            errorMsg: err.response.data.message,
          });
        }
      });
  }

  postComment(comment) {
    const { activeExpense } = this.state;
    this.setState({
      comment: '',
    });
    axios
      .post(`${config.server.url}/api/groups/post-comment`, {
        expenseId: activeExpense._id,
        userId: UserAuth.getUserId(),
        userName: UserAuth.getName(),
        text: comment,
      })
      .then((response) => {
        if (response.status === 200) {
          // response.data.result ?
          this.setState({
            successMsg: response.data.message,
            errorMsg: '',
          });
        }
        return response.data.result;
      })
      .then(() => this.getComments())
      .then(() =>
        this.setState({
          comment: '',
        })
      )
      .catch((err) => {
        if (err.response.status === 500) {
          this.setState({
            successMsg: '',
            errorMsg: err.response.data.message,
          });
        }
      });
  }

  inputChangeHandler(e) {
    const { name } = e.target;
    this.setState({
      [name]: e.target.value,
    });
  }

  deleteComment(comment) {
    swal({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this comment!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        const { activeExpense } = this.state;
        const expenseId = activeExpense._id;
        const commentId = comment._id;
        axios
          .post(`${config.server.url}/api/groups/delete-comment`, {
            expenseId,
            commentId,
          })
          .then((response) => {
            if (response.status === 200) {
              this.setState({
                successMsg: response.data.message,
                errorMsg: '',
              });
            }
            return response.data.result;
          })
          .then(() => this.getComments())
          .catch((err) => {
            if (err.response.status === 500) {
              this.setState({
                successMsg: '',
                errorMsg: err.response.data.message,
              });
            }
          });
      }
    });
  }

  render() {
    const {
      expenses,
      description,
      expense,
      showExpenseModal,
      showExpenseDetails,
      activeExpense,
      successMsg,
      errorMsg,
      groupName,
      self,
      selectedLink,
      comment,
      allComments,
    } = this.state;
    const { classes } = this.props;
    return (
      <div>
        <Navigation />

        {errorMsg && errorMsg.length > 0 && (
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
          <DashboardMenu selectedLink={selectedLink} />
          <Container style={{ border: '1px solid #ddd' }}>
            <div id="center_column" style={{ width: '80%', float: 'right' }}>
              <div className="dashboard header">
                <div className="topbar" style={{ height: '70px' }}>
                  <h2>{groupName}</h2>
                  <div className="actions">
                    <a
                      className="btn btn-large btn-mint"
                      data-toggle="modal"
                      href="#add_an_expense_form"
                      onClick={this.handleOpen}
                    >
                      Add an expense
                    </a>
                  </div>
                </div>
                <Row>
                  <Col>
                    {!expenses ||
                      (expenses.length === 0 && <em>No expenses to show.</em>)}
                    {expenses.map((item) => (
                      <Card className={classes.row}>
                        <ListGroup variant="flush">
                          <ListGroup.Item>
                            <Row
                              className={classes.redirect}
                              onClick={(e) => this.onExpenseLinkClick(e, item)}
                            >
                              <Col sm={1}>
                                <div className={classes.month}>
                                  {new Date(item.updatedAt).toLocaleString(
                                    'default',
                                    {
                                      month: 'short',
                                    }
                                  )}
                                </div>
                                <div className={classes.date}>
                                  {new Date(item.updatedAt).getDate()}
                                </div>
                              </Col>
                              <Col className={classes.description}>
                                {item.description}
                              </Col>
                              <Col sm={3}>
                                {self === item.lenderName && (
                                  <div className={classes.username}>
                                    you paid
                                  </div>
                                )}
                                {self !== item.lenderName && (
                                  <div className={classes.username}>
                                    {item.lenderName} paid
                                  </div>
                                )}
                                <div className={classes.expense}>
                                  ${item.totalExpense}
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

          {showExpenseModal && (
            <Modal
              show={showExpenseModal}
              onHide={this.handleClose}
              size="md"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Add an expense</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Container>
                  <Row>
                    <Col xs="3">
                      <img
                        src={itemImg}
                        alt="item"
                        style={{
                          width: '5rem',
                          height: '5rem',
                          marginRight: '1rem',
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          onChange={this.descriptionChange}
                          value={description}
                          placeholder="Enter a description"
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Control
                          type="number"
                          onChange={this.expenseChange}
                          value={expense}
                          placeholder="0.00"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Container>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={this.handleClose}>
                  Cancel
                </Button>
                <button
                  type="button"
                  className="btn btn-large btn-mint"
                  variant="secondary"
                  onClick={() => this.addAnExpense(description, expense)}
                >
                  Save
                </button>
              </Modal.Footer>
            </Modal>
          )}

          {showExpenseDetails && (
            <Modal
              show={showExpenseDetails}
              onHide={this.closeExpenseDetails}
              size="lg"
              centered
            >
              <Modal.Header closeButton>
                <img
                  src={itemImg}
                  alt="item"
                  style={{ width: '5rem', height: '5rem', marginRight: '1rem' }}
                />
                <Modal.Title>
                  <h5>{activeExpense.description}</h5>
                  <h6>{numeral(activeExpense.totalExpense).format('$0.00')}</h6>
                  <span style={{ fontSize: '0.75rem' }}>
                    <em>
                      {`Added by ${activeExpense.lenderName}
                      on 
                      ${new Date(activeExpense.updatedAt).toDateString()}`}
                    </em>
                  </span>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <strong>NOTES AND COMMENTS</strong>
                <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  {allComments.map((input) => (
                    <Card>
                      <Card.Body>
                        <Card.Title>
                          <IconButton
                            style={{
                              float: 'right',
                              width: '1.5rem',
                              height: '1.5rem',
                              fontSize: 'small',
                              marginTop: '-1rem',
                              marginRight: '-1rem',
                              display:
                                input.userId === UserAuth.getUserId()
                                  ? 'inline-flex'
                                  : 'none',
                            }}
                            onClick={() => this.deleteComment(input)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Card.Title>
                        <Card.Text>
                          <span>
                            <strong>{input.userName}</strong>
                          </span>
                        </Card.Text>
                        <Card.Text>{input.text}</Card.Text>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
                <div>
                  <textarea
                    name="comment"
                    value={comment}
                    rows="4"
                    style={{ width: '100%' }}
                    placeholder="Add a comment"
                    onChange={this.inputChangeHandler}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <button
                  className="btn btn-large btn-mint"
                  variant="primary"
                  type="button"
                  onClick={() => this.postComment(comment)}
                >
                  Post
                </button>
              </Modal.Footer>
            </Modal>
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Group);
