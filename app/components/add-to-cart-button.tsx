import type {CartLineInput} from '@shopify/hydrogen/storefront-api-types';
import type {ShopifyAddToCartPayload} from '@shopify/hydrogen';
import {
  AnalyticsEventName,
  CartForm,
  getClientBrowserParameters,
  sendShopifyAnalytics,
} from '@shopify/hydrogen';
import type {FetcherWithComponents} from '@remix-run/react';
import React, {useEffect} from 'react';
import {UpdateIcon} from '@radix-ui/react-icons';

import {usePageAnalytics} from '~/hooks';
import type {ButtonProps} from '~/components/ui';
import {Button} from '~/components/ui';
import {cn} from '~/lib/utils';

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
        // The action from an "actionSubmission" returned "data" and the loaders on the page are being reloaded.
        if (fetcher.state === 'loading') {
          onSuccess?.();
        }

        return (
          <AddToCartAnalytics fetcher={fetcher}>
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
          </AddToCartAnalytics>
        );
      }}
    </CartForm>
  );
}

function AddToCartAnalytics({
  fetcher,
  children,
}: {
  fetcher: FetcherWithComponents<any>;
  children: React.ReactNode;
}): JSX.Element {
  const fetcherData = fetcher.data;
  const formData = fetcher.formData;
  const pageAnalytics = usePageAnalytics({hasUserConsent: true});

  useEffect(() => {
    if (formData) {
      const cartData: Record<string, unknown> = {};
      const cartInputs = CartForm.getFormInput(formData);

      try {
        if (cartInputs.inputs.analytics) {
          const dataInForm: unknown = JSON.parse(
            String(cartInputs.inputs.analytics),
          );
          Object.assign(cartData, dataInForm);
        }
      } catch {
        // do nothing
      }

      if (Object.keys(cartData).length && fetcherData) {
        const addToCartPayload: ShopifyAddToCartPayload = {
          ...getClientBrowserParameters(),
          ...pageAnalytics,
          ...cartData,
          cartId: fetcherData.cart.id,
        };

        sendShopifyAnalytics({
          eventName: AnalyticsEventName.ADD_TO_CART,
          payload: addToCartPayload,
        });
      }
    }
  }, [fetcherData, formData, pageAnalytics]);
  return <>{children}</>;
}
