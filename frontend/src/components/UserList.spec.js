import React from 'react';
import {
  render,
  waitForDomChange,
  waitForElement,
  fireEvent
} from '@testing-library/react';
import UserList from './UserList';
import * as apiCalls from '../api/apiCalls';

apiCalls.listUsers = jest.fn().mockResolvedValue({
  data: {
    content: [],
    number: 0,
    size: 3
  }
});

const setup = () => {
  return render(<UserList />);
};

const mockedEmptySuccessResponse = {
  data: {
    content: [],
    number: 0,
    size: 3
  }
};

const mockSuccessGetSinglePage = {
  data: {
    content: [
      {
        username: 'user1',
        displayName: 'display1',
        image: ''
      },
      {
        username: 'user2',
        displayName: 'display2',
        image: ''
      },
      {
        username: 'user3',
        displayName: 'display3',
        image: ''
      }
    ],
    number: 0,
    first: true,
    last: true,
    size: 3,
    totalPages: 1
  }
};

const mockSuccessGetMultiPageFirst = {
  data: {
    content: [
      {
        username: 'user1',
        displayName: 'display1',
        image: ''
      },
      {
        username: 'user2',
        displayName: 'display2',
        image: ''
      },
      {
        username: 'user3',
        displayName: 'display3',
        image: ''
      }
    ],
    number: 0,
    first: true,
    last: false,
    size: 3,
    totalPages: 2
  }
};

const mockSuccessGetMultiPageLast = {
  data: {
    content: [
      {
        username: 'user4',
        displayName: 'display4',
        image: ''
      }
    ],
    number: 1,
    first: false,
    last: true,
    size: 3,
    totalPages: 2
  }
};

describe('UserList', () => {
  describe('Layout', () => {
    it('has header of Users', () => {
      const { container } = setup();
      const header = container.querySelector('h3');
      expect(header).toHaveTextContent('Users');
    });
    it('displays three items when listUser api returns three users', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockSuccessGetSinglePage);
      const { queryByTestId } = setup();
      await waitForDomChange();
      const userGroup = queryByTestId('usergroup');
      expect(userGroup.childElementCount).toBe(3);
    });
    it('displays the displayName@username when listUser api returns users', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockSuccessGetSinglePage);
      const { queryByText } = setup();
      const firstUser = await waitForElement(() =>
        queryByText('display1@user1')
      );
      expect(firstUser).toBeInTheDocument();
    });
    it('displays the next button when response has last value as false', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockSuccessGetMultiPageFirst);
      const { queryByText } = setup();
      const nextLink = await waitForElement(() => queryByText('next >'));
      expect(nextLink).toBeInTheDocument();
    });
    it('hides the next button when response has last value as true', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockSuccessGetMultiPageLast);
      const { queryByText } = setup();
      const nextLink = await waitForElement(() => queryByText('next >'));
      expect(nextLink).not.toBeInTheDocument();
    });
    it('displays the previous button when response has first value as false', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockSuccessGetMultiPageLast);
      const { queryByText } = setup();
      const previous = await waitForElement(() => queryByText('< previous'));
      expect(previous).toBeInTheDocument();
    });
    it('hides the previous button when response has first value as true', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockSuccessGetMultiPageFirst);
      const { queryByText } = setup();
      const previous = await waitForElement(() => queryByText('< previous'));
      expect(previous).not.toBeInTheDocument();
    });
  });
  describe('Lifecycle', () => {
    it('calls listUsers api when it is rendered', () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockedEmptySuccessResponse);
      setup();
      expect(apiCalls.listUsers).toHaveBeenCalledTimes(1);
    });
    it('calls listUsers method with page zero and size three', () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValue(mockedEmptySuccessResponse);
      setup();
      expect(apiCalls.listUsers).toHaveBeenCalledWith({ page: 0, size: 3 });
    });
  });
  describe('Interactions', () => {
    it('loads next page when clicked to next button', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValueOnce(mockSuccessGetMultiPageFirst)
        .mockResolvedValueOnce(mockSuccessGetMultiPageLast);
      const { queryByText } = setup();
      const nextLink = await waitForElement(() => queryByText('next >'));
      fireEvent.click(nextLink);

      const secondPageUser = await waitForElement(() =>
        queryByText('display4@user4')
      );
      expect(secondPageUser).toBeInTheDocument();
    });
    it('loads previous page when clicked to previous button', async () => {
      apiCalls.listUsers = jest
        .fn()
        .mockResolvedValueOnce(mockSuccessGetMultiPageLast)
        .mockResolvedValueOnce(mockSuccessGetMultiPageFirst);
      const { queryByText } = setup();
      const previousLink = await waitForElement(() =>
        queryByText('< previous')
      );
      fireEvent.click(previousLink);

      const firstPageUser = await waitForElement(() =>
        queryByText('display1@user1')
      );
      expect(firstPageUser).toBeInTheDocument();
    });
  });
});

console.error = () => {};
