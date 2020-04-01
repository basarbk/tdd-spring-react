import React, { useState, useEffect } from 'react';
import Input from '../components/Input';
import ButtonWithProgress from '../components/ButtonWithProgress';
import { connect } from 'react-redux';
import * as authActions from '../redux/authActions';

export const LoginPage = (props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState();
  const [pendingApiCall, setPendingApiCall] = useState(false);

  useEffect(() => {
    setApiError();
  }, [username, password]);

  const onClickLogin = () => {
    const body = {
      username,
      password
    };
    setPendingApiCall(true);
    props.actions
      .postLogin(body)
      .then((response) => {
        setPendingApiCall(false);
        props.history.push('/');
      })
      .catch((error) => {
        if (error.response) {
          setPendingApiCall(false);
          setApiError(error.response.data.message);
        }
      });
  };

  let disableSubmit = false;
  if (username === '') {
    disableSubmit = true;
  }
  if (password === '') {
    disableSubmit = true;
  }

  return (
    <div className="container">
      <h1 className="text-center">Login</h1>
      <div className="col-12 mb-3">
        <Input
          label="Username"
          placeholder="Your username"
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
          }}
        />
      </div>
      <div className="col-12 mb-3">
        <Input
          label="Password"
          placeholder="Your password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {apiError && (
        <div className="col-12 mb-3">
          <div className="alert alert-danger">{apiError}</div>
        </div>
      )}
      <div className="text-center">
        <ButtonWithProgress
          onClick={onClickLogin}
          disabled={disableSubmit || pendingApiCall}
          text="Login"
          pendingApiCall={pendingApiCall}
        />
      </div>
    </div>
  );
};

LoginPage.defaultProps = {
  actions: {
    postLogin: () => new Promise((resolve, reject) => resolve({}))
  },
  dispatch: () => {}
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      postLogin: (body) => dispatch(authActions.loginHandler(body))
    }
  };
};

export default connect(null, mapDispatchToProps)(LoginPage);
