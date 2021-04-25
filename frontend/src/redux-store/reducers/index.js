import isEmpty from 'lodash/isEmpty';

import UserAuth from '../../shared/user-auth';
import {
  SET_CURR_USER,
  SET_ALERT_MSG,
  SET_USER_PROFILE,
  LOGOUT_CURR_USER,
} from '../constants/action-types';

const initialState = {
  currentUser: {
    id: '',
    emailId: '',
    token: '',
  },
  userProfile: {
    id: '',
    profilePicture: UserAuth.getProfilePicture(),
    name: UserAuth.getName(),
    emailId: '',
    phoneNo: '',
    defaultCurrency: '',
    timeZone: '',
    language: '',
  },
  isAuthenticated: false,
  alert: {
    type: '',
    message: '',
  },
};

function rootReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_CURR_USER:
      return {
        ...state,
        currentUser: action.payload,
        userProfile: {
          ...state.userProfile,
          id: action.payload.id,
          name: action.payload.name,
          emailId: action.payload.emailId,
        },
        isAuthenticated: !isEmpty(action.payload),
      };
    case SET_ALERT_MSG:
      return {
        ...state,
        alert: action.payload,
      };
    case SET_USER_PROFILE:
      return {
        ...state,
        userProfile: action.payload,
      };
    case LOGOUT_CURR_USER:
      return {
        isAuthenticated: false,
      };
    default:
      return state;
  }
}

export default rootReducer;
