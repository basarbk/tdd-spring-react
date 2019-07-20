import React from 'react';
import { render } from '@testing-library/react';
import UserPage from './UserPage';

describe('UserPage', () => {
  describe('Layout', () => {
    it('has root page div', () => {
      const { queryByTestId } = render(<UserPage />);
      const userPageDiv = queryByTestId('userpage');
      expect(userPageDiv).toBeInTheDocument();
    });
  });
});
