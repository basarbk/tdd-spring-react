import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import authReducer from '../redux/authReducer';

const setup = (path) => {
  const store = createStore(authReducer);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </Provider>
  );
};

describe('App', () => {
  it('displays homepage when url is /', () => {
    const { queryByTestId } = setup('/');
    expect(queryByTestId('homepage')).toBeInTheDocument();
  });
  it('displays LoginPage when url is /login', () => {
    const { container } = setup('/login');
    const header = container.querySelector('h1');
    expect(header).toHaveTextContent('Login');
  });
  it('displays only LoginPage when url is /login', () => {
    const { queryByTestId } = setup('/login');
    expect(queryByTestId('homepage')).not.toBeInTheDocument();
  });
  it('displays UserSignupPage when url is /signup', () => {
    const { container } = setup('/signup');
    const header = container.querySelector('h1');
    expect(header).toHaveTextContent('Sign Up');
  });
  it('displays userpage when url is other than /, /login or /signup', () => {
    const { queryByTestId } = setup('/user1');
    expect(queryByTestId('userpage')).toBeInTheDocument();
  });
  it('displays topBar when url is /', () => {
    const { container } = setup('/');
    const navigation = container.querySelector('nav');
    expect(navigation).toBeInTheDocument();
  });
  it('displays topBar when url is /login', () => {
    const { container } = setup('/login');
    const navigation = container.querySelector('nav');
    expect(navigation).toBeInTheDocument();
  });
  it('displays topBar when url is /signup', () => {
    const { container } = setup('/signup');
    const navigation = container.querySelector('nav');
    expect(navigation).toBeInTheDocument();
  });
  it('displays topBar when url is /user1', () => {
    const { container } = setup('/user1');
    const navigation = container.querySelector('nav');
    expect(navigation).toBeInTheDocument();
  });

  it('shows the UserSignupPage when clicking signup', () => {
    const { queryByText, container } = setup('/');
    const signupLink = queryByText('Sign Up');
    fireEvent.click(signupLink);
    const header = container.querySelector('h1');
    expect(header).toHaveTextContent('Sign Up');
  });
  it('shows the LoginPage when clicking login', () => {
    const { queryByText, container } = setup('/');
    const loginLink = queryByText('Login');
    fireEvent.click(loginLink);
    const header = container.querySelector('h1');
    expect(header).toHaveTextContent('Login');
  });

  it('shows the HomePage when clicking the logo', () => {
    const { queryByTestId, container } = setup('/login');
    const logo = container.querySelector('img');
    fireEvent.click(logo);
    expect(queryByTestId('homepage')).toBeInTheDocument();
  });
});
