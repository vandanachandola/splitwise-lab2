const UserAuth = (() => {
  const windowGlobal = typeof window !== 'undefined' && window;

  const getUserData = () =>
    JSON.parse(windowGlobal.localStorage.getItem('curr_user_cred'));

  const setUserData = (userCredentials) => {
    const credentials = JSON.stringify({
      id: userCredentials.id,
      name: userCredentials.name,
      profilePicture: userCredentials.profilePicture,
      token: userCredentials.token,
    });
    windowGlobal.localStorage.setItem('curr_user_cred', credentials);
  };

  const logout = () => {
    windowGlobal.localStorage.removeItem('curr_user_cred');
  };
  const getUserId = () => (getUserData() ? getUserData().id : '');

  const getName = () => (getUserData() ? getUserData().name : '');

  const getUserToken = () => (getUserData() ? getUserData().token : '');

  const getProfilePicture = () =>
    getUserData() ? getUserData().profilePicture : '';

  return {
    getUserId,
    getName,
    getUserToken,
    getProfilePicture,
    setUserData,
    logout,
  };
})();

export default UserAuth;
