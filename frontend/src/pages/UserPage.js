import React, { useEffect, useReducer } from 'react';
import * as apiCalls from '../api/apiCalls';
import ProfileCard from '../components/ProfileCard';
import { connect } from 'react-redux';
import HoaxFeed from '../components/HoaxFeed';
import Spinner from '../components/Spinner';

const reducer = (state, action) => {
  if (action.type === 'loading-user') {
    return {
      ...state,
      isLoadingUser: true,
      userNotFound: false,
    };
  } else if (action.type === 'load-user-success') {
    return {
      ...state,
      isLoadingUser: false,
      user: action.payload,
    };
  } else if (action.type === 'load-user-failure') {
    return {
      ...state,
      isLoadingUser: false,
      userNotFound: true,
    };
  } else if (action.type === 'cancel') {
    let displayName = state.user.displayName;
    if (state.originalDisplayName) {
      displayName = state.originalDisplayName;
    }
    return {
      ...state,
      inEditMode: false,
      image: undefined,
      errors: {},
      user: {
        ...state.user,
        displayName,
      },
      originalDisplayName: undefined,
    };
  } else if (action.type === 'update-progress') {
    return {
      ...state,
      pendingUpdateCall: true,
    };
  } else if (action.type === 'update-success') {
    return {
      ...state,
      inEditMode: false,
      originalDisplayName: undefined,
      image: undefined,
      pendingUpdateCall: false,
      user: {
        ...state.user,
        image: action.payload,
      },
    };
  } else if (action.type === 'update-failure') {
    return {
      ...state,
      pendingUpdateCall: false,
      errors: action.payload,
    };
  } else if (action.type === 'update-displayName') {
    let originalDisplayName = state.originalDisplayName;
    if (!originalDisplayName) {
      originalDisplayName = state.user.displayName;
    }
    const errors = state.errors;
    errors.displayName = undefined;
    return {
      ...state,
      errors,
      originalDisplayName,
      user: {
        ...state.user,
        displayName: action.payload,
      },
    };
  } else if (action.type === 'select-file') {
    const errors = state.errors;
    errors.image = undefined;
    return {
      ...state,
      errors,
      image: action.payload,
    };
  } else if (action.type === 'edit-mode') {
    return {
      ...state,
      inEditMode: true,
    };
  }
  return state;
};

const UserPage = (props) => {
  const [state, dispatch] = useReducer(reducer, {
    user: undefined,
    userNotFound: false,
    isLoadingUser: false,
    inEditMode: false,
    originalDisplayName: undefined,
    pendingUpdateCall: false,
    image: undefined,
    errors: {},
  });

  useEffect(() => {
    const loadUser = () => {
      const username = props.match.params.username;
      if (!username) {
        return;
      }
      dispatch({ type: 'loading-user' });
      apiCalls
        .getUser(username)
        .then((response) => {
          dispatch({ type: 'load-user-success', payload: response.data });
        })
        .catch((error) => {
          dispatch({ type: 'load-user-failure' });
        });
    };
    loadUser();
  }, [props.match.params.username]);

  const onClickSave = () => {
    const userId = props.loggedInUser.id;
    const userUpdate = {
      displayName: state.user.displayName,
      image: state.image && state.image.split(',')[1],
    };
    dispatch({ type: 'update-progress' });
    apiCalls
      .updateUser(userId, userUpdate)
      .then((response) => {
        dispatch({ type: 'update-success', payload: response.data.image });
        const updatedUser = { ...state.user };
        updatedUser.image = response.data.image;
        const action = {
          type: 'update-success',
          payload: updatedUser,
        };
        props.dispatch(action);
      })
      .catch((error) => {
        let errors = {};
        if (error.response.data.validationErrors) {
          errors = error.response.data.validationErrors;
        }
        dispatch({ type: 'update-failure', payload: errors });
      });
  };

  const onFileSelect = (event) => {
    if (event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    let reader = new FileReader();
    reader.onloadend = () => {
      dispatch({ type: 'select-file', payload: reader.result });
    };
    reader.readAsDataURL(file);
  };

  let pageContent;
  if (state.isLoadingUser) {
    pageContent = <Spinner />;
  } else if (state.userNotFound) {
    pageContent = (
      <div className="alert alert-danger text-center">
        <div className="alert-heading">
          <i className="fas fa-exclamation-triangle fa-3x" />
        </div>
        <h5>User not found</h5>
      </div>
    );
  } else {
    const isEditable =
      props.loggedInUser.username === props.match.params.username;
    pageContent = state.user && (
      <ProfileCard
        user={state.user}
        isEditable={isEditable}
        inEditMode={state.inEditMode}
        onClickEdit={() => dispatch({ type: 'edit-mode' })}
        onClickCancel={() => dispatch({ type: 'cancel' })}
        onClickSave={onClickSave}
        onChangeDisplayName={(event) =>
          dispatch({ type: 'update-displayName', payload: event.target.value })
        }
        pendingUpdateCall={state.pendingUpdateCall}
        loadedImage={state.image}
        onFileSelect={onFileSelect}
        errors={state.errors}
      />
    );
  }
  return (
    <div data-testid="userpage">
      <div className="row">
        <div className="col">{pageContent}</div>
        <div className="col">
          <HoaxFeed user={props.match.params.username} />
        </div>
      </div>
    </div>
  );
};
UserPage.defaultProps = {
  match: {
    params: {},
  },
};

const mapStateToProps = (state) => {
  return {
    loggedInUser: state,
  };
};

export default connect(mapStateToProps)(UserPage);
