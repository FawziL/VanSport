import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import i18n, { initPromise } from './i18n.js';
import './index.css';

async function bootstrap() {
  await initPromise;

  const urlMatch = window.location.pathname.match(/^\/(en|es)/);
  if (urlMatch && urlMatch[1] !== i18n.language) {
    await i18n.changeLanguage(urlMatch[1]);
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </StrictMode>
  );
}

bootstrap();
