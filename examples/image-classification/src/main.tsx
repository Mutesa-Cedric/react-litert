import App from './App';
import { defaultTheme, Provider } from '@adobe/react-spectrum';
import React from 'react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider theme={defaultTheme} colorScheme="dark">
      <App />
    </Provider>
  </React.StrictMode>
);
