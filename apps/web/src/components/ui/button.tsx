import { cn } from '@/lib/utils';
import * as React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-lg focus-ring transition-colors disabled:opacity-50 disabled:pointer-events-none font-medium';
    const variants = variant === 'outline'
      ? 'border border-primary bg-primary hover:bg-secondary text-text-primary'
      : 'bg-inverse text-text-inverse hover:opacity-90';
    const sizes = size === 'sm' ? 'h-8 px-3 text-sm' : 'h-9 px-6 text-base';
    return (
      <button ref={ref} className={cn(base, variants, sizes, className)} {...props} />
    );
  }
);

Button.displayName = 'Button';


