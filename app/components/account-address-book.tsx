import React from 'react';
import {StarIcon} from '@heroicons/react/24/solid';
import {PersonIcon, SewingPinIcon} from '@radix-ui/react-icons';
import type {MailingAddress} from '@shopify/hydrogen/storefront-api-types';

import {
  Card,
  Button,
  Typography,
  CardFooter,
  CardContent,
} from '~/components/ui';
import {
  AccountAddressEditDialog,
  AccountAddressDeleteDialog,
} from '~/components';
import type {CustomerDetailsFragment} from 'storefrontapi.generated';
import {
  BriefcaseIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import {useFetcher} from '@remix-run/react';

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
    <div className="grid gap-4">
      {!addresses?.length && (
        <Typography.Text className="mb-1" as="p">
          You haven&apos;t saved any addresses yet.
        </Typography.Text>
      )}

      {Boolean(addresses?.length) && (
        <>
          {customer.defaultAddress && (
            <AddressCard
              address={customer.defaultAddress}
              customer={customer}
              onEdit={handleOnEdit}
              onDelete={handleOnDelete}
              defaultAddress
            />
          )}
          {addresses
            .filter((address) => address.id !== customer.defaultAddress?.id)
            .map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                customer={customer}
                onEdit={handleOnEdit}
                onDelete={handleOnDelete}
              />
            ))}
        </>
      )}

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
  );
}

function AddressCard({
  address,
  customer,
  onEdit,
  onDelete,
  defaultAddress,
}: {
  address: MailingAddress;
  customer: CustomerDetailsFragment;
  onEdit: (address: MailingAddress) => void;
  onDelete: (address: MailingAddress) => void;
  defaultAddress?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-6">
        <AddressCardSection
          icon={<PersonIcon className="h-6 w-6" />}
          header="Name"
          content={`${address.firstName} ${address.lastName}`}
        />
        <AddressCardSection
          icon={<SewingPinIcon className="h-6 w-6" />}
          header="Address"
          content={
            <div className="flex flex-col space-y-1">
              <Typography.Text size="sm" weight="light">
                {[address.address1, address.address2]
                  .filter(Boolean)
                  .join(', ')}
              </Typography.Text>
              <Typography.Text size="sm" weight="light">
                {[address.city, address.zip, address.province]
                  .filter(Boolean)
                  .join(', ')}
              </Typography.Text>
              <Typography.Text size="sm" weight="light">
                {address.country}
              </Typography.Text>
            </div>
          }
        />
        {address.company && (
          <AddressCardSection
            icon={<BriefcaseIcon className="h-6 w-6" />}
            header="Company"
            content={address.company}
          />
        )}
        {(address.phone || customer.email) && (
          <AddressCardSection
            icon={<DevicePhoneMobileIcon className="h-6 w-6" />}
            header="Contact"
            content={
              <div className="flex flex-col space-y-1">
                <Typography.Text size="sm" weight="light">
                  {address.phone}
                </Typography.Text>
                <Typography.Text size="sm" weight="light">
                  {customer.email}
                </Typography.Text>
              </div>
            }
          />
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button size="sm" onClick={() => onEdit(address)}>
          Edit
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDelete(address)}>
          Delete
        </Button>

        <DefaultAddressButton
          address={address}
          defaultAddress={defaultAddress}
        />
      </CardFooter>
    </Card>
  );
}

function DefaultAddressButton({
  address,
  defaultAddress,
}: {
  address: MailingAddress;
  defaultAddress?: boolean;
}) {
  const fetcher = useFetcher();

  function handleOnClick() {
    fetcher.submit(
      {
        defaultAddress: true,
        'address-id': address?.id,
      },
      {
        method: 'post',
        action: `/account/address/${encodeURIComponent(address.id)}`,
      },
    );
  }

  if (defaultAddress)
    return (
      <>
        <StarIcon
          title="This address is your default address"
          className="h-6 w-6 fill-yellow-400 stroke-yellow-400"
        />
        <Typography.Text
          size="xs"
          weight="light"
          className="text-gray-500 dark:text-gray-400"
        >
          This address is your default address
        </Typography.Text>
      </>
    );

  return (
    <Button size="icon" type="submit" variant="ghost" onClick={handleOnClick}>
      <StarIcon
        title="This address is your default address"
        className="h-6 w-6 fill-yellow-400 stroke-yellow-400"
      />
    </Button>
  );
}

function AddressCardSection({
  icon,
  header,
  content,
}: {
  icon: React.ReactNode;
  header: string;
  content: React.ReactNode | string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="flex flex-col">
        <h3 className="font-semibold">{header}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{content}</p>
      </div>
    </div>
  );
}
