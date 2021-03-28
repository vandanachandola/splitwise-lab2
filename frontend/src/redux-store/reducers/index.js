import isEmpty from 'lodash/isEmpty';
import { SET_CURR_USER, SET_ALERT_MSG } from '../constants/action-types';

const initialState = {
  currentUser: {
    emailId: '',
    password: '',
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
        alert: {
          type: action.payload.type,
          message: action.payload.message,
        },
      };
    default:
      return state;
  }
}

export default rootReducer;
