import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import App from './App.jsx';
import { store } from './store/store.js';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  
    <BrowserRouter>
      <Provider store={store}>
        <App />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#6366f1',
                secondary: '#fff',
              },
            },
          }}
        />
      </Provider>
    </BrowserRouter>

);