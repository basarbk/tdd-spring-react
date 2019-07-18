import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { UserSignupPage } from './UserSignupPage';

beforeEach(cleanup);

describe('UserSignupPage', () => {
  describe('Layout', () => {
    it('has header of Sign Up', () => {
      const { container } = render(<UserSignupPage />);
      const header = container.querySelector('h1');
      expect(header).toHaveTextContent('Sign Up');
    });
    it('has input for display name', () => {
      const { queryByPlaceholderText } = render(<UserSignupPage />);
      const displayNameInput = queryByPlaceholderText('Your display name');
      expect(displayNameInput).toBeInTheDocument();
    });
    it('has input for username', () => {
      const { queryByPlaceholderText } = render(<UserSignupPage />);
      const usernameInput = queryByPlaceholderText('Your username');
      expect(usernameInput).toBeInTheDocument();
    });
    it('has input for password', () => {
      const { queryByPlaceholderText } = render(<UserSignupPage />);
      const passwordInput = queryByPlaceholderText('Your password');
      expect(passwordInput).toBeInTheDocument();
    });
    it('has password type for password input', () => {
      const { queryByPlaceholderText } = render(<UserSignupPage />);
      const passwordInput = queryByPlaceholderText('Your password');
      expect(passwordInput.type).toBe('password');
    });
    it('has input for password repeat', () => {
      const { queryByPlaceholderText } = render(<UserSignupPage />);
      const passwordRepeat = queryByPlaceholderText('Repeat your password');
      expect(passwordRepeat).toBeInTheDocument();
    });
    it('has password type for password repeat input', () => {
      const { queryByPlaceholderText } = render(<UserSignupPage />);
      const passwordRepeat = queryByPlaceholderText('Repeat your password');
      expect(passwordRepeat.type).toBe('password');
    });
    it('has submit button', () => {
      const { container } = render(<UserSignupPage />);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });
});
