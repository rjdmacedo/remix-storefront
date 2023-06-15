import React from 'react';
import type {CartLineInput} from '@shopify/hydrogen/storefront-api-types';
import {useFetcher, useMatches} from '@remix-run/react';
import {Button} from '~/components';
import {CartAction} from '~/lib/type';
import {VariantProps} from 'class-variance-authority';
import {buttonVariants} from '~/components/atoms/button/base-button';

export function AddToCartButton({
  lines,
  width = 'full',
  variant = 'default',
  children,
  disabled,
  analytics,
  className = '',
  ...props
}: {
  lines: CartLineInput[];
  width?: 'auto' | 'full';
  variant?: VariantProps<typeof buttonVariants>['variant'];
  children: React.ReactNode;
  disabled?: boolean;
  analytics?: unknown;
  className?: string;
  [key: string]: any;
}) {
  const [root] = useMatches();
  const fetcher = useFetcher();

  const selectedLocale = root?.data?.selectedLocale;
  const fetcherIsNotIdle = fetcher.state !== 'idle';

  return (
    <fetcher.Form action="/cart" method="post">
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />
      <input type="hidden" name="analytics" value={JSON.stringify(analytics)} />
      <input type="hidden" name="cartAction" value={CartAction.ADD_TO_CART} />
      <input type="hidden" name="countryCode" value={selectedLocale.country} />
      <Button
        as="button"
        type="submit"
        variant={variant}
        fullWidth={width === 'full'}
        disabled={disabled ?? fetcherIsNotIdle}
        className={className}
        {...props}
      >
        {children}
      </Button>
    </fetcher.Form>
  );
}
