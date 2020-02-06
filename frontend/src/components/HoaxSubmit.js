import React, { Component } from 'react';
import ProfileImageWithDefault from './ProfileImageWithDefault';

class HoaxSubmit extends Component {
  render() {
    return (
      <div className="card d-flex flex-row p-1">
        <ProfileImageWithDefault
          className="rounded-circle m-1"
          width="32"
          height="32"
        />
        <div className="flex-fill">
          <textarea className="form-control w-100" rows={1} />
        </div>
      </div>
    );
  }
}

export default HoaxSubmit;
