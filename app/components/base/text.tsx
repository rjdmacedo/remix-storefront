import clsx from 'clsx';
import React from 'react';

import {formatText, cn} from '~/lib/utils';
import type {Colors} from '~/lib/const';

export function Text({
  children,
  as: Component = 'span',
  size = 'copy',
  color = 'default',
  width = 'default',
  format,
  className,
  ...props
}: {
  children: React.ReactNode;
  as?: React.ElementType;
  size?: 'lead' | 'copy' | 'fine';
  color?: (typeof Colors)[number];
  width?: 'default' | 'narrow' | 'wide';
  format?: boolean;
  className?: string;
  [key: string]: any;
}) {
  const colors: Record<(typeof Colors)[number], string> = {
    default: 'inherit',
    primary: 'text-primary',
    'primary-foreground': 'text-primary-foreground',
    secondary: 'text-secondary',
    'secondary-foreground': 'text-secondary-foreground',
    destructive: 'text-destructive',
    'destructive-foreground': 'text-destructive-foreground',
    muted: 'text-muted',
    'muted-foreground': 'text-muted-foreground',
    accent: 'text-accent',
    'accent-foreground': 'text-accent-foreground',
  };

  const sizes: Record<string, string> = {
    lead: 'text-lead font-medium',
    copy: 'text-copy',
    fine: 'text-fine subpixel-antialiased',
  };

  const widths: Record<string, string> = {
    default: 'max-w-prose',
    narrow: 'max-w-prose-narrow',
    wide: 'max-w-prose-wide',
  };

  return (
    <Component
      className={cn(
        'whitespace-pre-wrap',
        widths[width],
        colors[color],
        sizes[size],
        className,
      )}
      {...props}
    >
      {format ? formatText(children) : children}
    </Component>
  );
}

export const Heading = React.forwardRef<
  HTMLHeadingElement,
  HeadingProps & React.HTMLAttributes<HTMLHeadingElement>
>(
  (
    {
      as: Component = 'h2',
      size = 'heading',
      width = 'default',
      format,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    const sizes = {
      display: 'font-bold text-display',
      heading: 'font-bold text-heading',
      lead: 'font-bold text-lead',
      copy: 'font-medium text-copy',
    };

    const widths = {
      default: 'max-w-prose',
      narrow: 'max-w-prose-narrow',
      wide: 'max-w-prose-wide',
    };

    return (
      <Component
        ref={ref}
        {...props}
        className={cn(sizes[size], widths[width], className)}
      >
        {format ? formatText(children) : children}
      </Component>
    );
  },
);

export function Section({
  children,
  as: Component = 'section',
  divider = 'none',
  display = 'grid',
  heading,
  padding = 'all',
  className,
  ...props
}: {
  children?: React.ReactNode;
  as?: React.ElementType;
  divider?: 'none' | 'top' | 'bottom' | 'both';
  display?: 'grid' | 'flex';
  heading?: string;
  padding?: 'x' | 'y' | 'swimlane' | 'all';
  className?: string;
  [key: string]: any;
}) {
  const paddings = {
    x: 'px-6 md:px-8 lg:px-12',
    y: 'py-6 md:py-8 lg:py-12',
    swimlane: 'pt-4 md:pt-8 lg:pt-12 md:pb-4 lg:pb-8',
    all: 'p-6 md:p-8 lg:p-12',
  };

  const dividers = {
    none: 'border-none',
    top: 'border-t border-primary/05',
    bottom: 'border-b border-primary/05',
    both: 'border-y border-primary/05',
  };

  const displays = {
    flex: 'flex',
    grid: 'grid',
  };

  const styles = cn(
    'w-full gap-4 md:gap-8',
    displays[display],
    dividers[divider],
    paddings[padding],
    className,
  );

  return (
    <Component {...props} className={styles}>
      {heading && (
        <Heading size="lead" className={padding === 'y' ? paddings['x'] : ''}>
          {heading}
        </Heading>
      )}
      {children}
    </Component>
  );
}

export function PageHeader({
  children,
  heading,
  variant = 'default',
  className,
  ...props
}: {
  children?: React.ReactNode;
  heading?: string;
  variant?: 'default' | 'blogPost' | 'allCollections';
  className?: string;
  [key: string]: any;
}) {
  const variants: Record<string, string> = {
    default: 'grid w-full gap-8 p-6 py-8 md:p-8 lg:p-12 justify-items-start',
    blogPost:
      'grid md:text-center w-full gap-4 p-6 py-8 md:p-8 lg:p-12 md:justify-items-center',
    allCollections:
      'flex justify-between items-baseline gap-8 p-6 md:p-8 lg:p-12',
  };

  const styles = clsx(variants[variant], className);

  return (
    <header {...props} className={styles}>
      {heading && (
        <Heading as="h1" width="narrow" size="heading" className="inline-block">
          {heading}
        </Heading>
      )}
      {children}
    </header>
  );
}

type HeadingProps = {
  as?: React.ElementType;
  size?: 'display' | 'heading' | 'lead' | 'copy';
  width?: 'default' | 'narrow' | 'wide';
  format?: boolean;
  children: React.ReactNode;
};
