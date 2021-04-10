import React, { Component, createRef } from 'react';
import { Alert, Col, Container, Form, Row } from 'react-bootstrap';
import axios from 'axios';
import FormData from 'form-data';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import Navigation from '../components/navigation';
import UserAuth from '../shared/user-auth';
import config from '../shared/config';
import ImageUpload from '../shared/image-upload';
import defaultGroupLogo from '../images/default-group-logo.svg';
import FormErrors from '../shared/form-errors';
import search from '../shared/search';
import InviteStatus from '../enums/invite-status';

class CreateGroup extends Component {
  constructor() {
    super();
    this.state = {
      GroupPicture: null,
      Name: '',
      Members: [],
      Invitees: [],
      successMsg: '',
      errorMsg: '',
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
  }

  async onSearch(val) {
    const res = await search(`${config.server.url}/api/users/search-user`, {
      val,
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
      const newUser = {
        invitedBy: UserAuth.getUserId(),
        invitee: selectedId,
        status: InviteStatus.Pending,
      };
      this.setState((prevState) => ({
        Invitees: [...prevState.Invitees, newUser],
      }));
    }
  }

  validateField(fieldName, value) {
    const { formErrors } = this.state;
    let { isNameValid } = this.state;

    switch (fieldName) {
      case 'Name':
        isNameValid = value.match(/^[a-z ,.'-]+$/i);
        formErrors.Name = isNameValid ? '' : ' field is invalid';
        break;
      default:
        break;
    }
    this.setState({ formErrors, isNameValid }, this.validateForm);
  }

  validateForm() {
    const { isNameValid } = this.state;
    this.setState({ isFormValid: isNameValid });
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

    const recordTransaction = (groupId, groupName) => {
      const data = {
        userId: UserAuth.getUserId(),
        groupId,
        userName: UserAuth.getName(),
        groupName,
        description: ` created the group "${groupName}"`,
      };
      axios.post(`${config.server.url}/api/groups/transaction`, data);
    };

    const onSaveClick = (e) => {
      e.preventDefault();
      console.log(this.state);
      const { GroupPicture, Name, Invitees } = this.state;

      const formData = new FormData();
      formData.append('groupPicture', GroupPicture);
      formData.append('name', Name.valueOf());
      formData.append('createdBy', UserAuth.getUserId());
      formData.append('pendingInvites', JSON.stringify(Invitees));

      axios
        .post(`${config.server.url}/api/groups/new`, formData)
        .then((response) => {
          if (response.status === 200) {
            this.setState({
              successMsg: response.data.message,
              errorMsg: '',
            });
            return {
              groupId: response.data.result.id,
              groupName: response.data.result.name,
            };
          }
          return null;
        })
        // .then((group) => {
        //   if (group) {
        //     recordTransaction(group.groupId, group.groupName);
        //   }
        // })
        .catch((err) => {
          if (err.response.status === 500) {
            this.setState({
              successMsg: '',
              errorMsg: err.response.data.message,
            });
          }
        });
    };

    return (
      <div>
        <Navigation />

        <div className="panel panel-default">
          <FormErrors formErrors={formInfo.formErrors} />
        </div>

        {formInfo.errorMsg && formInfo.errorMsg.length > 0 && (
          <Alert variant="danger" style={{ margin: '1rem' }}>
            {formInfo.errorMsg}
          </Alert>
        )}
        {formInfo.successMsg && formInfo.successMsg.length > 0 && (
          <Alert variant="success" style={{ margin: '1rem' }}>
            {formInfo.successMsg}
          </Alert>
        )}

        <div className="container" style={{ marginTop: '5rem' }}>
          <Form onSubmit={onSaveClick}>
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

export default CreateGroup;
