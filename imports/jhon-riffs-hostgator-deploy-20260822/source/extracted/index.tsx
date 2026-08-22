import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // Assumindo que App.tsx é o componente principal

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
