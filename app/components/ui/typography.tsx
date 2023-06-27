import React from 'react';
import {cva} from 'class-variance-authority';
import type {VariantProps} from 'class-variance-authority';

import {cn, formatText} from '~/lib/utils';

const typographyVariants = cva('font-sans font-normal leading-normal', {
  variants: {
    size: {
      default: 'text-base',
      xs: 'text-xs',
      sm: 'text-sm',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
      '7xl': 'text-7xl',
      '8xl': 'text-8xl',
      '9xl': 'text-9xl',
    },
    weight: {
      default: 'font-normal',
      bold: 'font-bold',
      black: 'font-black',
      light: 'font-light',
      medium: 'font-medium',
      semibold: 'font-semibold',
      extrabold: 'font-extrabold',
      thin: 'font-thin',
    },
    color: {
      default: 'text-primary',
      primary: 'text-primary',
      'primary-foreground': 'text-primary-foreground',
      secondary: 'text-secondary',
      'secondary-foreground': 'text-secondary-foreground',
      accent: 'text-accent',
      'accent-foreground': 'text-accent-foreground',
      destructive: 'text-destructive',
      'destructive-foreground': 'text-destructive-foreground',
      muted: 'text-muted',
      'muted-foreground': 'text-muted-foreground',
    },
    align: {
      default: 'text-left',
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    decoration: {
      default: 'no-underline',
      underline: 'underline',
      'line-through': 'line-through',
      'no-underline': 'no-underline',
    },
    transform: {
      default: 'normal-case',
      uppercase: 'uppercase',
      lowercase: 'lowercase',
      capitalize: 'capitalize',
      'normal-case': 'normal-case',
    },
    spacing: {
      default: 'tracking-normal',
      tighter: 'tracking-tighter',
      tight: 'tracking-tight',
      normal: 'tracking-normal',
      wide: 'tracking-wide',
      wider: 'tracking-wider',
      widest: 'tracking-widest',
    },
    leading: {
      default: 'leading-normal',
      none: 'leading-none',
      tight: 'leading-tight',
      snug: 'leading-snug',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed',
      loose: 'leading-loose',
    },
  },
  defaultVariants: {
    size: 'default',
    weight: 'default',
    color: 'default',
    align: 'default',
    decoration: 'default',
    transform: 'default',
    spacing: 'default',
    leading: 'default',
  },
});

export interface TypographyProps
  extends VariantProps<typeof typographyVariants> {
  children: React.ReactNode;
  className?: string;
}

const Text = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> &
    TypographyProps & {
      as?: React.ElementType;
      format?: boolean;
    }
>(
  (
    {
      as: Component = 'span',
      size,
      align,
      color,
      weight,
      format,
      leading,
      spacing,
      children,
      transform,
      className,
      decoration,
      ...props
    },
    ref,
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          typographyVariants({
            size,
            align,
            color,
            weight,
            leading,
            spacing,
            transform,
            className,
            decoration,
          }),
        )}
        {...props}
      >
        {format ? formatText(children) : children}
      </Component>
    );
  },
);
Text.displayName = 'Text';

const Title = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> &
    TypographyProps & {
      as?: React.ElementType;
      format?: boolean;
    }
>(
  (
    {
      as: Component = 'h2',
      size = 'xl',
      align,
      color,
      weight,
      format,
      leading,
      spacing,
      children,
      transform,
      className,
      decoration,
      ...props
    },
    ref,
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          typographyVariants({
            size,
            align,
            color,
            weight,
            leading,
            spacing,
            transform,
            className,
            decoration,
          }),
        )}
        {...props}
      >
        {format ? formatText(children) : children}
      </Component>
    );
  },
);

export const Typography = Object.assign(Text, {
  Text,
  Title,
});
