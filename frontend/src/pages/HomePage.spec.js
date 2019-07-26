import React from 'react';
import { render } from '@testing-library/react';
import HomePage from './HomePage';
import * as apiCalls from '../api/apiCalls';

apiCalls.listUsers = jest.fn().mockResolvedValue({
  data: {
    content: [],
    number: 0,
    size: 3
  }
});

describe('HomePage', () => {
  describe('Layout', () => {
    it('has root page div', () => {
      const { queryByTestId } = render(<HomePage />);
      const homePageDiv = queryByTestId('homepage');
      expect(homePageDiv).toBeInTheDocument();
    });
  });
});

console.error = () => {};
