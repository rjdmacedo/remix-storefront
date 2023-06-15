import clsx from 'clsx';
import React, {ComponentProps, forwardRef, useId} from 'react';

import {missingClass} from '~/lib/utils';
import type {Status} from '~/lib/type';

type BeforeProps =
  | {
      prefix?: never;
      addonBefore?: React.ReactNode;
    }
  | {
      prefix?: React.ReactNode;
      addonBefore?: never;
    };

type AfterProps =
  | {
      suffix?: never;
      addonAfter?: React.ReactNode;
    }
  | {
      suffix?: React.ReactNode;
      addonAfter?: never;
    };

type InputProps = {
  label?: string; // The label text for the input field
  width?: 'auto' | 'full'; // The width of the input field
  height?: 'sm' | 'md' | 'lg'; // The size of the input field
  status?: Status; // The status of the input field
  className?: string; // The class name(s) to add to the component's container
} & BeforeProps &
  AfterProps;

export const Input = forwardRef<
  HTMLInputElement,
  Omit<ComponentProps<'input'>, 'prefix'> & InputProps
>(
  (
    {
      width = 'auto',
      label,
      height = 'md',
      prefix,
      suffix,
      className = '',
      addonAfter,
      addonBefore,
      ...props
    },
    ref,
  ) => {
    const id = useId();

    const widths = {
      auto: 'w-auto',
      full: 'w-full',
    };

    const heights = {
      sm: 'h-8',
      md: 'h-10',
      lg: 'h-12',
    };

    // from className param, isolate and extract widths with "w-" prefix
    const extractWidthsFromClassName = (className: string) => {
      const classes = className.split(' ');
      // find all classes with "w-" prefix. e.g. "w-1/2" or "w-full" or "max-w-2xl". "shadow-xl" is ignored.
      return classes.filter((c) => c.match(/w-[\w-]+/));
    };

    return (
      <div
        className={clsx('flex flex-col', extractWidthsFromClassName(className))}
      >
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium leading-6 text-primary"
          >
            {label}
          </label>
        )}
        <div className="relative mt-2 h-full w-full rounded-md shadow-sm">
          {addonBefore && (
            <div className="absolute inset-y-0 left-0 flex items-center">
              {addonBefore}
            </div>
          )}
          {prefix && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              {prefix}
            </div>
          )}
          <input
            {...props}
            id={id}
            className={clsx(
              'block w-full rounded-md border-0 bg-contrast py-1.5 text-primary ring-1 ring-inset ring-primary/30 placeholder:text-primary/30 sm:text-sm sm:leading-6',
              missingClass(className, 'h-') && heights[height],
              className,
            )}
          />
          {suffix && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {suffix}
            </div>
          )}
          {addonAfter && (
            <div className="absolute inset-y-0 right-0 flex items-center">
              {addonAfter}
            </div>
          )}
        </div>
      </div>
    );
  },
);
