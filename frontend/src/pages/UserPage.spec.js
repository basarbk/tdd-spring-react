import React from 'react';
import { render, waitForElement } from '@testing-library/react';
import UserPage from './UserPage';
import * as apiCalls from '../api/apiCalls';

const mockSuccessGetUser = {
  data: {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png'
  }
};
const match = {
  params: {
    username: 'user1'
  }
};

describe('UserPage', () => {
  describe('Layout', () => {
    it('has root page div', () => {
      const { queryByTestId } = render(<UserPage />);
      const userPageDiv = queryByTestId('userpage');
      expect(userPageDiv).toBeInTheDocument();
    });
    it('displays the displayName@username when user data loaded', async () => {
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      const { queryByText } = render(<UserPage match={match} />);
      const text = await waitForElement(() => queryByText('display1@user1'));
      expect(text).toBeInTheDocument();
    });
  });
  describe('Lifecycle', () => {
    it('calls getUser when it is rendered', () => {
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      render(<UserPage match={match} />);
      expect(apiCalls.getUser).toHaveBeenCalledTimes(1);
    });
    it('calls getUser for user1 when it is rendered with user1 in match', () => {
      apiCalls.getUser = jest.fn().mockResolvedValue(mockSuccessGetUser);
      render(<UserPage match={match} />);
      expect(apiCalls.getUser).toHaveBeenCalledWith('user1');
    });
  });
});
