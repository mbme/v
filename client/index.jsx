import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import reduxThunk from 'redux-thunk';

import createApiClient from 'shared/api-client';
import createNetwork, { UnauthorizedError } from './utils/platform';
import routerMiddleware, { propagateCurrentLocation } from './router';
import rootReducer from './reducers';
import { showToast, showLocker, setAuthorized } from './chrome/actions';
import AppView from './chrome/AppView';
import { init as initStyles } from './styles';

global.noop = () => {};

initStyles();

const network = createNetwork();

const store = createStore(
  rootReducer,
  applyMiddleware(
    reduxThunk.withExtraArgument(createApiClient('', network)),
    routerMiddleware,
  ),
);

network.events.on('start', () => {
  store.dispatch(showLocker(true));
});

network.events.on('error', (e) => {
  if (e instanceof UnauthorizedError) {
    store.dispatch(setAuthorized(false));
  }
  store.dispatch(showToast(e.toString()));
  store.dispatch(showLocker(false));
});

network.events.on('end', () => {
  store.dispatch(showLocker(false));
});

store.dispatch(propagateCurrentLocation()); // use current location

ReactDOM.render(
  <Provider store={store}>
    <StrictMode>
      <AppView />
    </StrictMode>
  </Provider>,
  document.getElementById('root'),
);
