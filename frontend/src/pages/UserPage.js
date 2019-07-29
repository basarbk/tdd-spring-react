import React from 'react';
import * as apiCalls from '../api/apiCalls';

class UserPage extends React.Component {
  state = {
    user: undefined
  };
  componentDidMount() {
    const username = this.props.match.params.username;
    if (!username) {
      return;
    }
    apiCalls.getUser(username).then((response) => {
      this.setState({ user: response.data });
    });
  }

  render() {
    return (
      <div data-testid="userpage">
        {this.state.user && (
          <span>{`${this.state.user.displayName}@${
            this.state.user.username
          }`}</span>
        )}
      </div>
    );
  }
}
UserPage.defaultProps = {
  match: {
    params: {}
  }
};

export default UserPage;
