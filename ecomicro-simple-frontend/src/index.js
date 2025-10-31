import React from 'react';
import ReactDOM from 'react-dom/client';
import './tailwind.css';

import App from './App';
import './tailwind.css'; // ✅ compiled CSS from Tailwind CLI

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
