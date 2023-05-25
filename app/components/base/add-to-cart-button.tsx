import React from 'react';
import type {CartLineInput} from '@shopify/hydrogen/storefront-api-types';
import {useFetcher, useMatches} from '@remix-run/react';
import {Button} from '~/components';
import {CartAction} from '~/lib/type';

export function AddToCartButton({
  lines,
  width = 'full',
  variant = 'primary',
  children,
  disabled,
  analytics,
  className = '',
  ...props
}: {
  lines: CartLineInput[];
  width?: 'auto' | 'full';
  variant?: 'primary' | 'secondary' | 'inline';
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
      <input type="hidden" name="cartAction" value={CartAction.ADD_TO_CART} />
      <input type="hidden" name="countryCode" value={selectedLocale.country} />
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />
      <input type="hidden" name="analytics" value={JSON.stringify(analytics)} />
      <Button
        as="button"
        type="submit"
        width={width}
        variant={variant}
        className={className}
        disabled={disabled ?? fetcherIsNotIdle}
        {...props}
      >
        {children}
      </Button>
    </fetcher.Form>
  );
}
