import React, { Component } from 'react';
import { Col, Container, Row, Card, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { withStyles } from '@material-ui/styles';
import TablePagination from '@material-ui/core/TablePagination';
import NativeSelect from '@material-ui/core/NativeSelect';

import Navigation from '../components/navigation';
import DashboardMenu from '../components/dashboard-menu';
import '../shared/styles.css';
import UserAuth from '../shared/user-auth';
import config from '../shared/config';
import settleAvatar from '../images/settle.png';
import groupAvatar from '../images/group.png';
import expenseAvatar from '../images/expense.png';
import TransactionType from '../enums/transaction-type';

const styles = () => ({
  root: {
    width: '100%',
  },
  row: {
    borderRadius: '0',
  },
  timestamp: {
    fontSize: '13px',
    fontWeight: '400',
    color: '#999',
    padding: '0rem 0.5rem',
  },
  description: {
    fontSize: '16px',
    fontWeight: '400',
    color: '#999',
    width: '100%',
    padding: '0rem 0.5rem',
  },
});

class Activity extends Component {
  constructor() {
    super();
    this.state = {
      paginatedActivities: [],
      activities: [],
      rowsPerPage: 2,
      page: 0,
      groups: [],
    };
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.onChangeSortOrder = this.onChangeSortOrder.bind(this);
    this.renderGroupOptions = this.renderGroupOptions.bind(this);
    this.onChangeGroup = this.onChangeGroup.bind(this);
  }

  componentDidMount() {
    this.getRecentActivity();
    this.getMyGroups();
  }

  handleChangeRowsPerPage(event) {
    const newRowsPerPage = event.target.value;
    this.setState(
      {
        page: 0,
        rowsPerPage: newRowsPerPage,
      },
      () => {
        this.paginateAllActivities();
      }
    );
  }

  handleChangePage(event, newPage) {
    this.setState({
      page: newPage,
    });
  }

  onChangeSortOrder(event) {
    const sortOrder = event.target.value;
    const { activities } = this.state;
    if (sortOrder === 'desc') {
      const sortedActivities = activities
        .slice()
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      this.setState(
        {
          activities: sortedActivities,
        },
        () => {
          this.paginateAllActivities();
        }
      );
    }
    if (sortOrder === 'asc') {
      const sortedActivities = activities
        .slice()
        .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));

      this.setState(
        {
          activities: sortedActivities,
        },
        () => {
          this.paginateAllActivities();
        }
      );
    }
  }

  onChangeGroup(event) {
    const selectedGroupId = event.target.value;
    if (selectedGroupId !== 'default') {
      const { activities } = this.state;
      const selectedGroupActivities = activities.filter(
        (activity) => activity.groupId === selectedGroupId
      );
      this.setState(
        {
          activities: selectedGroupActivities,
        },
        () => this.paginateAllActivities
      );
    } else {
      this.getRecentActivity();
    }
  }

  getRecentActivity() {
    axios
      .get(`${config.server.url}/api/transactions/transaction`, {
        params: {
          userId: UserAuth.getUserId(),
        },
      })
      .then((response) => {
        if (response.status === 200) {
          this.setState({
            activities: [...response.data.result],
          });
        }
      })
      .then(() => {
        this.paginateAllActivities();
      })
      .catch((err) => {
        if (err) {
          console.log(err);
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
          if (res.data.result) {
            const onlyAcceptedGroups = Array.from(res.data.result).filter(
              (item) =>
                item.members && item.members.includes(UserAuth.getUserId())
            );

            this.setState({ groups: [...onlyAcceptedGroups] });
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  paginateAllActivities() {
    const { activities, rowsPerPage } = this.state;
    const noOfPages = Math.ceil(activities.length / rowsPerPage);
    const paginatedActivities = [];
    let startIndex = 0;
    let endIndex = rowsPerPage;
    for (let i = 0; i < noOfPages; i += 1) {
      paginatedActivities.push(activities.slice(startIndex, endIndex));
      startIndex += rowsPerPage;
      endIndex += rowsPerPage;
    }
    this.setState({
      paginatedActivities,
    });
  }

  renderGroupOptions() {
    const { groups } = this.state;

    return groups.map((group, i) => (
      <option key={i} value={group._id}>
        {group.name}
      </option>
    ));
  }

  render() {
    const { activities, paginatedActivities, rowsPerPage, page } = this.state;
    const { classes } = this.props;
    return (
      <div>
        <Navigation />

        <div className="container">
          <DashboardMenu selectedLink="activity" />
          <Container>
            <div id="center_column" style={{ width: '80%', float: 'right' }}>
              <div className="activity header">
                <div className="topbar">
                  <h2>Recent activity</h2>
                </div>
                <div>
                  <NativeSelect
                    defaultValue="desc"
                    onChange={this.onChangeSortOrder}
                    style={{ float: 'left', marginTop: '0.5rem' }}
                  >
                    <option value="desc">Most Recent First</option>
                    <option value="asc">Most Recent Last</option>
                  </NativeSelect>

                  <NativeSelect
                    defaultValue="default"
                    onChange={this.onChangeGroup}
                    style={{
                      float: 'left',
                      marginTop: '0.5rem',
                      marginLeft: '1rem',
                    }}
                  >
                    <option value="default">Select Group</option>
                    {this.renderGroupOptions()}
                  </NativeSelect>

                  <TablePagination
                    component="div"
                    count={activities.length}
                    page={page}
                    rowsPerPageOptions={[2, 5, 10]}
                    rowsPerPage={rowsPerPage}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  />
                </div>

                {(!paginatedActivities || paginatedActivities.length === 0) && (
                  <em>No recent activities.</em>
                )}
                {paginatedActivities.length > 0 &&
                  paginatedActivities[page].map((item) => (
                    <Card className={classes.row}>
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <Row>
                            <Col xs="2">
                              {item.type === TransactionType.AddExpense && (
                                <img
                                  alt={item.userName}
                                  src={expenseAvatar}
                                  style={{ width: '4rem' }}
                                />
                              )}
                              {item.type === TransactionType.CreateGroup && (
                                <img
                                  alt={item.userName}
                                  src={groupAvatar}
                                  style={{ width: '4rem' }}
                                />
                              )}
                              {item.type === TransactionType.SettleUp && (
                                <img
                                  alt={item.userName}
                                  src={settleAvatar}
                                  style={{ width: '4rem' }}
                                />
                              )}
                            </Col>
                            <Col>
                              {item.userId === UserAuth.getUserId() && (
                                <div className={classes.description}>
                                  You{item.description}
                                </div>
                              )}
                              {item.userId !== UserAuth.getUserId() && (
                                <div className={classes.description}>
                                  {item.userName}
                                  {item.description}
                                </div>
                              )}
                              <br />
                              <div className={classes.timestamp}>
                                {new Date(item.updatedAt).toLocaleString(
                                  'default',
                                  {
                                    month: 'short',
                                  }
                                )}{' '}
                                {new Date(item.updatedAt).getDate()}
                              </div>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card>
                  ))}
              </div>
            </div>
          </Container>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Activity);
