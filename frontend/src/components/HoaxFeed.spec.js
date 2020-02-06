import React from 'react';
import {
  render,
  waitForDomChange,
  waitForElement,
  fireEvent
} from '@testing-library/react';
import HoaxFeed from './HoaxFeed';
import * as apiCalls from '../api/apiCalls';
import { MemoryRouter } from 'react-router-dom';

const originalSetInterval = window.setInterval;
const originalClearInterval = window.clearInterval;

let timedFunction;

const useFakeIntervals = () => {
  window.setInterval = (callback, interval) => {
    timedFunction = callback;
  };
  window.clearInterval = () => {
    timedFunction = undefined;
  };
};

const useRealIntervals = () => {
  window.setInterval = originalSetInterval;
  window.clearInterval = originalClearInterval;
};

const runTimer = () => {
  timedFunction && timedFunction();
};

const setup = (props) => {
  return render(
    <MemoryRouter>
      <HoaxFeed {...props} />
    </MemoryRouter>
  );
};

const mockEmptyResponse = {
  data: {
    content: []
  }
};

const mockSuccessGetNewHoaxesList = {
  data: [
    {
      id: 21,
      content: 'This is the newest hoax',
      date: 1561294668539,
      user: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png'
      }
    }
  ]
};

const mockSuccessGetHoaxesSinglePage = {
  data: {
    content: [
      {
        id: 10,
        content: 'This is the latest hoax',
        date: 1561294668539,
        user: {
          id: 1,
          username: 'user1',
          displayName: 'display1',
          image: 'profile1.png'
        }
      }
    ],
    number: 0,
    first: true,
    last: true,
    size: 5,
    totalPages: 1
  }
};

const mockSuccessGetHoaxesFirstOfMultiPage = {
  data: {
    content: [
      {
        id: 10,
        content: 'This is the latest hoax',
        date: 1561294668539,
        user: {
          id: 1,
          username: 'user1',
          displayName: 'display1',
          image: 'profile1.png'
        }
      },
      {
        id: 9,
        content: 'This is hoax 9',
        date: 1561294668539,
        user: {
          id: 1,
          username: 'user1',
          displayName: 'display1',
          image: 'profile1.png'
        }
      }
    ],
    number: 0,
    first: true,
    last: false,
    size: 5,
    totalPages: 2
  }
};

