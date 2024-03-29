import * as React from 'react';

import {cn} from '~/lib/utils';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({type, prefix, suffix, className, ...props}, ref) => {
    return (
      <div className={cn((suffix || prefix) && 'relative', className)}>
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-1.5">
            {prefix}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            prefix && 'pl-8',
            suffix && 'pr-8',
          )}
          ref={ref}
          {...props}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
            {suffix}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export {Input};
