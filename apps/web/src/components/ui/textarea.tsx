import { cn } from '@/lib/utils';
import * as React from 'react';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn('w-full rounded-md border p-3 resize-none focus-ring', className)}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';


