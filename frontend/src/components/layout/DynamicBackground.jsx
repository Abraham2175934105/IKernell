import React from 'react';

export const DynamicBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-zinc-50 dark:bg-zinc-950 tech-ambient-mesh bg-tech-grid transition-colors duration-300">
      {/* Floating Animated Ambient Glow Orbs with subtle presence */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/5 dark:bg-blue-600/10 blur-3xl animate-mesh-float"
      />
      <div 
        className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-cyan-400/5 dark:bg-cyan-500/10 blur-3xl animate-mesh-float"
        style={{ animationDelay: '-4s', animationDuration: '16s' }}
      />
      <div 
        className="absolute -bottom-32 left-1/4 w-[32rem] h-[32rem] rounded-full bg-purple-400/5 dark:bg-purple-600/10 blur-3xl animate-mesh-float"
        style={{ animationDelay: '-8s', animationDuration: '14s' }}
      />
    </div>
  );
};

