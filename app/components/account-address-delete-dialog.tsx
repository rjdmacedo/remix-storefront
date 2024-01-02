import {Form as RemixForm, useFetcher} from '@remix-run/react';
import {z} from 'zod';
import React from 'react';
import validator from 'validator';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {PencilSquareIcon} from '@heroicons/react/24/outline';
import type {MailingAddress} from '@shopify/hydrogen/storefront-api-types';

import {
  Form,
  Input,
  Button,
  Dialog,
  Checkbox,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  Typography,
  DialogFooter,
} from './ui';

export function AccountAddressDeleteDialog({
  open,
  setOpen,
  address,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  address: MailingAddress;
}) {
  const fetcher = useFetcher();

  React.useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Delete Address</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this address? This action cannot be
          undone. This will permanently delete your address.
        </DialogDescription>

        <Typography.Text
          as="p"
          size="sm"
          decoration="underline"
          className="px-4 py-2 border rounded bg-foreground/5 text-foreground"
        >
          {address?.formatted.join(', ')}
        </Typography.Text>
        <DialogFooter>
          <fetcher.Form action="/account/address/delete" method="delete">
            <input type="hidden" name="address-id" value={address?.id} />
            <Button variant="destructive" size="sm" type="submit">
              Delete
            </Button>
          </fetcher.Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
