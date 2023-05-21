import clsx from 'clsx';
import React from 'react';

export function Prose({
  as: Component = 'div',
  className,
  ...props
}: {
  as?: React.ElementType;
  className?: string;
  [key: string]: any;
}) {
  return (
    <Component
      className={clsx(className, 'prose dark:prose-invert')}
      {...props}
    />
  );
}
