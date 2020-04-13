import React, { useState, useEffect } from 'react';
import * as apiCalls from '../api/apiCalls';
import Spinner from './Spinner';
import HoaxView from './HoaxView';
import Modal from './Modal';

const HoaxFeed = (props) => {
  const [page, setPage] = useState({ content: [] });
  const [isLoadingHoaxes, setLoadingHoaxes] = useState(false);
  const [isLoadingOldHoaxes, setLoadingOldHoaxes] = useState(false);
  const [isLoadingNewHoaxes, setLoadingNewHoaxes] = useState(false);
  const [isDeletingHoax, setDeletingHoax] = useState(false);
  const [newHoaxCount, setNewHoaxCount] = useState(0);
  const [hoaxToBeDeleted, setHoaxToBeDeleted] = useState();

  useEffect(() => {
    const loadHoaxes = () => {
      setLoadingHoaxes(true);
      apiCalls.loadHoaxes(props.user).then((response) => {
        setLoadingHoaxes(false);
        setPage(response.data);
      });
    };
    loadHoaxes();
  }, [props.user]);

  useEffect(() => {
    const checkCount = () => {
      const hoaxes = page.content;
      let topHoaxId = 0;
      if (hoaxes.length > 0) {
        topHoaxId = hoaxes[0].id;
      }
      apiCalls.loadNewHoaxCount(topHoaxId, props.user).then((response) => {
        setNewHoaxCount(response.data.count);
      });
    };
    const counter = setInterval(checkCount, 3000);
    return function cleanup() {
      clearInterval(counter);
    };
  }, [props.user, page.content]);

  const onClickLoadMore = () => {
    if (isLoadingOldHoaxes) {
      return;
    }
    const hoaxes = page.content;
    if (hoaxes.length === 0) {
      return;
    }
    const hoaxAtBottom = hoaxes[hoaxes.length - 1];
    setLoadingOldHoaxes(true);
    apiCalls
      .loadOldHoaxes(hoaxAtBottom.id, props.user)
      .then((response) => {
        setPage((previousPage) => ({
          ...previousPage,
          last: response.data.last,
          content: [...previousPage.content, ...response.data.content],
        }));
        setLoadingOldHoaxes(false);
      })
      .catch((error) => {
        setLoadingOldHoaxes(false);
      });
  };

  const onClickLoadNew = () => {
    if (isLoadingNewHoaxes) {
      return;
    }
    const hoaxes = page.content;
    let topHoaxId = 0;
    if (hoaxes.length > 0) {
      topHoaxId = hoaxes[0].id;
    }
    setLoadingNewHoaxes(true);
    apiCalls
      .loadNewHoaxes(topHoaxId, props.user)
      .then((response) => {
        setPage((previousPage) => ({
          ...previousPage,
          content: [...response.data, ...previousPage.content],
        }));
        setLoadingNewHoaxes(false);
        setNewHoaxCount(0);
      })
      .catch((error) => {
        setLoadingNewHoaxes(false);
      });
  };

  const onClickModalOk = () => {
    setDeletingHoax(true);
    apiCalls.deleteHoax(hoaxToBeDeleted.id).then((response) => {
      setPage((previousPage) => ({
        ...previousPage,
        content: previousPage.content.filter(
          (hoax) => hoax.id !== hoaxToBeDeleted.id
        ),
      }));
      setDeletingHoax(false);
      setHoaxToBeDeleted();
    });
  };

  if (isLoadingHoaxes) {
    return <Spinner />;
  }
  if (page.content.length === 0 && newHoaxCount === 0) {
    return (
      <div className="card card-header text-center">There are no hoaxes</div>
    );
  }
  const newHoaxCountMessage =
    newHoaxCount === 1
      ? 'There is 1 new hoax'
      : `There are ${newHoaxCount} new hoaxes`;
  return (
    <div>
      {newHoaxCount > 0 && (
        <div
          className="card card-header text-center"
          onClick={onClickLoadNew}
          style={{
            cursor: isLoadingNewHoaxes ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoadingNewHoaxes ? <Spinner /> : newHoaxCountMessage}
        </div>
      )}
      {page.content.map((hoax) => {
        return (
          <HoaxView
            key={hoax.id}
            hoax={hoax}
            onClickDelete={() => setHoaxToBeDeleted(hoax)}
          />
        );
      })}
      {page.last === false && (
        <div
          className="card card-header text-center"
          onClick={onClickLoadMore}
          style={{
            cursor: isLoadingOldHoaxes ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoadingOldHoaxes ? <Spinner /> : 'Load More'}
        </div>
      )}
      <Modal
        visible={hoaxToBeDeleted && true}
        onClickCancel={() => setHoaxToBeDeleted()}
        body={
          hoaxToBeDeleted &&
          `Are you sure to delete '${hoaxToBeDeleted.content}'?`
        }
        title="Delete!"
        okButton="Delete Hoax"
        onClickOk={onClickModalOk}
        pendingApiCall={isDeletingHoax}
      />
    </div>
  );
};

export default HoaxFeed;
