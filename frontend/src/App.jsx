import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from './router/AppRouter';
import { PrimerLoginModal } from './components/auth/PrimerLoginModal';

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#111827',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <PrimerLoginModal />
      <AppRouter />
    </>
  );
}

export default App;
