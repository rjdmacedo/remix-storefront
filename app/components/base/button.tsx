import clsx from 'clsx';
import React, {forwardRef} from 'react';
import {Link} from '@remix-run/react';

import {missingClass} from '~/lib/utils';

type ButtonProps = {
  as?: React.ElementType;
  width?: 'auto' | 'full';
  variant?: 'primary' | 'secondary' | 'inline';
  className?: string;
  [key: string]: any;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      as = 'button',
      width = 'auto',
      variant = 'primary',
      className = '',
      ...props
    },
    ref,
  ) => {
    const Component = props?.to ? Link : as;

    const baseClasses =
      'inline-block rounded font-medium text-center py-3 px-6';

    const variants = {
      inline: 'border-b border-primary/10 leading-none pb-1',
      primary: `${baseClasses} bg-primary text-contrast`,
      secondary: `${baseClasses} border border-primary/10 bg-contrast text-primary`,
    };

    const widths = {
      auto: 'w-auto',
      full: 'w-full',
    };

    const styles = clsx(
      missingClass(className, 'bg-') && variants[variant],
      missingClass(className, 'w-') && widths[width],
      className,
    );

    return (
      <Component
        // @todo: not supported until react-router makes it into Remix.
        // preventScrollReset={true}
        className={styles}
        {...props}
        ref={ref}
      />
    );
  },
);
