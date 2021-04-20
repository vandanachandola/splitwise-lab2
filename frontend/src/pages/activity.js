import React, { Component } from 'react';
import { Container, Row, Card, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { withStyles } from '@material-ui/styles';

import Navigation from '../components/navigation';
import DashboardMenu from '../components/dashboard-menu';
import '../shared/styles.css';
import UserAuth from '../shared/user-auth';
import config from '../shared/config';

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
      activities: [],
    };
  }

  componentDidMount() {
    this.getRecentActivity();
  }

  getRecentActivity() {
    axios
      .get(`${config.server.url}/api/groups/transaction`, {
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
      .catch((err) => {
        if (err.response.status === 500) {
          console.log(err);
        }
      });
  }

  render() {
    const { activities } = this.state;
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
                {!activities ||
                  (activities.length === 0 && <em>No recent activities.</em>)}
                {activities.map((item) => (
                  <Card className={classes.row}>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <Row>
                          {item.user_name === UserAuth.getName() && (
                            <div className={classes.description}>
                              You{item.description}
                            </div>
                          )}
                          {item.user_name !== UserAuth.getName() && (
                            <div className={classes.description}>
                              {item.user_name}
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
