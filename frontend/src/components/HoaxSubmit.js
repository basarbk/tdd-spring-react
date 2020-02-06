import React, { Component } from 'react';
import ProfileImageWithDefault from './ProfileImageWithDefault';
import { connect } from 'react-redux';
import * as apiCalls from '../api/apiCalls';
import ButtonWithProgress from './ButtonWithProgress';

class HoaxSubmit extends Component {
  state = {
    focused: false,
    content: undefined,
    pendingApiCall: false,
    errors: {}
  };

  onChangeContent = (event) => {
    const value = event.target.value;
    this.setState({ content: value, errors: {} });
  };

  onClickHoaxify = () => {
    const body = {
      content: this.state.content
    };
    this.setState({ pendingApiCall: true });
    apiCalls
      .postHoax(body)
      .then((response) => {
        this.setState({
          focused: false,
          content: '',
          pendingApiCall: false
        });
      })
      .catch((error) => {
        let errors = {};
        if (error.response.data && error.response.data.validationErrors) {
          errors = error.response.data.validationErrors;
        }
        this.setState({ pendingApiCall: false, errors });
      });
  };

  onFocus = () => {
    this.setState({
      focused: true
    });
  };

  onClickCancel = () => {
    this.setState({
      focused: false,
      content: '',
      errors: {}
    });
  };

  render() {
    let textAreaClassName = 'form-control w-100';
    if (this.state.errors.content) {
      textAreaClassName += ' is-invalid';
    }
    return (
      <div className="card d-flex flex-row p-1">
        <ProfileImageWithDefault
          className="rounded-circle m-1"
          width="32"
          height="32"
          image={this.props.loggedInUser.image}
        />
        <div className="flex-fill">
          <textarea
            className={textAreaClassName}
            rows={this.state.focused ? 3 : 1}
            onFocus={this.onFocus}
            value={this.state.content}
            onChange={this.onChangeContent}
          />
          {this.state.errors.content && (
            <span className="invalid-feedback">
              {this.state.errors.content}
            </span>
          )}
          {this.state.focused && (
            <div className="text-right mt-1">
              <ButtonWithProgress
                className="btn btn-success"
                disabled={this.state.pendingApiCall}
                onClick={this.onClickHoaxify}
                pendingApiCall={this.state.pendingApiCall}
                text="Hoaxify"
              />
              <button
                className="btn btn-light ml-1"
                onClick={this.onClickCancel}
                disabled={this.state.pendingApiCall}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loggedInUser: state
  };
};

export default connect(mapStateToProps)(HoaxSubmit);
