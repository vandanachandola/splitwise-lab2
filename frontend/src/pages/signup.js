import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Form, Alert, Col, Container, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import axios from 'axios';
import swal from 'sweetalert';

import { setAlertMessage, setCurrentUser } from '../redux-store/actions';
import NavigationWhite from '../components/navigation-white';
import logo from '../images/default-group-logo.svg';
import FormErrors from '../shared/form-errors';
import AlertType from '../enums/alert-type';
import config from '../shared/config';
import '../shared/styles.css';

class Signup extends Component {
  constructor() {
    super();
    this.state = {
      name: '',
      emailId: '',
      password: '',
      isVisible: false,
      formErrors: { name: '', emailId: '', password: '' },
      isNameValid: false,
      isEmailIdValid: false,
      isPasswordValid: false,
      isFormValid: false,
    };

    this.nameChangeHandler = this.nameChangeHandler.bind(this);
    this.inputChangeHandler = this.inputChangeHandler.bind(this);
    this.onSignupClick = this.onSignupClick.bind(this);
  }

  componentWillUnmount() {
    const alert = {
      type: '',
      message: '',
    };
    this.props.setAlertMessage(alert);
  }

  onSignupClick(e) {
    e.preventDefault();
    const { emailId, name, password } = this.state;
    const data = {
      emailId,
      password,
      name,
    };

    axios
      .post(`${config.server.url}/api/users/signup`, data)
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          swal({
            title: 'Congrats!',
            text: response.data.message,
            icon: 'success',
            button: false,
            timer: 1000,
          }).then(() => {
            const user = {
              id: response.data.result._id,
              emailId: response.data.result.emailId,
              name: response.data.result.name,
              token: response.data.token,
            };
            const alert = {
              type: AlertType.Success,
              message: response.data.message.message,
            };
            this.props.setCurrentUser(user);
            this.props.setAlertMessage(alert);
          });
        }
      })
      .catch((err) => {
        if (err.response.status === 401 || err.response.status === 404) {
          const alert = {
            type: AlertType.Error,
            message: err.response.data.message.message,
          };
          this.props.setAlertMessage(alert);
        }
      });
  }

  validateField(fieldName, value) {
    const { formErrors } = this.state;
    let { isNameValid, isEmailIdValid, isPasswordValid } = this.state;

    switch (fieldName) {
      case 'name':
        isNameValid = value.match(/^[a-z ,.'-]+$/i);
        formErrors.name = isNameValid ? '' : 'Enter a valid name.';
        break;
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
      { formErrors, isNameValid, isEmailIdValid, isPasswordValid },
      this.validateForm
    );
  }

  validateForm() {
    const { isNameValid, isEmailIdValid, isPasswordValid } = this.state;
    this.setState({
      isFormValid: isNameValid && isEmailIdValid && isPasswordValid,
    });
  }

  nameChangeHandler(e) {
    this.setState(
      {
        name: e.target.value,
        isVisible: true,
      },
      () => {
        this.validateField(e.target.name, e.target.value);
      }
    );
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
    const { isVisible } = this.state;
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
                    INTRODUCE YOURSELF
                  </span>

                  <Form
                    onSubmit={this.onSignupClick}
                    style={{ marginTop: '1rem' }}
                  >
                    <Form.Group controlId="formBasicName">
                      <Form.Label>
                        <span style={{ fontWeight: '400', fontSize: '24px' }}>
                          Hi there! My name is
                        </span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        onChange={this.nameChangeHandler}
                      />
                      <FormErrors formErrors={formErrors} currentField="name" />
                    </Form.Group>
                    {isVisible && (
                      <div>
                        <Form.Group controlId="formBasicEmail">
                          <Form.Label>
                            Here&#39;s my <strong>email address:</strong>
                          </Form.Label>
                          <Form.Control
                            type="email"
                            name="emailId"
                            onChange={this.inputChangeHandler}
                          />
                          <FormErrors
                            formErrors={formErrors}
                            currentField="emailId"
                          />
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword">
                          <Form.Label>
                            And here&#39;s my <strong>password:</strong>
                          </Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            onChange={this.inputChangeHandler}
                          />
                          <FormErrors
                            formErrors={formErrors}
                            currentField="password"
                          />
                        </Form.Group>
                      </div>
                    )}
                    <button
                      disabled={!isFormValid}
                      className="btn btn-large btn-orange"
                      variant="primary"
                      type="submit"
                    >
                      Sign me up!
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
    signupUser: (user) => dispatch(signupUser(user)),
    setCurrentUser: (user) => dispatch(setCurrentUser(user)),
    setAlertMessage: (alert) => dispatch(setAlertMessage(alert)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
