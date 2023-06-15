import React, {useMemo} from 'react';
import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '~/lib/utils';
import {Spinner} from '~/components';
import {Link} from '@remix-run/react';

export const baseButtonVariants = cva(
  'relative font-medium text-center inline-flex align-middle outline-none items-center justify-center whitespace-nowrap',
  {
    variants: {
      size: {
        xs: 'text-xs h-6 min-w-6 px-2',
        sm: 'text-sm h-8 min-w-8 px-4',
        md: 'text-base h-10 min-w-10 px-6',
        lg: 'text-lg h-12 min-w-12 px-8',
        xl: 'text-xl h-14 min-w-14 px-10',
      },
      rounded: {
        none: 'rounded-none',
        md: 'rounded-md',
        full: 'rounded-full',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      size: 'md',
      rounded: 'md',
      fullWidth: false,
    },
  },
);

const solidVariants = cva('', {
  variants: {
    variant: {
      default: [
        'bg-primary text-contrast',
        'hover:bg-primary/80',
        'focus:bg-primary/80 focus:ring-primary/80',
        'active:bg-contrast active:text-primary',
      ],
      secondary: [
        'text-primary bg-primary/20',
        'hover:bg-primary/30',
        'focus:bg-primary/30 focus:ring-primary/30',
        'active:bg-contrast',
      ],
      danger: [
        'text-error bg-error/10 border-error',
        'hover:bg-error/30',
        'focus:ring-error',
        'active:bg-error active:text-white',
      ],
    },
  },
});

const ghostVariants = cva('', {
  variants: {
    variant: {
      default: [
        'text-primary',
        'hover:bg-primary/20',
        'active:bg-primary/30',
        'border-primary',
      ],
      danger: [
        'text-error border-error',
        'hover:bg-error/30',
        'focus:ring-error',
        'active:bg-error active:text-white',
      ],
    },
  },
});

export const buttonVariants = cva(
  [
    'active:translate-y-px',
    'duration-300 transition-all',
    'focus:ring-2 focus:ring-blue-500',
    'disabled:opacity-50 disabled:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        // link
        link: [
          'text-primary',
          'bg-transparent',
          'hover:underline',
          'underline-offset-4',
          'focus:ring-offset-0',
          'active:underline',
        ],
        // solid
        danger: solidVariants({variant: 'danger'}),
        default: solidVariants({variant: 'default'}),
        secondary: solidVariants({variant: 'secondary'}),
        // unstyled
        unstyled: '',
        // ghost
        ghost: ghostVariants({variant: 'default'}),
        'ghost-danger': ghostVariants({variant: 'danger'}),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BaseButtonProps = React.ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof baseButtonVariants> & {
    as?: React.ElementType;
    loading?: boolean;
    leftIcon?: React.ReactElement;
    rightIcon?: React.ReactElement;
    [key: string]: any;
  };

export const BaseButton = React.forwardRef<
  React.ElementRef<'button'>,
  BaseButtonProps
>(
  (
    {
      as = 'button',
      size,
      rounded,
      loading,
      leftIcon,
      children,
      disabled,
      rightIcon,
      className,
      fullWidth,
      ...props
    },
    ref,
  ) => {
    const Component = props?.to ? Link : as;

    const {icon, iconPlacement} = useMemo(() => {
      let icon = rightIcon ? rightIcon : leftIcon;

      if (loading) {
        icon = <Spinner show className="m-0" />;
      }

      return {
        icon,
        iconPlacement: rightIcon ? ('right' as const) : ('left' as const),
      };
    }, [loading, leftIcon, rightIcon]);

    return (
      <Component
        // @todo: not supported until react-router makes it into Remix.
        // preventScrollReset={true}
        ref={ref}
        disabled={disabled || loading}
        data-state={loading ? 'loading' : undefined}
        className={cn(
          baseButtonVariants({size, rounded, fullWidth, className}),
        )}
        {...props}
      >
        {icon && iconPlacement === 'left' ? (
          <span
            className={cn(
              {'mr-2': !!children},
              'inline-flex shrink-0 self-center',
            )}
          >
            {icon}
          </span>
        ) : null}
        {children}
        {icon && iconPlacement === 'right' ? (
          <span
            className={cn(
              {'ml-2': !!children},
              'inline-flex shrink-0 self-center',
            )}
          >
            {icon}
          </span>
        ) : null}
      </Component>
    );
  },
);

BaseButton.displayName = 'BaseButton';
