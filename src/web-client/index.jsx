import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import StoreProvider from './store';
import { IsodbContext } from './isodb';

const rootEl = document.getElementById('root');

ReactDOM.render(
  <StrictMode>
    <IsodbContext.Provider>
      <StoreProvider>
        <h1>HELLO WORLD</h1>
      </StoreProvider>
    </IsodbContext.Provider>
  </StrictMode>,
  rootEl,
  () => {
    rootEl.style.visibility = 'visible';
  },
);
