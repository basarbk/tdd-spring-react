import React, { Component } from 'react';
import ProfileImageWithDefault from './ProfileImageWithDefault';
import { format } from 'timeago.js';
import { Link } from 'react-router-dom';

class HoaxView extends Component {
  render() {
    const { hoax } = this.props;
    const { user, date } = hoax;
    const { username, displayName, image } = user;
    const relativeDate = format(date);
    const attachmentImageVisible =
      hoax.attachment && hoax.attachment.fileType.startsWith('image');
    return (
      <div className="card p-1">
        <div className="d-flex">
          <ProfileImageWithDefault
            className="rounded-circle m-1"
            width="32"
            height="32"
            image={image}
          />
          <div className="flex-fill m-auto pl-2">
            <Link to={`/${username}`} className="list-group-item-action">
              <h6 className="d-inline">
                {displayName}@{username}
              </h6>
            </Link>
            <span className="text-black-50"> - </span>
            <span className="text-black-50">{relativeDate}</span>
          </div>
        </div>
        <div className="pl-5">{hoax.content}</div>
        {attachmentImageVisible && (
          <div className="pl-5">
            <img
              alt="attachment"
              src={`/images/attachments/${hoax.attachment.name}`}
              className="img-fluid"
            />
          </div>
        )}
      </div>
    );
  }
}

export default HoaxView;
