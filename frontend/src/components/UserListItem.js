import React from 'react';
import defaultPicture from '../assets/profile.png';

const UserListItem = (props) => {
  let imageSource = defaultPicture;
  if (props.user.image) {
    imageSource = `/images/profile/${props.user.image}`;
  }
  return (
    <div className="list-group-item list-group-item-action">
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
    </div>
  );
};

export default UserListItem;
