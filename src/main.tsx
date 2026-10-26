import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { SensoryProvider } from './context/SensoryContext';
import { AppProvider } from './context/AppContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SensoryProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </SensoryProvider>
    </ThemeProvider>
  </React.StrictMode>
);
