import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import reduxThunk from 'redux-thunk';

import { Store } from 'client/store';
import createApiClient from 'shared/api-client';
import createNetwork from './utils/platform';
import routerMiddleware, { propagateCurrentLocation } from './router';
import rootReducer from './reducers';
import AppView from './chrome/AppView';
import NetworkEventsObserver from './chrome/NetworkEventsObserver';
import { init as initStyles } from './styles';

global.noop = () => {};

const network = createNetwork();
global.apiClient = createApiClient('', network);

initStyles();

const store = createStore(
  rootReducer,
  applyMiddleware(
    reduxThunk.withExtraArgument(apiClient),
    routerMiddleware,
  ),
);

store.dispatch(propagateCurrentLocation()); // use current location

ReactDOM.render(
  <Provider store={store}>
    <StrictMode>
      <Store>
        <AppView />
        <NetworkEventsObserver events={network.events} />
      </Store>
    </StrictMode>
  </Provider>,
  document.getElementById('root'),
);
