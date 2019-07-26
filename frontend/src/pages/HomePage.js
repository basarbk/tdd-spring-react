import React from 'react';
import UserList from '../components/UserList';

class HomePage extends React.Component {
  render() {
    return (
      <div data-testid="homepage">
        <UserList />
      </div>
    );
  }
}

export default HomePage;
