import React from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base = "inline-flex items-center justify-center font-medium rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-500 focus:ring-2 focus:ring-offset-2 focus:ring-brand-300",
  secondary: "bg-surface-200 text-text-default hover:bg-surface-100",
  ghost: "bg-transparent text-brand-600 hover:bg-brand-50",
  danger: "bg-danger-500 text-white hover:bg-red-600"
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-3 text-lg"
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', className, children, ...rest }) => {
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
};

export default Button;
