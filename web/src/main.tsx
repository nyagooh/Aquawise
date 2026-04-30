import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './lib/auth';
import './styles/shared.css';

const saved = (() => {
  try { return localStorage.getItem('aquawise-theme'); } catch { return null; }
})();
if (saved === 'light' || saved === 'dark') {
  document.documentElement.setAttribute('data-theme', saved);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
