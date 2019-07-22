import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { HashRouter } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import App from './containers/App';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import authReducer from './redux/authReducer';
import logger from 'redux-logger';

const store = createStore(authReducer, applyMiddleware(logger));

ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
