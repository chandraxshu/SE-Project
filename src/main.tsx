import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '10px',
                background: '#1c1917',
                color: '#fafaf9',
                fontSize: '0.875rem',
                border: '1px solid #44403c',
              },
            }}
          />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
