import isEmpty from 'lodash/isEmpty';
// import UserAuth from '../../shared/user-auth';
import { SET_CURR_USER, SET_ALERT_MSG } from '../constants/action-types';

const initialState = {
  currentUser: {
    id: '',
    emailId: '',
    name: '',
    // profilePicture: UserAuth.getProfilePicture(),
    token: '',
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
        currentUser: action.payload,
        isAuthenticated: !isEmpty(action.payload),
      };
    case SET_ALERT_MSG:
      return {
        alert: action.payload,
      };
    default:
      return state;
  }
}

export default rootReducer;
