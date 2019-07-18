import React from 'react';

export class UserSignupPage extends React.Component {
  render() {
    return (
      <div>
        <h1>Sign Up</h1>
        <div>
          <input placeholder="Your display name" />
        </div>
        <div>
          <input placeholder="Your username" />
        </div>
        <div>
          <input placeholder="Your password" type="password" />
        </div>
        <div>
          <input placeholder="Repeat your password" type="password" />
        </div>
        <div>
          <button>Sign Up</button>
        </div>
      </div>
    );
  }
}

export default UserSignupPage;
