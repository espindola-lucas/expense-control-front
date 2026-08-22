import React from 'react';

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}) => {
  const base = "px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer";
  const variants = {
    primary: "bg-white text-black hover:bg-neutral-200",
    secondary: "bg-neutral-800 text-white hover:bg-neutral-700",
    outline: "border border-neutral-700 text-white hover:bg-neutral-800",
    ghost: "text-neutral-400 hover:text-white hover:bg-neutral-800",
    danger: "text-red-400 hover:bg-red-500/10"
  };

  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};
