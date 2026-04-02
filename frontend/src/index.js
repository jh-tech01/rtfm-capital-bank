import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n'; // Import i18n configuration
import App from './App';

// Function to remove preloader
const removePreloader = () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.classList.add('hide-preloader');
    setTimeout(() => {
      if (preloader.parentNode) {
        preloader.parentNode.removeChild(preloader);
      }
    }, 800);
  }
};

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Remove preloader after app is mounted
window.addEventListener('load', () => {
  setTimeout(removePreloader, 1000);
});

setTimeout(removePreloader, 3000);