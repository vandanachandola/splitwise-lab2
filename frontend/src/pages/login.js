import React, { Component } from 'react';
import { Form, Alert, Container, Row, Col } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';

import {
  setCurrentUser,
  setAlertMessage,
  setUserProfile,
} from '../redux-store/actions/index';
import NavigationWhite from '../components/navigation-white';

import logo from '../images/default-group-logo.svg';
import FormErrors from '../shared/form-errors';
import config from '../shared/config';
import '../shared/styles.css';
import AlertType from '../enums/alert-type';
import UserAuth from '../shared/user-auth';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      emailId: '',
      password: '',
      formErrors: { emailId: '', password: '' },
      isEmailIdValid: false,
      isPasswordValid: false,
      isFormValid: false,
    };

    this.inputChangeHandler = this.inputChangeHandler.bind(this);
    this.onLoginClick = this.onLoginClick.bind(this);
  }

  componentWillUnmount() {
    const alert = {
      type: '',
      message: '',
    };
    this.props.setAlertMessage(alert);
  }

  onLoginClick(e) {
    e.preventDefault();
    const { emailId, password } = this.state;
    const data = {
      emailId,
      password,
    };
    axios
      .post(`${config.server.url}/api/users/login`, data)
      .then((response) => {
        if (response.status === 200) {
          if (response.data.result) {
            const user = {
              id: response.data.result._id,
              emailId: response.data.result.emailId,
              name: response.data.result.name,
              token: response.data.token,
            };
            this.props.setCurrentUser(user);
          } else {
            const alert = {
              type: AlertType.Error,
              message: response.data.message,
            };
            this.props.setAlertMessage(alert);
          }
        }
      })
      .then(() => this.getUser())
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

  getUser() {
    const userId = UserAuth.getUserId();
    axios
      .get(`${config.server.url}/api/users/get-user`, {
        params: { userId },
      })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.result) {
            const user = {
              id: response.data.result._id,
              profilePicture: response.data.result.profilePicture,
              emailId: response.data.result.emailId,
              name: response.data.result.name,
              phoneNo: response.data.result.phoneNo,
              defaultCurrency: response.data.result.defaultCurrency,
              timeZone: response.data.result.timeZone,
              language: response.data.result.language,
            };
            this.props.setUserProfile(user);
          } else {
            const alert = {
              type: AlertType.Error,
              message: response.data.message,
            };
            this.props.setAlertMessage(alert);
          }
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

  validateField(fieldName, value) {
    const { formErrors } = this.state;
    let { isEmailIdValid, isPasswordValid } = this.state;

    switch (fieldName) {
      case 'emailId':
        isEmailIdValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        formErrors.emailId = isEmailIdValid
          ? ''
          : 'Enter a valid email address.';
        break;
      case 'password':
        isPasswordValid = value.length >= 6 && value.length < 15;
        formErrors.password = isPasswordValid
          ? ''
          : 'Sorry, that password is invalid. Min length is 6 and max length is 15.';
        break;
      default:
        break;
    }
    this.setState(
      { formErrors, isEmailIdValid, isPasswordValid },
      this.validateForm
    );
  }

  validateForm() {
    const { isEmailIdValid, isPasswordValid } = this.state;
    this.setState({ isFormValid: isEmailIdValid && isPasswordValid });
  }

  inputChangeHandler(e) {
    const { name } = e.target;
    this.setState(
      {
        [name]: e.target.value,
      },
      () => {
        this.validateField(e.target.name, e.target.value);
      }
    );
  }

  render() {
    let redirectNode = null;
    if (this.props.isAuthenticated) {
      redirectNode = <Redirect to="/dashboard" />;
    }
    const { formErrors, isFormValid } = this.state;

    return (
      <div>
        <NavigationWhite />

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

        <div
          className="container"
          style={{
            position: 'fixed',
            left: '50%',
            transform: 'translate(-50%,0%)',
            padding: '2rem',
            marginTop: '5rem',
          }}
        >
          <div>
            {redirectNode}
            <Container>
              <Row>
                <div>
                  <img
                    src={logo}
                    alt="logo"
                    style={{ width: '200px', float: 'right' }}
                  />
                </div>
                <Col style={{ width: 'auto' }}>
                  <span style={{ color: '#999', fontWeight: '500' }}>
                    WELCOME TO SPLITWISE
                  </span>

                  <Form
                    onSubmit={this.onLoginClick}
                    style={{ marginTop: '1rem' }}
                  >
                    <Form.Group controlId="formBasicEmail">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        name="emailId"
                        onChange={this.inputChangeHandler}
                        placeholder="Enter email"
                      />
                      <FormErrors
                        formErrors={formErrors}
                        currentField="emailId"
                      />
                    </Form.Group>

                    <Form.Group controlId="formBasicPassword">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        onChange={this.inputChangeHandler}
                        placeholder="Password"
                      />
                      <FormErrors
                        formErrors={formErrors}
                        currentField="password"
                      />
                    </Form.Group>
                    <button
                      disabled={!isFormValid}
                      className="btn btn-large btn-orange"
                      variant="primary"
                      type="submit"
                    >
                      Log in
                    </button>
                  </Form>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.isAuthenticated,
    alert: state.alert,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setCurrentUser: (user) => dispatch(setCurrentUser(user)),
    setAlertMessage: (alert) => dispatch(setAlertMessage(alert)),
    setUserProfile: (profile) => dispatch(setUserProfile(profile)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
