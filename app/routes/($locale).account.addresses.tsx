import React from 'react';
import {json} from '@shopify/remix-oxygen';
import {PlusIcon} from '@heroicons/react/24/outline';
import {flattenConnection} from '@shopify/hydrogen';
import type {MetaFunction} from '@remix-run/react';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

import {cn} from '~/lib/utils';
import {useAccount} from '~/routes/($locale).account';
import {routeHeaders} from '~/data/cache';
import {redirectWithError} from '~/lib/toast.server';
import {AccountAddressBook, Link} from '~/components';
import {buttonVariants, Separator, Typography} from '~/components/ui';

export const handle = {
  accountChild: true,
};

export const meta: MetaFunction = () => {
  return [{title: 'Addresses'}];
};

export const headers = routeHeaders;

export async function loader({request, context}: LoaderFunctionArgs) {
  const user = await context.authenticator.isAuthenticated(request);

  return user
    ? json({user})
    : redirectWithError(
        '/login?redirect=/account/addresses',
        'You must be logged in to view your addresses.',
      );
}

export default function AccountAddresses() {
  const {customer} = useAccount();

  const addresses = flattenConnection(customer?.addresses);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Typography.Title size="xl">
          <Typography.Title size="xl">Address Book</Typography.Title>
        </Typography.Title>
        <Typography.Text size="sm" color="muted-foreground">
          Update your address book.
        </Typography.Text>

        <Link
          to="../address/add"
          className={cn(
            buttonVariants({
              variant: 'secondary',
            }),
            'absolute top-0 right-0',
          )}
        >
          <PlusIcon className="w-5 h-5 mr-1" />
          Address
        </Link>
      </div>

      <Separator />

      <AccountAddressBook customer={customer} addresses={addresses} />
    </div>
  );
}
