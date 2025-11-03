import { cn } from '@/lib/utils';
import * as React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn('w-full h-10 rounded-md border px-3 focus-ring', className)}
      {...props}
    />
  );
});

Input.displayName = 'Input';


