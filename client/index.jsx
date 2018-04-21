import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { Store } from 'client/store';
import AppView from './chrome/AppView';

import { init as initStyles } from './styles';

global.noop = () => {};

initStyles();

ReactDOM.render(
  <StrictMode>
    <Store>
      <AppView />
    </Store>
  </StrictMode>,
  document.getElementById('root'),
);
