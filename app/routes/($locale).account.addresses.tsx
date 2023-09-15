import React from 'react';
import {flattenConnection} from '@shopify/hydrogen';
import {PlusIcon} from '@heroicons/react/24/outline';

import {useAccount} from '~/routes/($locale).account';
import {Button, Typography} from '~/components/ui';

export const handle = {
  accountChild: true,
};

export default function AccountAddresses() {
  const {customer} = useAccount();

  const addresses = flattenConnection(customer?.addresses);

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <Typography.Title size="xl">Address Book</Typography.Title>
          <Typography.Text size="sm" color="muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          </Typography.Text>
        </div>

        <Button>
          <PlusIcon className="w-5 h-5 mr-1" />
          Address
        </Button>
      </div>

      {addresses?.map((address) => (
        <div key={address.id} className="py-8">
          <Typography.Title size="sm">
            {address.firstName} {address.lastName}
          </Typography.Title>
          <Typography.Text size="sm">{address.address1}</Typography.Text>
          <Typography.Text size="sm">{address.address2}</Typography.Text>
          <Typography.Text size="sm">
            {address.city} {address.zip}
          </Typography.Text>
          <Typography.Text size="sm">{address.country}</Typography.Text>
          <Typography.Text size="sm">{address.phone}</Typography.Text>
        </div>
      ))}
    </>
  );
}
