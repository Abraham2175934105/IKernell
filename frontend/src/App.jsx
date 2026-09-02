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
          duration: 3000,
          style: {
            background: 'rgba(255, 255, 255, 0.85)',
            color: '#09090b',
            border: '1px solid rgba(228, 228, 231, 0.8)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '12px 18px',
            fontSize: '0.8rem',
            fontWeight: '700',
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
          },
          success: {
            duration: 3000,
            style: {
              background: 'rgba(236, 253, 245, 0.92)',
              color: '#065f46',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderLeft: '4px solid #10b981',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#ecfdf5',
            },
          },
          error: {
            duration: 3000,
            style: {
              background: 'rgba(254, 242, 242, 0.92)',
              color: '#991b1b',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderLeft: '4px solid #ef4444',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fef2f2',
            },
          },
        }}
      />
      <AppRouter />
    </>
  );
}

export default App;
