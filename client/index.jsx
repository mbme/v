import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { Store } from './store';
import AppView from './chrome/AppView';

import { init as initStyles } from './styles';

global.noop = () => {};

initStyles();

const rootEl = document.getElementById('root');

ReactDOM.render(
  <StrictMode>
    <Store>
      <AppView />
    </Store>
  </StrictMode>,
  rootEl,
  () => {
    rootEl.style.visibility = 'visible';
  },
);
