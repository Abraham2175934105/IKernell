import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from './router/AppRouter';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        gutter={8}
        containerStyle={{ zIndex: 9999999 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(15, 17, 26, 0.92)',
            color: '#f4f4f5',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '14px',
            padding: '12px 16px',
            fontSize: '0.78rem',
            fontWeight: '600',
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset',
            maxWidth: '380px',
          },
          success: {
            duration: 3500,
            style: {
              background: 'rgba(10, 22, 18, 0.94)',
              borderLeft: '3px solid #10b981',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#052e16',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: 'rgba(22, 10, 10, 0.94)',
              borderLeft: '3px solid #ef4444',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#2d0000',
            },
          },
        }}
      />
      <AppRouter />
    </>
  );
}

export default App;
