import React from 'react';
import defaultPicture from '../assets/profile.png';
import { Link } from 'react-router-dom';

const UserListItem = (props) => {
  let imageSource = defaultPicture;
  if (props.user.image) {
    imageSource = `/images/profile/${props.user.image}`;
  }
  return (
    <Link
      to={`/${props.user.username}`}
      className="list-group-item list-group-item-action"
    >
      <img
        className="rounded-circle"
        alt="profile"
        width="32"
        height="32"
        src={imageSource}
      />
      <span className="pl-2">{`${props.user.displayName}@${
        props.user.username
      }`}</span>
    </Link>
  );
};

export default UserListItem;
