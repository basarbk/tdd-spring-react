import React, { Component } from 'react';
import ProfileImageWithDefault from './ProfileImageWithDefault';
import { connect } from 'react-redux';
import * as apiCalls from '../api/apiCalls';

class HoaxSubmit extends Component {
  state = {
    focused: false,
    content: undefined
  };

  onChangeContent = (event) => {
    const value = event.target.value;
    this.setState({ content: value });
  };

  onClickHoaxify = () => {
    const body = {
      content: this.state.content
    };
    apiCalls.postHoax(body).then((response) => {
      this.setState({
        focused: false,
        content: ''
      });
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
      content: ''
    });
  };

  render() {
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
            className="form-control w-100"
            rows={this.state.focused ? 3 : 1}
            onFocus={this.onFocus}
            value={this.state.content}
            onChange={this.onChangeContent}
          />
          {this.state.focused && (
            <div className="text-right mt-1">
              <button className="btn btn-success" onClick={this.onClickHoaxify}>
                Hoaxify
              </button>
              <button
                className="btn btn-light ml-1"
                onClick={this.onClickCancel}
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
