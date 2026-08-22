import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import {LanguageProvider} from './context/LanguageContext';
import {ThemeProvider} from './context/ThemeContext';
import {router} from './router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
);
