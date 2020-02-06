import React, { Component } from 'react';
import * as apiCalls from '../api/apiCalls';
import Spinner from './Spinner';
import HoaxView from './HoaxView';
import Modal from './Modal';
class HoaxFeed extends Component {
  state = {
    page: {
      content: []
    },
    isLoadingHoaxes: false,
    newHoaxCount: 0,
    isLoadingOldHoaxes: false,
    isLoadingNewHoaxes: false
  };

  componentDidMount() {
    this.setState({ isLoadingHoaxes: true });
    apiCalls.loadHoaxes(this.props.user).then((response) => {
      this.setState({ page: response.data, isLoadingHoaxes: false }, () => {
        this.counter = setInterval(this.checkCount, 3000);
      });
    });
  }

  componentWillUnmount() {
    clearInterval(this.counter);
  }

  checkCount = () => {
    const hoaxes = this.state.page.content;
    let topHoaxId = 0;
    if (hoaxes.length > 0) {
      topHoaxId = hoaxes[0].id;
    }
    apiCalls.loadNewHoaxCount(topHoaxId, this.props.user).then((response) => {
      this.setState({ newHoaxCount: response.data.count });
    });
  };

  onClickLoadMore = () => {
    const hoaxes = this.state.page.content;
    if (hoaxes.length === 0) {
      return;
    }
    const hoaxAtBottom = hoaxes[hoaxes.length - 1];
    this.setState({ isLoadingOldHoaxes: true });
    apiCalls
      .loadOldHoaxes(hoaxAtBottom.id, this.props.user)
      .then((response) => {
        const page = { ...this.state.page };
        page.content = [...page.content, ...response.data.content];
        page.last = response.data.last;
        this.setState({ page, isLoadingOldHoaxes: false });
      })
      .catch((error) => {
        this.setState({ isLoadingOldHoaxes: false });
      });
  };

  onClickLoadNew = () => {
    const hoaxes = this.state.page.content;
    let topHoaxId = 0;
    if (hoaxes.length > 0) {
      topHoaxId = hoaxes[0].id;
    }
    this.setState({ isLoadingNewHoaxes: true });
    apiCalls
      .loadNewHoaxes(topHoaxId, this.props.user)
      .then((response) => {
        const page = { ...this.state.page };
        page.content = [...response.data, ...page.content];
        this.setState({ page, newHoaxCount: 0, isLoadingNewHoaxes: false });
      })
      .catch((error) => {
        this.setState({ isLoadingNewHoaxes: false });
      });
  };

  render() {
    if (this.state.isLoadingHoaxes) {
      return <Spinner />;
    }
    if (this.state.page.content.length === 0 && this.state.newHoaxCount === 0) {
      return (
        <div className="card card-header text-center">There are no hoaxes</div>
      );
    }
    const newHoaxCountMessage =
      this.state.newHoaxCount === 1
        ? 'There is 1 new hoax'
        : `There are ${this.state.newHoaxCount} new hoaxes`;
    return (
      <div>
        {this.state.newHoaxCount > 0 && (
          <div
            className="card card-header text-center"
            onClick={!this.state.isLoadingNewHoaxes && this.onClickLoadNew}
            style={{
              cursor: this.state.isLoadingNewHoaxes ? 'not-allowed' : 'pointer'
            }}
          >
            {this.state.isLoadingNewHoaxes ? <Spinner /> : newHoaxCountMessage}
          </div>
        )}
        {this.state.page.content.map((hoax) => {
          return <HoaxView key={hoax.id} hoax={hoax} />;
        })}
        {this.state.page.last === false && (
          <div
            className="card card-header text-center"
            onClick={!this.state.isLoadingOldHoaxes && this.onClickLoadMore}
            style={{
              cursor: this.state.isLoadingOldHoaxes ? 'not-allowed' : 'pointer'
            }}
          >
            {this.state.isLoadingOldHoaxes ? <Spinner /> : 'Load More'}
          </div>
        )}
        <Modal />
      </div>
    );
  }
}

export default HoaxFeed;
