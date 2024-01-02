import {
  StarIcon,
  TrashIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import {Form} from '@remix-run/react';
import type {MailingAddress} from '@shopify/hydrogen/storefront-api-types';

import {
  Button,
  Dialog,
  Typography,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from '~/components/ui';
import {
  AccountAddressDeleteDialog,
  AccountAddressEditDialog,
} from '~/components';
import type {CustomerDetailsFragment} from 'storefrontapi.generated';

export function AccountAddressBook({
  customer,
  addresses,
}: {
  customer: CustomerDetailsFragment;
  addresses: MailingAddress[];
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const [address, setAddress] = React.useState<MailingAddress>();

  React.useEffect(() => {
    if (!isEditDialogOpen && !isDeleteDialogOpen) {
      setAddress(undefined);
    }
  }, [isEditDialogOpen, isDeleteDialogOpen]);

  const handleOnEdit = (address: MailingAddress) => {
    setAddress(address);
    setIsEditDialogOpen(true);
  };

  const handleOnDelete = (address: MailingAddress) => {
    setAddress(address);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="grid w-full gap-4">
        {!addresses?.length && (
          <Typography.Text className="mb-1" as="p">
            You haven&apos;t saved any addresses yet.
          </Typography.Text>
        )}

        <div className="@container/addresses">
          {Boolean(addresses?.length) && (
            <div className="grid grid-cols-1 gap-6 @xl/addresses:grid-cols-2 @2xl/addresses:grid-cols-3">
              {customer.defaultAddress && (
                <Address
                  address={customer.defaultAddress}
                  onEdit={handleOnEdit}
                  onDelete={handleOnDelete}
                  defaultAddress
                />
              )}
              {addresses
                .filter((address) => address.id !== customer.defaultAddress?.id)
                .map((address) => (
                  <Address
                    key={address.id}
                    address={address}
                    onEdit={handleOnEdit}
                    onDelete={handleOnDelete}
                  />
                ))}

              <AccountAddressEditDialog
                open={isEditDialogOpen}
                address={address!}
                setOpen={setIsEditDialogOpen}
                defaultAddress={address?.id === customer.defaultAddress?.id}
              />

              <AccountAddressDeleteDialog
                open={isDeleteDialogOpen}
                address={address!}
                setOpen={setIsDeleteDialogOpen}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Address({
  address,
  onEdit,
  onDelete,
  defaultAddress,
}: {
  address: MailingAddress;
  onEdit: (address: MailingAddress) => void;
  onDelete: (address: MailingAddress) => void;
  defaultAddress?: boolean;
}) {
  return (
    <div className="@container/address relative flex flex-col rounded border shadow-lg py-2 px-4">
      {defaultAddress && (
        <StarIcon
          title="This address is your default address"
          className="absolute top-4 right-4 @md/address:top-6 @md/address:right-6 w-6 h-6 fill-yellow-400 stroke-yellow-400"
        />
      )}
      <ul className="flex-1 flex-row">
        {(address.firstName || address.lastName) && (
          <li>
            {'' +
              (address.firstName && address.firstName + ' ') +
              address?.lastName}
          </li>
        )}
        {address.formatted &&
          address.formatted.map((line: string) => <li key={line}>{line}</li>)}
      </ul>

      <div className="mt-3 flex flex-row justify-end">
        <Button variant="ghost" size="icon" onClick={() => onEdit(address)}>
          <PencilSquareIcon
            title="Edit this address"
            className="h-5 w-5 stroke-primary"
          />
        </Button>

        <Button variant="ghost" size="icon" onClick={() => onDelete(address)}>
          <TrashIcon
            title="Delete this address"
            className="h-5 w-5 stroke-destructive"
          />
        </Button>
      </div>
    </div>
  );
}
