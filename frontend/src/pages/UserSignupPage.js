import React, { useState } from 'react';
import Input from '../components/Input';
import ButtonWithProgress from '../components/ButtonWithProgress';
import { connect } from 'react-redux';
import * as authActions from '../redux/authActions';

export const UserSignupPage = (props) => {
  const [form, setForm] = useState({
    displayName: '',
    username: '',
    password: '',
    passwordRepeat: ''
  });
  const [errors, setErrors] = useState({});
  const [pendingApiCall, setPendingApiCall] = useState(false);

  const onChange = (event) => {
    const { value, name } = event.target;

    setForm((previousForm) => {
      return {
        ...previousForm,
        [name]: value
      };
    });

    setErrors((previousErrors) => {
      return {
        ...previousErrors,
        [name]: undefined
      };
    });
  };

  const onClickSignup = () => {
    const user = {
      username: form.username,
      displayName: form.displayName,
      password: form.password
    };
    setPendingApiCall(true);
    props.actions
      .postSignup(user)
      .then((response) => {
        setPendingApiCall(false);
        props.history.push('/');
      })
      .catch((apiError) => {
        if (apiError.response.data && apiError.response.data.validationErrors) {
          setErrors(apiError.response.data.validationErrors);
        }
        setPendingApiCall(false);
      });
  };

  let passwordRepeatError;
  const { password, passwordRepeat } = form;
  if (password || passwordRepeat) {
    passwordRepeatError =
      password === passwordRepeat ? '' : 'Does not match to password';
  }

  return (
    <div className="container">
      <h1 className="text-center">Sign Up</h1>
      <div className="col-12 mb-3">
        <Input
          name="displayName"
          label="Display Name"
          placeholder="Your display name"
          value={form.displayName}
          onChange={onChange}
          hasError={errors.displayName && true}
          error={errors.displayName}
        />
      </div>
      <div className="col-12 mb-3">
        <Input
          name="username"
          label="Username"
          placeholder="Your username"
          value={form.username}
          onChange={onChange}
          hasError={errors.username && true}
          error={errors.username}
        />
      </div>
      <div className="col-12 mb-3">
        <Input
          name="password"
          label="Password"
          placeholder="Your password"
          type="password"
          value={form.password}
          onChange={onChange}
          hasError={errors.password && true}
          error={errors.password}
        />
      </div>
      <div className="col-12 mb-3">
        <Input
          name="passwordRepeat"
          label="Password Repeat"
          placeholder="Repeat your password"
          type="password"
          value={form.passwordRepeat}
          onChange={onChange}
          hasError={passwordRepeatError && true}
          error={passwordRepeatError}
        />
      </div>
      <div className="text-center">
        <ButtonWithProgress
          onClick={onClickSignup}
          disabled={pendingApiCall || passwordRepeatError ? true : false}
          pendingApiCall={pendingApiCall}
          text="Sign Up"
        />
      </div>
    </div>
  );
};

UserSignupPage.defaultProps = {
  actions: {
    postSignup: () =>
      new Promise((resolve, reject) => {
        resolve({});
      })
  },
  history: {
    push: () => {}
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      postSignup: (user) => dispatch(authActions.signupHandler(user))
    }
  };
};

export default connect(null, mapDispatchToProps)(UserSignupPage);
