import React, { Component } from 'react';
import { Alert, Col, Container, Form, Row } from 'react-bootstrap';
import axios from 'axios';
import FormData from 'form-data';
import { connect } from 'react-redux';

import { setUserProfile, setAlertMessage } from '../redux-store/actions/index';
import Navigation from '../components/navigation';
import UserAuth from '../shared/user-auth';
import config from '../shared/config';
import ImageUpload from '../shared/image-upload';
import defaultAvatar from '../images/default-avatar.png';
import AlertType from '../enums/alert-type';

class Profile extends Component {
  constructor() {
    super();
    this.state = {
      profilePicture: null,
      name: '',
      emailId: '',
      phoneNo: '',
      defaultCurrency: '',
      timeZone: '',
      language: '',
    };

    this.imageHandler = this.imageHandler.bind(this);
    this.inputChangeHandler = this.inputChangeHandler.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
  }

  componentDidMount() {
    axios
      .get(`${config.server.url}/api/users/profile`, {
        params: {
          id: UserAuth.getUserId(),
        },
      })
      .then((response) => {
        if (response.status === 200) {
          const data = response.data.result;
          this.setState({
            profilePicture: data.profilePicture,
            name: data.name,
            emailId: data.emailId,
            phoneNo: data.phoneNo ? data.phoneNo : '',
            defaultCurrency: data.defaultCurrency
              ? data.defaultCurrency
              : 'USD',
            timeZone: data.timeZone ? data.timeZone : '-08:00',
            language: data.language ? data.language : 'English',
          });
        }
      })
      .catch((err) => {
        if (err.response.status === 404) {
          const alert = {
            type: AlertType.Error,
            message: err.response.data.message,
          };
          this.props.setAlertMessage(alert);
        }
      });
  }

  componentWillUnmount() {
    const alert = {
      type: '',
      message: '',
    };
    this.props.setAlertMessage(alert);
  }

  onSaveClick(e) {
    e.preventDefault();
    const {
      profilePicture,
      name,
      emailId,
      phoneNo,
      defaultCurrency,
      timeZone,
      language,
    } = this.state;
    const formData = new FormData();
    formData.append('id', UserAuth.getUserId());
    formData.append('profilePicture', profilePicture);
    formData.append('name', name.valueOf());
    formData.append('emailId', emailId.valueOf());
    formData.append('phoneNo', phoneNo.valueOf());
    formData.append('defaultCurrency', defaultCurrency.valueOf());
    formData.append('timeZone', timeZone.valueOf());
    formData.append('language', language.valueOf());

    axios
      .post(`${config.server.url}/api/users/profile`, formData)
      .then((response) => {
        if (response.status === 200) {
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
          const alert = {
            type: AlertType.Success,
            message: response.data.message,
          };
          this.props.setUserProfile(user);
          this.props.setAlertMessage(alert);
        }
        return response.data.result;
      })
      .catch((err) => {
        if (err.response.status === 500 || err.response.status === 422) {
          const alert = {
            type: AlertType.Error,
            message: err.response.data.message,
          };
          this.props.setAlertMessage(alert);
        }
      });
  }

  imageHandler(e) {
    this.setState({ profilePicture: e.file });
  }

  inputChangeHandler(e) {
    const { name } = e.target;
    console.log(e);
    this.setState({
      [name]: e.target.value,
    });
  }

