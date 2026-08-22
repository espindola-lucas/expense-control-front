import React from 'react';

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-brand-surface border border-brand-border rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);
