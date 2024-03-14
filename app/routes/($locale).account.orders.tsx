import type {MetaFunction} from '@remix-run/react';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';

import {routeHeaders} from '~/data/cache';
import {redirectWithError} from '~/lib/toast.server';

export const handle = {
  accountChild: true,
};

export const meta: MetaFunction = () => {
  return [{title: 'Orders'}];
};

export const headers = routeHeaders;

export async function loader({request, context}: LoaderFunctionArgs) {
  const user = await context.authenticator.isAuthenticated(request);

  return user
    ? json({user})
    : redirectWithError(
        '/login?redirect=/account/orders',
        'You must be logged in to view your orders',
      );
}

export default function AccountOrders() {
  return <span>Account Orders</span>;
}
