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

import Navigation from '../components/navigation';
import DashboardMenu from '../components/dashboard-menu';
import '../shared/styles.css';
import config from '../shared/config';
import UserAuth from '../shared/user-auth';

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
});

class Group extends Component {
  constructor(props) {
    super(props);
    console.log('Props:', props);
    this.state = {
      description: '',
      expense: 0,
      expenses: [],
      showModal: false,
      errorMsg: '',
      groupId: props.match.params.id,
      groupName: props.location.state.group.name,
      self: UserAuth.getName(),
      selectedLink: `group_${props.match.params.id}`,
    };

    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.descriptionChange = this.descriptionChange.bind(this);
    this.expenseChange = this.expenseChange.bind(this);
  }

  componentDidMount() {
    // this.getGroupInfo();
    this.getExpenseInfo();
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

  descriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  expenseChange(e) {
    this.setState({ expense: e.target.value });
  }

  recordTransaction(response) {
    const { groupId, groupName } = this.state;
    const expense = numeral(response.expense).format('$0.00');
    const data = {
      userId: UserAuth.getUserId(),
      groupId,
      userName: UserAuth.getName(),
      groupName,
      description: ` paid ${expense} for '${response.description}' in "${groupName}".`,
    };
    axios.post(`${config.server.url}/api/groups/transaction`, data);
  }

  addAnExpense(description, expense) {
    const { groupId } = this.state;
    axios
      .post(`${config.server.url}/api/groups/new-expense`, {
        lenderId: UserAuth.getUserId(),
        groupId,
        description,
        totalExpense: expense,
        lenderName: UserAuth.getName(),
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
      //   .then((response) => {
      //     this.recordTransaction(response);
      //   })
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

  render() {
    const {
      expenses,
      description,
      expense,
      showModal,
      successMsg,
      errorMsg,
      groupId,
      groupName,
      self,
      selectedLink,
    } = this.state;
    const { classes } = this.props;
    console.log(expenses);
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
                            <Row>
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

          {showModal && (
            <Modal
              show={showModal}
              onHide={this.handleClose}
              size="md"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Add an expense</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group>
                  <Form.Label>Description </Form.Label>
                  <Form.Control
                    type="text"
                    onChange={this.descriptionChange}
                    value={description}
                    placeholder="Enter a description"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Expense </Form.Label>
                  <Form.Control
                    type="number"
                    onChange={this.expenseChange}
                    value={expense}
                    placeholder="name input"
                  />
                </Form.Group>
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
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Group);
