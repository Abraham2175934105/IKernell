import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { DynamicBackground } from './DynamicBackground';
import { FloatingActions } from './FloatingActions';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden w-full max-w-[100vw]">
      <DynamicBackground />
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};
