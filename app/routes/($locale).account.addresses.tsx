import React from 'react';
import {flattenConnection} from '@shopify/hydrogen';
import type {MetaFunction} from '@remix-run/react';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

import {cn} from '~/lib/utils';
import {useAccount} from '~/routes/($locale).account';
import {routeHeaders} from '~/data/cache';
import {redirectWithError} from '~/lib/toast.server';
import {AccountAddressBook, AccountAddressAddDialog, Link} from '~/components';
import {Button, buttonVariants, Separator, Typography} from '~/components/ui';
import {PlusIcon} from '@radix-ui/react-icons';

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
    ? null
    : redirectWithError(
        '/login?redirect=/account/addresses',
        'You must be logged in to view your addresses.',
      );
}

export default function AccountAddresses() {
  const {customer} = useAccount();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

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

        <Button
          variant="secondary"
          className="absolute top-0 right-0"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <PlusIcon className="w-5 h-5 mr-1" />
          Address
        </Button>
      </div>

      <Separator />

      <AccountAddressBook customer={customer} addresses={addresses} />

      <AccountAddressAddDialog
        open={isAddDialogOpen}
        setOpen={setIsAddDialogOpen}
      />
    </div>
  );
}