  render() {
    const formInfo = this.state;
    return (
      <div>
        <Navigation />

        {this.props.alert &&
          this.props.alert.message &&
          this.props.alert.type === AlertType.Error && (
            <Alert variant="danger" style={{ margin: '1rem' }}>
              {this.props.alert.message}
            </Alert>
          )}
        {this.props.alert &&
          this.props.alert.message &&
          this.props.alert.type === AlertType.Success && (
            <Alert variant="success" style={{ margin: '1rem' }}>
              {this.props.alert.message}
            </Alert>
          )}

        <div className="container" style={{ marginTop: '5rem' }}>
          <h2>Your account</h2>
          <Form onSubmit={this.onSaveClick}>
            <Container>
              <Row>
                <Col>
                  <div>
                    <ImageUpload
                      id="image"
                      defImgSrc={defaultAvatar}
                      value={formInfo.profilePicture}
                      onInput={(e) => this.imageHandler(e)}
                    />
                  </div>
                </Col>
                <Col>
                  <Form.Group controlId="formGroupEmail">
                    <Form.Label>Your name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter name"
                      value={formInfo.name}
                      onChange={this.inputChangeHandler}
                    />
                  </Form.Group>
                  <Form.Group controlId="formGroupEmail">
                    <Form.Label>Your email address</Form.Label>
                    <Form.Control
                      type="email"
                      name="emailId"
                      placeholder="Enter email address"
                      value={formInfo.emailId}
                      onChange={this.inputChangeHandler}
                    />
                  </Form.Group>
                  <Form.Group controlId="formGroupEmail">
                    <Form.Label>Your phone number</Form.Label>
                    <Form.Control
                      type="text"
                      name="phoneNo"
                      placeholder="Enter phone number"
                      value={formInfo.phoneNo}
                      onChange={this.inputChangeHandler}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="formGroupPassword">
                    <Form.Label>Your default currency</Form.Label>
                    <Form.Control
                      as="select"
                      name="defaultCurrency"
                      value={formInfo.defaultCurrency}
                      onChange={this.inputChangeHandler}
                    >
                      <option value="USD">USD</option>
                      <option value="KWD">KWD</option>
                      <option value="BHD">BHD</option>
                      <option value="GBP">GBP</option>
                      <option value="EUR">EUR</option>
                      <option value="CAD">CAD</option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group controlId="formGroupPassword">
                    <Form.Label>Your time zone</Form.Label>
                    <Form.Control
                      as="select"
                      name="timeZone"
                      value={formInfo.timeZone}
                      onChange={this.inputChangeHandler}
                    >
                      <option value="-12:00">
                        (GMT -12:00) Eniwetok, Kwajalein
                      </option>
                      <option value="-11:00">
                        (GMT -11:00) Midway Island, Samoa
                      </option>
                      <option value="-10:00">(GMT -10:00) Hawaii</option>
                      <option value="-09:50">(GMT -9:30) Taiohae</option>
                      <option value="-09:00">(GMT -9:00) Alaska</option>
                      <option value="-08:00" selected>
                        (GMT -8:00) Pacific Time (US &amp; Canada)
                      </option>
                      <option value="-07:00">
                        (GMT -7:00) Mountain Time (US &amp; Canada)
                      </option>
                      <option value="-06:00">
                        (GMT -6:00) Central Time (US &amp; Canada), Mexico City
                      </option>
                      <option value="-05:00">
                        (GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima
                      </option>
                      <option value="-04:50">(GMT -4:30) Caracas</option>
                      <option value="-04:00">
                        (GMT -4:00) Atlantic Time (Canada), Caracas, La Paz
                      </option>
                      <option value="-03:50">(GMT -3:30) Newfoundland</option>
                      <option value="-03:00">
                        (GMT -3:00) Brazil, Buenos Aires, Georgetown
                      </option>
                      <option value="-02:00">(GMT -2:00) Mid-Atlantic</option>
                      <option value="-01:00">
                        (GMT -1:00) Azores, Cape Verde Islands
                      </option>
                      <option value="+00:00">
                        (GMT) Western Europe Time, London, Lisbon, Casablanca
                      </option>
                      <option value="+01:00">
                        (GMT +1:00) Brussels, Copenhagen, Madrid, Paris
                      </option>
                      <option value="+02:00">
                        (GMT +2:00) Kaliningrad, South Africa
                      </option>
                      <option value="+03:00">
                        (GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg
                      </option>
                      <option value="+03:50">(GMT +3:30) Tehran</option>
                      <option value="+04:00">
                        (GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi
                      </option>
                      <option value="+04:50">(GMT +4:30) Kabul</option>
                      <option value="+05:00">
                        (GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent
                      </option>
                      <option value="+05:50">
                        (GMT +5:30) Bombay, Calcutta, Madras, New Delhi
                      </option>
                      <option value="+05:75">
                        (GMT +5:45) Kathmandu, Pokhara
                      </option>
                      <option value="+06:00">
                        (GMT +6:00) Almaty, Dhaka, Colombo
                      </option>
                      <option value="+06:50">
                        (GMT +6:30) Yangon, Mandalay
                      </option>
                      <option value="+07:00">
                        (GMT +7:00) Bangkok, Hanoi, Jakarta
                      </option>
                      <option value="+08:00">
                        (GMT +8:00) Beijing, Perth, Singapore, Hong Kong
                      </option>
                      <option value="+08:75">(GMT +8:45) Eucla</option>
                      <option value="+09:00">
                        (GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk
                      </option>
                      <option value="+09:50">
                        (GMT +9:30) Adelaide, Darwin
                      </option>
                      <option value="+10:00">
                        (GMT +10:00) Eastern Australia, Guam, Vladivostok
                      </option>
                      <option value="+10:50">
                        (GMT +10:30) Lord Howe Island
                      </option>
                      <option value="+11:00">
                        (GMT +11:00) Magadan, Solomon Islands, New Caledonia
                      </option>
                      <option value="+11:50">
                        (GMT +11:30) Norfolk Island
                      </option>
                      <option value="+12:00">
                        (GMT +12:00) Auckland, Wellington, Fiji, Kamchatka
                      </option>
                      <option value="+12:75">
                        (GMT +12:45) Chatham Islands
                      </option>
                      <option value="+13:00">
                        (GMT +13:00) Apia, Nukualofa
                      </option>
                      <option value="+14:00">
                        (GMT +14:00) Line Islands, Tokelau
                      </option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group controlId="formGroupPassword">
                    <Form.Label>Language</Form.Label>
                    <Form.Control
                      as="select"
                      name="language"
                      value={formInfo.language}
                      onChange={this.inputChangeHandler}
                    >
                      <option value="English">English</option>
                      <option value="French">French</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Italian">Italian</option>
                      <option value="Hebrew">Hebrew</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
              <Row style={{ float: 'right' }}>
                <button type="submit" className="btn btn-large btn-orange">
                  Save
                </button>
              </Row>
            </Container>
          </Form>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    profilePicture: state.profilePicture,
    isAuthenticated: state.isAuthenticated,
    alert: state.alert,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setUserProfile: (profile) => dispatch(setUserProfile(profile)),
    setAlertMessage: (alert) => dispatch(setAlertMessage(alert)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
