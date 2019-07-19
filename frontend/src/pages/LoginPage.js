import React from 'react';
import Input from '../components/Input';

export class LoginPage extends React.Component {
  state = {
    username: '',
    password: ''
  };

  onChangeUsername = (event) => {
    const value = event.target.value;
    this.setState({
      username: value
    });
  };

  onChangePassword = (event) => {
    const value = event.target.value;
    this.setState({
      password: value
    });
  };

  render() {
    return (
      <div className="container">
        <h1 className="text-center">Login</h1>
        <div className="col-12 mb-3">
          <Input
            label="Username"
            placeholder="Your username"
            value={this.state.username}
            onChange={this.onChangeUsername}
          />
        </div>
        <div className="col-12 mb-3">
          <Input
            label="Password"
            placeholder="Your password"
            type="password"
            value={this.state.password}
            onChange={this.onChangePassword}
          />
        </div>
        <div className="text-center">
          <button className="btn btn-primary">Login</button>
        </div>
      </div>
    );
  }
}

export default LoginPage;
