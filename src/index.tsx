import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import App_w from './App';
import './index.css';

import store from './app/store'
import { Provider } from 'react-redux';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App_w/>
    </Provider>
  </React.StrictMode>
);