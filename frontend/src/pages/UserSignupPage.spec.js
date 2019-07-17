import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { UserSignupPage } from './UserSignupPage';

describe('UserSignupPage', () => {
  describe('Layout', () => {
    it('has header of Sign Up', () => {
      const { container } = render(<UserSignupPage />);
      const header = container.querySelector('h1');
      expect(header).toHaveTextContent('Sign Up');
    });
  });
});
