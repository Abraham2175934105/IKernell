import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { DynamicBackground } from './DynamicBackground';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <DynamicBackground />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
