const UserAuth = (() => {
  const windowGlobal = typeof window !== 'undefined' && window;

  const getUserCredentials = () =>
    JSON.parse(windowGlobal.localStorage.getItem('curr_user_cred'));

  const getUserProfile = () =>
    JSON.parse(windowGlobal.localStorage.getItem('curr_user_prof'));

  const setUserCredentials = (userCredentials) => {
    const credentials = JSON.stringify({
      id: userCredentials.id,
      emailId: userCredentials.emailId,
      token: userCredentials.token,
    });
    windowGlobal.localStorage.setItem('curr_user_cred', credentials);
  };

  const setUserProfile = (userProfile) => {
    const profile = JSON.stringify({
      id: userProfile.id,
      name: userProfile.name,
      emailId: userProfile.emailId,
      profilePicture: userProfile.profilePicture,
    });
    windowGlobal.localStorage.setItem('curr_user_prof', profile);
  };

  const logout = () => {
    windowGlobal.localStorage.removeItem('curr_user_cred');
    windowGlobal.localStorage.removeItem('curr_user_prof');
  };
  const getUserId = () => (getUserCredentials() ? getUserCredentials().id : '');

  const getName = () => (getUserProfile() ? getUserProfile().name : '');

  const getEmail = () => (getUserProfile() ? getUserProfile().emailId : '');

  const getUserToken = () =>
    getUserCredentials() ? getUserCredentials().token : '';

  const getProfilePicture = () =>
    getUserProfile() ? getUserProfile().profilePicture : '';

  return {
    getUserId,
    getName,
    getEmail,
    getUserToken,
    getProfilePicture,
    setUserCredentials,
    setUserProfile,
    logout,
  };
})();

export default UserAuth;
