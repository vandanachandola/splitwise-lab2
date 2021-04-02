import UserAuth from '../../shared/user-auth';
import {
  SET_CURR_USER,
  SET_ALERT_MSG,
  LOGOUT_CURR_USER,
} from '../constants/action-types';

// action to display alert messages
export function setAlertMessage(payload) {
  return {
    type: SET_ALERT_MSG,
    payload,
  };
}

// action to set up current user
export function setCurrentUser(payload) {
  UserAuth.setUserData({
    id: payload.id,
    token: payload.token,
  });
  return {
    type: SET_CURR_USER,
    payload,
  };
}

// action to set user profile data
export function setUserProfile(payload) {
  return {
    type: SET_USER_PROFILE,
    payload,
  };
}

// action to logout currently logged-in user
export function logoutCurrentUser() {
  UserAuth.logout();
  return {
    type: LOGOUT_CURR_USER,
    payload: null,
  };
}
