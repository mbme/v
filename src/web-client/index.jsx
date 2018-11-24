import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import IsodbProvider from '../web-isodb-client/IsodbProvider';
import StoreProvider from './store';

const rootEl = document.getElementById('root');

ReactDOM.render(
  <StrictMode>
    <IsodbProvider>
      <StoreProvider>
        <h1>HELLO WORLD</h1>
      </StoreProvider>
    </IsodbProvider>
  </StrictMode>,
  rootEl,
  () => {
    rootEl.style.visibility = 'visible';
  },
);
