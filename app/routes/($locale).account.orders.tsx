import {json} from '@shopify/remix-oxygen';
import type {MetaFunction} from '@remix-run/react';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

import {routeHeaders} from '~/data/cache';
import {requireLoggedInUser} from '~/lib/utils';

export const handle = {
  accountChild: true,
};

export const meta: MetaFunction = () => {
  return [{title: 'Orders'}];
};

export const headers = routeHeaders;

export async function loader({params, context}: LoaderFunctionArgs) {
  await requireLoggedInUser(context, {
    locale: params.locale,
    redirectTo: '/account/orders',
  });

  return json(null);
}

export default function AccountOrders() {
  return <span>Account Orders</span>;
}
