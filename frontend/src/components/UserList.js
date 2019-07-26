import React from 'react';
import * as apiCalls from '../api/apiCalls';

class UserList extends React.Component {
  state = {
    page: {
      content: [],
      number: 0,
      size: 3
    }
  };
  componentDidMount() {
    apiCalls
      .listUsers({ page: this.state.page.number, size: this.state.page.size })
      .then((response) => {
        this.setState({
          page: response.data
        });
      });
  }

  render() {
    return (
      <div className="card">
        <h3 className="card-title m-auto">Users</h3>
        <div className="list-group list-group-flush" data-testid="usergroup">
          {this.state.page.content.map((user) => {
            return (
              <div
                key={user.username}
                className="list-group-item list-group-item-action"
              >
                {`${user.displayName}@${user.username}`}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default UserList;
