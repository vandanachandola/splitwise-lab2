const UserAuth = (() => {
  const windowGlobal = typeof window !== 'undefined' && window;

  const getUserData = () =>
    JSON.parse(windowGlobal.localStorage.getItem('curr_user_cred'));

  const setUserData = (userCredentials) => {
    const credentials = JSON.stringify({
      id: userCredentials._id,
      name: userCredentials.name,
      // emailId: userCredentials.emailId,
      // profilePicture: userCredentials.profilePicture,
      token: userCredentials.token,
    });
    windowGlobal.localStorage.setItem('curr_user_cred', credentials);
  };

  const logout = () => {
    windowGlobal.localStorage.removeItem('curr_user_cred');
  };
  const getUserId = () => (getUserData() ? getUserData()._id : '');

  const getName = () => (getUserData() ? getUserData().name : '');

  // const getEmail = () => (getUserData() ? getUserData().emailId : '');

  const getUserToken = () => (getUserData() ? getUserData().token : '');

  // const getProfilePicture = () =>
  //   getUserData() ? getUserData().profilePicture : '';

  return {
    getUserId,
    getName,
    // getEmail,
    getUserToken,
    // getProfilePicture,
    setUserData,
    logout,
  };
})();

export default UserAuth;
