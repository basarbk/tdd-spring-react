import * as apiCalls from '../api/apiCalls';

export const loginSuccess = (loginUserData) => {
  return {
    type: 'login-success',
    payload: loginUserData
  };
};

export const loginHandler = (credentials) => {
  return function(dispatch) {
    return apiCalls.login(credentials).then((response) => {
      dispatch(
        loginSuccess({
          ...response.data,
          password: credentials.password
        })
      );
      return response;
    });
  };
};

export const signupHandler = (user) => {
  return function(dispatch) {
    return apiCalls.signup(user).then((response) => {
      return dispatch(loginHandler(user));
    });
  };
};
