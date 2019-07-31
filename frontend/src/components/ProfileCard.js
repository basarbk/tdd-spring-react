import React from 'react';
import defaultPicture from '../assets/profile.png';

const ProfileCard = (props) => {
  const { displayName, username, image } = props.user;

  let imageSource = defaultPicture;
  if (image) {
    imageSource = '/images/profile/' + image;
  }

  return (
    <div className="card">
      <div className="card-header text-center">
        <img
          alt="profile"
          width="200"
          height="200"
          src={imageSource}
          className="rounded-circle shadow"
        />
      </div>
      <div className="card-body text-center">
        <h4>{`${displayName}@${username}`}</h4>
      </div>
    </div>
  );
};

export default ProfileCard;
