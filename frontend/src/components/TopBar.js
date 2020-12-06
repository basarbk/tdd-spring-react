import React, { useRef } from 'react';
import logo from '../assets/hoaxify-logo.png';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import ProfileImageWithDefault from './ProfileImageWithDefault';
import useClickTracker from '../shared/useClickTracker';

const TopBar = (props) => {
  const actionArea = useRef();
  const dropDownVisible = useClickTracker(actionArea);

  const onClickLogout = () => {
    const action = {
      type: 'logout-success',
    };
    props.dispatch(action);
  };

  let links = (
    <ul className="nav navbar-nav ml-auto">
      <li className="nav-item">
        <Link to="/signup" className="nav-link">
          Sign Up
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/login" className="nav-link">
          Login
        </Link>
      </li>
    </ul>
  );
  if (props.user.isLoggedIn) {
    let dropDownClass = 'p-0 shadow dropdown-menu';
    if (dropDownVisible) {
      dropDownClass += ' show';
    }
    links = (
      <ul className="nav navbar-nav ml-auto" ref={actionArea}>
        <li className="nav-item dropdown">
          <div className="d-flex" style={{ cursor: 'pointer' }}>
            <ProfileImageWithDefault
              className="rounded-circle m-auto"
              width="32"
              height="32"
              image={props.user.image}
            />
            <span className="nav-link dropdown-toggle">
              {props.user.displayName}
            </span>
          </div>
          <div className={dropDownClass} data-testid="drop-down-menu">
            <Link to={`/${props.user.username}`} className="dropdown-item">
              <i className="fas fa-user text-info"></i> My Profile
            </Link>
            <span
              className="dropdown-item"
              onClick={onClickLogout}
              style={{
                cursor: 'pointer',
              }}
            >
              <i className="fas fa-sign-out-alt text-danger"></i> Logout
            </span>
          </div>
        </li>
      </ul>
    );
  }
  return (
    <div className="bg-white shadow-sm mb-2">
      <div className="container">
        <nav className="navbar navbar-light navbar-expand">
          <Link to="/" className="navbar-brand">
            <img src={logo} width="60" alt="Hoaxify" /> Hoaxify
          </Link>
          {links}
        </nav>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state,
  };
};

export default connect(mapStateToProps)(TopBar);
