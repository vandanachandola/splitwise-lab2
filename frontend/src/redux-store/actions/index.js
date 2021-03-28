import { SET_CURR_USER, SET_ALERT_MSG } from '../constants/action-types';

// action to display alert messages
export function setAlertMessage(payload) {
  return {
    type: SET_ALERT_MSG,
    payload,
  };
}

// action to set up current user
export function setCurrentUser(payload) {
  return {
    type: SET_CURR_USER,
    payload,
  };
}
