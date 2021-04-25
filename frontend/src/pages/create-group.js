import React, { Component, createRef } from 'react';
import { Alert, Col, Container, Form, Row } from 'react-bootstrap';
import axios from 'axios';
import FormData from 'form-data';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { connect } from 'react-redux';

import Navigation from '../components/navigation';
import UserAuth from '../shared/user-auth';
import config from '../shared/config';
import ImageUpload from '../shared/image-upload';
import defaultGroupLogo from '../images/default-group-logo.svg';
import FormErrors from '../shared/form-errors';
import search from '../shared/search';
import AlertType from '../enums/alert-type';
import { setAlertMessage } from '../redux-store/actions/index';
import TransactionType from '../enums/transaction-type';

class CreateGroup extends Component {
  constructor() {
    super();
    this.state = {
      GroupPicture: null,
      Name: '',
      Members: [],
      Invitees: [],
      registeredUsers: [],
      searchedUsers: [],
      value: '',
      formErrors: { Name: '' },
      isNameValid: false,
      isFormValid: false,
      userName: UserAuth.getName(),
      userEmail: UserAuth.getEmail(),
    };

    this.imageHandler = this.imageHandler.bind(this);
    this.nameChangeHandler = this.nameChangeHandler.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.onUserSelectionChange = this.onUserSelectionChange.bind(this);
    this.onAddPersonClick = this.onAddPersonClick.bind(this);
    this.onCancelClick = this.onCancelClick.bind(this);
    this.onSaveClick = this.onSaveClick.bind(this);
  }

  componentWillUnmount() {
    const alert = {
      type: '',
      message: '',
    };
    this.props.setAlertMessage(alert);
  }

  async onSearch(val) {
    const res = await search(`${config.server.url}/api/users/search-user`, {
      searchTerm: val,
      userId: UserAuth.getUserId(),
    });

    const users = res;
    this.setState({
      searchedUsers: [...users],
    });
  }

  onAddPersonClick() {
    const formInfo = this.state;
    const newInput = `input-${formInfo.Members.length}`;
    this.setState((prevState) => ({
      Members: prevState.Members.concat([newInput]),
      value: '',
      searchedUsers: [],
    }));
  }

  onCancelClick(e) {
    const formInfo = this.state;
    const index = formInfo.Members.length - 1;
    this.setState((prevState) => ({
      Members:
        prevState.Members.length > 0 ? prevState.Members.splice(index, 1) : [],
    }));
    e.stopPropagation();
  }

  onChangeHandler(e) {
    this.onSearch(e.target.value);
    this.setState({ value: e.target.value });
  }

  onUserSelectionChange(e, value) {
    if (value) {
      const selectedId = value._id;
      this.setState((prevState) => ({
        Invitees: [...prevState.Invitees, selectedId],
      }));
    }
  }

  onSaveClick(e) {
    e.preventDefault();
    console.log(this.state);
    const { GroupPicture, Name, Invitees } = this.state;

    const formData = new FormData();
    formData.append('groupPicture', GroupPicture);
    formData.append('name', Name.valueOf());
    formData.append('createdBy', UserAuth.getUserId());
    formData.append('pendingInvites', JSON.stringify(Invitees));
    formData.append('creatorName', UserAuth.getName());

    axios
      .post(`${config.server.url}/api/groups/new`, formData)
      .then((response) => {
        if (response.status === 200) {
          const alert = {
            type: AlertType.Success,
            message: response.data.message,
          };
          this.props.setAlertMessage(alert);
          return {
            groupId: response.data.result._id,
            groupName: response.data.result.name,
          };
        }
        return null;
      })
      .then((group) => {
        if (group) {
          this.recordTransaction(group.groupId, group.groupName);
        }
      })
      .then(() => {
        this.setState({
          Name: '',
          Members: [],
          Invitees: [],
          GroupPicture: null,
        });
      })
      .catch((err) => {
        if (err.response.status === 500 || err.response.status === 400) {
          const alert = {
            type: AlertType.Error,
            message: err.response.data.message,
          };
          this.props.setAlertMessage(alert);
        }
      });
  }

