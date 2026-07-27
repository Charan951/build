import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'lime';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  whileHover?: HTMLMotionProps<'button'>['whileHover'];
  whileTap?: HTMLMotionProps<'button'>['whileTap'];
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      className = '',
      whileHover = { scale: 1.03 },
      whileTap = { scale: 0.97 },
      type = 'button',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-5 py-2.5 text-sm font-medium',
      md: 'px-7 py-3.5 text-base font-semibold',
      lg: 'px-9 py-4.5 text-lg font-bold',
    };

    const variantClasses = {
      primary:
        'bg-dark text-white border border-dark/20 hover:bg-primary hover:text-dark hover:border-primary transition-all duration-300 shadow-soft',
      secondary:
        'bg-white text-dark border border-dark/15 hover:bg-primary hover:border-primary transition-all duration-300 shadow-glass',
      ghost:
        'bg-transparent text-dark hover:text-primary transition-colors underline-offset-4 hover:underline',
      lime:
        'bg-primary text-dark font-bold hover:bg-dark hover:text-white transition-all duration-300 shadow-soft',
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={whileHover}
        whileTap={whileTap}
        className={`rounded-button inline-flex items-center justify-center cursor-pointer select-none gap-2 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...(props as any)}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
