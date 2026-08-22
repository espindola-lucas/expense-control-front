import React from 'react';

export const Select = ({ children, className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition-colors ${className}`}
  >
    {children}
  </select>
);