  recordTransaction(groupId, groupName) {
    const data = {
      userId: UserAuth.getUserId(),
      groupId,
      userName: UserAuth.getName(),
      groupName,
      description: ` created the group "${groupName}"`,
      type: TransactionType.CreateGroup,
    };
    axios.post(`${config.server.url}/api/transactions/transaction`, data);
  }

  validateForm() {
    const { isNameValid } = this.state;
    this.setState({ isFormValid: isNameValid });
  }

  validateField(fieldName, value) {
    const { formErrors } = this.state;
    let { isNameValid } = this.state;

    switch (fieldName) {
      case 'Name':
        isNameValid = value.match(/^[a-zA-Z0-9_\s]*$/i);
        formErrors.Name = isNameValid
          ? ''
          : 'Enter a valid group name containing only alphanumeric values and/or underscore.';
        break;
      default:
        break;
    }
    this.setState({ formErrors, isNameValid }, this.validateForm);
  }

  nameChangeHandler(e) {
    this.setState(
      {
        Name: e.target.value,
      },
      () => {
        this.validateField(e.target.name, e.target.value);
      }
    );
  }

  imageHandler(e) {
    this.setState({ GroupPicture: e.file });
  }

  render() {
    const formInfo = this.state;
    const refArray = formInfo.Members.map(() => createRef());

    return (
      <div>
        <Navigation />

        <div className="panel panel-default">
          <FormErrors formErrors={formInfo.formErrors} />
        </div>

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

        <div className="container" style={{ marginTop: '5rem' }}>
          <Form onSubmit={this.onSaveClick}>
            <Container>
              <Row>
                <Col>
                  <ImageUpload
                    id="image"
                    defImgSrc={defaultGroupLogo}
                    value={formInfo.GroupPicture}
                    onInput={(e) => this.imageHandler(e)}
                  />
                </Col>
                <Col>
                  <span>START A NEW GROUP</span>
                  <Form.Group controlId="formGroupEmail">
                    <Form.Label>My group shall be called...</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Home Expenses"
                      value={formInfo.Name}
                      name="Name"
                      onChange={this.nameChangeHandler}
                    />
                    <FormErrors
                      formErrors={formInfo.formErrors}
                      currentField="Name"
                    />
                  </Form.Group>
                  <hr />
                  <span>GROUP MEMBERS</span>
                  <br />
                  <span>
                    {formInfo.userName} <em>{formInfo.userEmail}</em>
                  </span>
                  <br />

                  <div>
                    {formInfo.Members.map((input, index) => (
                      <Container key={input}>
                        <Row style={{ marginTop: '0.5rem' }}>
                          <Col>
                            <div>
                              <Autocomplete
                                id="combo-box-demo"
                                options={formInfo.searchedUsers}
                                getOptionLabel={(option) =>
                                  `${option.name}: ${option.emailId}`
                                }
                                onChange={this.onUserSelectionChange}
                                size="small"
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Email ID"
                                    key={`txt-${input}`}
                                    ref={refArray[index]}
                                    variant="outlined"
                                    onChange={this.onChangeHandler}
                                  />
                                )}
                              />
                            </div>
                          </Col>
                        </Row>
                      </Container>
                    ))}
                  </div>
                  <button
                    type="button"
                    style={{
                      color: 'blue',
                      border: 'none',
                      backgroundColor: 'transparent',
                    }}
                    onClick={this.onAddPersonClick}
                  >
                    + Add a person
                  </button>
                  <br />

                  <button
                    type="submit"
                    className="btn btn-large btn-orange"
                    disabled={!formInfo.isFormValid}
                  >
                    Save
                  </button>
                </Col>
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
    alert: state.alert,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setAlertMessage: (alert) => dispatch(setAlertMessage(alert)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateGroup);
