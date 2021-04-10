import axios from 'axios';

const resources = {};

const makeRequestCreator = function () {
  let cancelToken;
  return async (apiEndpoint, params) => {
    // check if we made a request
    if (cancelToken) {
      // cancel the previous request before making a new request
      cancelToken.cancel();
    }
    // create a new CancelToken
    cancelToken = axios.CancelToken.source();
    try {
      if (resources[apiEndpoint]) {
        // return result if it exists
        return resources[apiEndpoint];
      }
      const res = await axios.get(apiEndpoint, {
        params: params || null,
        cancelToken: cancelToken.token,
      });
      const { result } = res.data;
      resources[apiEndpoint] = result;
      return result;
    } catch (error) {
      if (axios.isCancel(error)) {
        // Handle if request was cancelled
        console.log('Request canceled', error.message);
      } else {
        // Handle usual errors
        console.log('Something went wrong: ', error.message);
      }
    }
    return null;
  };
};

const search = makeRequestCreator();
export default search;
