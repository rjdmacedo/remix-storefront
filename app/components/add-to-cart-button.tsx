import React from 'react';
import {CartForm} from '@shopify/hydrogen';
import {UpdateIcon} from '@radix-ui/react-icons';
import type {CartLineInput} from '@shopify/hydrogen/storefront-api-types';

import {cn} from '~/lib/utils';
import {Button, type ButtonProps} from '~/components/ui';

export function AddToCartButton({
  lines,
  children,
  variant = 'default',
  disabled,
  analytics,
  onSuccess,
  className = '',
  ...props
}: {
  lines: CartLineInput[];
  children: React.ReactNode;
  variant?: ButtonProps['variant'];
  disabled?: boolean;
  analytics?: unknown;
  onSuccess?: () => void;
  className?: string;
  [key: string]: any;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => {
        // when the form is submitted, we want to call onSuccess
        // if it's provided, and then reset the form
        React.useEffect(() => {
          // The action from an "actionSubmission" returned "data" and the loaders on the page are being reloaded.
          if (fetcher.state === 'loading' && fetcher.type === 'actionReload') {
            onSuccess?.();
          }
        }, [fetcher]);

        return (
          <>
            <input
              type="hidden"
              name="analytics"
              value={JSON.stringify(analytics)}
            />
            <Button
              type="submit"
              variant={variant}
              disabled={disabled ?? fetcher.state !== 'idle'}
              className={cn('w-full', className)}
              {...props}
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