const mockSuccessGetHoaxesLastOfMultiPage = {
  data: {
    content: [
      {
        id: 1,
        content: 'This is the oldest hoax',
        date: 1561294668539,
        user: {
          id: 1,
          username: 'user1',
          displayName: 'display1',
          image: 'profile1.png'
        }
      }
    ],
    number: 0,
    first: true,
    last: true,
    size: 5,
    totalPages: 2
  }
};
describe('HoaxFeed', () => {
  describe('Lifecycle', () => {
    it('calls loadHoaxes when it is rendered', () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
      setup();
      expect(apiCalls.loadHoaxes).toHaveBeenCalled();
    });
    it('calls loadHoaxes with user parameter when it is rendered with user property', () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
      setup({ user: 'user1' });
      expect(apiCalls.loadHoaxes).toHaveBeenCalledWith('user1');
    });
    it('calls loadHoaxes without user parameter when it is rendered without user property', () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
      setup();
      const parameter = apiCalls.loadHoaxes.mock.calls[0][0];
      expect(parameter).toBeUndefined();
    });
    it('calls loadNewHoaxCount with topHoax id', async () => {
      useFakeIntervals();
      apiCalls.loadHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
      apiCalls.loadNewHoaxCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      const { queryByText } = setup();
      await waitForDomChange();
      runTimer();
      await waitForElement(() => queryByText('There is 1 new hoax'));
      const firstParam = apiCalls.loadNewHoaxCount.mock.calls[0][0];
      expect(firstParam).toBe(10);
      useRealIntervals();
    });
    it('calls loadNewHoaxCount with topHoax id and username when rendered with user property', async () => {
      useFakeIntervals();
      apiCalls.loadHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
      apiCalls.loadNewHoaxCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      const { queryByText } = setup({ user: 'user1' });
      await waitForDomChange();
      runTimer();
      await waitForElement(() => queryByText('There is 1 new hoax'));
      expect(apiCalls.loadNewHoaxCount).toHaveBeenCalledWith(10, 'user1');
      useRealIntervals();
    });
    it('displays new hoax count as 1 after loadNewHoaxCount success', async () => {
      useFakeIntervals();
      apiCalls.loadHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
      apiCalls.loadNewHoaxCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      const { queryByText } = setup({ user: 'user1' });
      await waitForDomChange();
      runTimer();
      const newHoaxCount = await waitForElement(() =>
        queryByText('There is 1 new hoax')
      );
      expect(newHoaxCount).toBeInTheDocument();
      useRealIntervals();
    });
    it('displays new hoax count constantly', async () => {
      useFakeIntervals();
      apiCalls.loadHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
      apiCalls.loadNewHoaxCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      const { queryByText } = setup({ user: 'user1' });
      await waitForDomChange();
      runTimer();
      await waitForElement(() => queryByText('There is 1 new hoax'));
      apiCalls.loadNewHoaxCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 2 } });
      runTimer();
      const newHoaxCount = await waitForElement(() =>
        queryByText('There are 2 new hoaxes')
      );
      expect(newHoaxCount).toBeInTheDocument();
      useRealIntervals();
    });
    it('does not call loadNewHoaxCount after component is unmounted', async () => {
      useFakeIntervals();
      apiCalls.loadHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
      apiCalls.loadNewHoaxCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      const { queryByText, unmount } = setup({ user: 'user1' });
      await waitForDomChange();
      runTimer();
      await waitForElement(() => queryByText('There is 1 new hoax'));
      unmount();
      expect(apiCalls.loadNewHoaxCount).toHaveBeenCalledTimes(1);
      useRealIntervals();
    });
    it('displays new hoax count as 1 after loadNewHoaxCount success when user does not have hoaxes initially', async () => {
      useFakeIntervals();
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
      apiCalls.loadNewHoaxCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      const { queryByText } = setup({ user: 'user1' });
      await waitForDomChange();
      runTimer();
      const newHoaxCount = await waitForElement(() =>
        queryByText('There is 1 new hoax')
      );
      expect(newHoaxCount).toBeInTheDocument();
      useRealIntervals();
    });
  });
  describe('Layout', () => {
    it('displays no hoax message when the response has empty page', async () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
      const { queryByText } = setup();
      const message = await waitForElement(() =>
        queryByText('There are no hoaxes')
      );
      expect(message).toBeInTheDocument();
    });
    it('does not display no hoax message when the response has page of hoax', async () => {
      apiCalls.loadHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesSinglePage);
      const { queryByText } = setup();
      await waitForDomChange();
      expect(queryByText('There are no hoaxes')).not.toBeInTheDocument();
    });
    it('displays spinner when loading the hoaxes', async () => {
      apiCalls.loadHoaxes = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(mockSuccessGetHoaxesSinglePage);
          }, 300);
        });
      });
      const { queryByText } = setup();
      expect(queryByText('Loading...')).toBeInTheDocument();
    });
    it('displays hoax content', async () => {
      apiCalls.loadHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesSinglePage);
      const { queryByText } = setup();
      const hoaxContent = await waitForElement(() =>
        queryByText('This is the latest hoax')
      );
      expect(hoaxContent).toBeInTheDocument();
    });
    it('displays Load More when there are next pages', async () => {
      apiCalls.loadHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
      const { queryByText } = setup();
      const loadMore = await waitForElement(() => queryByText('Load More'));
      expect(loadMore).toBeInTheDocument();
    });
  });
  describe('Interactions', () => {
    it('calls loadOldHoaxes with hoax id when clicking Load More', async () => {
      apiCalls.loadHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
      apiCalls.loadOldHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesLastOfMultiPage);
      const { queryByText } = setup();
      const loadMore = await waitForElement(() => queryByText('Load More'));
      fireEvent.click(loadMore);
      const firstParam = apiCalls.loadOldHoaxes.mock.calls[0][0];
      expect(firstParam).toBe(9);
    });
    it('calls loadOldHoaxes with hoax id and username when clicking Load More when rendered with user property', async () => {
      apiCalls.loadHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
      apiCalls.loadOldHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesLastOfMultiPage);
      const { queryByText } = setup({ user: 'user1' });
      const loadMore = await waitForElement(() => queryByText('Load More'));
      fireEvent.click(loadMore);
      expect(apiCalls.loadOldHoaxes).toHaveBeenCalledWith(9, 'user1');
    });
    it('displays loaded old hoax when loadOldHoaxes api call success', async () => {
      apiCalls.loadHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
      apiCalls.loadOldHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesLastOfMultiPage);
      const { queryByText } = setup();
      const loadMore = await waitForElement(() => queryByText('Load More'));
      fireEvent.click(loadMore);
      const oldHoax = await waitForElement(() =>
        queryByText('This is the oldest hoax')
      );
      expect(oldHoax).toBeInTheDocument();
    });
    it('hides Load More when loadOldHoaxes api call returns last page', async () => {
      apiCalls.loadHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
      apiCalls.loadOldHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesLastOfMultiPage);
      const { queryByText } = setup();
      const loadMore = await waitForElement(() => queryByText('Load More'));
      fireEvent.click(loadMore);
      await waitForElement(() => queryByText('This is the oldest hoax'));
      expect(queryByText('Load More')).not.toBeInTheDocument();
    });
    // load new hoaxes
    it('calls loadNewHoaxes with hoax id when clicking New Hoax Count Card', async () => {
      useFakeIntervals();
      apiCalls.loadHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
      apiCalls.loadNewHoaxCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      apiCalls.loadNewHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetNewHoaxesList);
      const { queryByText } = setup();
      await waitForDomChange();
      runTimer();
      const newHoaxCount = await waitForElement(() =>
        queryByText('There is 1 new hoax')
      );
      fireEvent.click(newHoaxCount);
      const firstParam = apiCalls.loadNewHoaxes.mock.calls[0][0];
      expect(firstParam).toBe(10);
      useRealIntervals();
    });
    it('calls loadNewHoaxes with hoax id and username when clicking New Hoax Count Card', async () => {
      useFakeIntervals();
      apiCalls.loadHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
      apiCalls.loadNewHoaxCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      apiCalls.loadNewHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetNewHoaxesList);
      const { queryByText } = setup({ user: 'user1' });
      await waitForDomChange();
      runTimer();
      const newHoaxCount = await waitForElement(() =>
        queryByText('There is 1 new hoax')
      );
      fireEvent.click(newHoaxCount);
      expect(apiCalls.loadNewHoaxes).toHaveBeenCalledWith(10, 'user1');
      useRealIntervals();
    });
    it('displays loaded new hoax when loadNewHoaxes api call success', async () => {
      useFakeIntervals();
      apiCalls.loadHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
      apiCalls.loadNewHoaxCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      apiCalls.loadNewHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetNewHoaxesList);
      const { queryByText } = setup({ user: 'user1' });
      await waitForDomChange();
      runTimer();
      const newHoaxCount = await waitForElement(() =>
        queryByText('There is 1 new hoax')
      );
      fireEvent.click(newHoaxCount);
      const newHoax = await waitForElement(() =>
        queryByText('This is the newest hoax')
      );
      expect(newHoax).toBeInTheDocument();
      useRealIntervals();
    });
    it('hides new hoax count when loadNewHoaxes api call success', async () => {
      useFakeIntervals();
      apiCalls.loadHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetHoaxesFirstOfMultiPage);
      apiCalls.loadNewHoaxCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      apiCalls.loadNewHoaxes = jest
        .fn()
        .mockResolvedValue(mockSuccessGetNewHoaxesList);
      const { queryByText } = setup({ user: 'user1' });
      await waitForDomChange();
      runTimer();
      const newHoaxCount = await waitForElement(() =>
        queryByText('There is 1 new hoax')
      );
      fireEvent.click(newHoaxCount);
      await waitForElement(() => queryByText('This is the newest hoax'));
      expect(queryByText('There is 1 new hoax')).not.toBeInTheDocument();
      useRealIntervals();
    });
  });
});

console.error = () => {};
