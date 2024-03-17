import React from 'react';
import {CartForm} from '@shopify/hydrogen';
import type {CartLineInput} from '@shopify/hydrogen/storefront-api-types';
import type {FetcherWithComponents} from '@remix-run/react';

import {cn} from '~/lib/utils';
import {Button, ButtonProps} from '~/components/ui';
import {UpdateIcon} from '@radix-ui/react-icons';

export function AddToCartButton({
  lines,
  disabled,
  children,
  analytics,
  className,
  onSuccess,
  ...rest
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: CartLineInput[];
  onSuccess?: () => void;
} & ButtonProps) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => {
        React.useEffect(() => {
          if (fetcher.state === 'idle' && fetcher.data) {
            onSuccess?.();
          }
        }, [fetcher]);

        return (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <Button
              {...rest}
              type="submit"
              disabled={disabled ?? fetcher.state !== 'idle'}
              className={cn('w-full', className)}
            >
              {fetcher.state !== 'idle' ? (
                <UpdateIcon className="h-4 w-4 animate-spin" />
              ) : (
                children
              )}
            </Button>
          </>
        );
      }}
    </CartForm>
  );
}
