import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'lime' | 'dark' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'lime', className = '' }) => {
  const variantClasses = {
    lime: 'bg-primary/20 text-dark border border-primary/40',
    dark: 'bg-dark text-primary border border-dark',
    outline: 'bg-white/60 text-dark border border-dark/15',
  };

  return (
    <span
      className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
