import React from 'react';
import ProfileImageWithDefault from './ProfileImageWithDefault';
import Input from './Input';

const ProfileCard = (props) => {
  const { displayName, username, image } = props.user;

  const showEditButton = props.isEditable && !props.inEditMode;

  return (
    <div className="card">
      <div className="card-header text-center">
        <ProfileImageWithDefault
          alt="profile"
          width="200"
          height="200"
          image={image}
          className="rounded-circle shadow"
        />
      </div>
      <div className="card-body text-center">
        {!props.inEditMode && <h4>{`${displayName}@${username}`}</h4>}
        {props.inEditMode && (
          <div className="mb-2">
            <Input
              value={displayName}
              label={`Change Display Name for ${username}`}
            />
          </div>
        )}
        {showEditButton && (
          <button
            className="btn btn-outline-success"
            onClick={props.onClickEdit}
          >
            <i className="fas fa-user-edit" /> Edit
          </button>
        )}
        {props.inEditMode && (
          <div>
            <button className="btn btn-primary">
              <i className="fas fa-save" /> Save
            </button>
            <button
              className="btn btn-outline-secondary ml-1"
              onClick={props.onClickCancel}
            >
              <i className="fas fa-window-close" /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
