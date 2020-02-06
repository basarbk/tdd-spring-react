import React, { Component } from 'react';
import * as apiCalls from '../api/apiCalls';

class HoaxFeed extends Component {
  componentDidMount() {
    apiCalls.loadHoaxes(this.props.user);
  }
  render() {
    return (
      <div className="card card-header text-center">There are no hoaxes</div>
    );
  }
}

export default HoaxFeed;
