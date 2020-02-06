import React from 'react';
import {
  render,
  waitForDomChange,
  waitForElement
} from '@testing-library/react';
import HoaxFeed from './HoaxFeed';
import * as apiCalls from '../api/apiCalls';
import { MemoryRouter } from 'react-router-dom';

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
      }
    ],
    number: 0,
    first: true,
    last: false,
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
});
