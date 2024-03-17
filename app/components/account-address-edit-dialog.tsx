import {z} from 'zod';
import React from 'react';
import validator from 'validator';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import type {MailingAddress} from '@shopify/hydrogen/storefront-api-types';
import {Form as RemixForm, useFetcher} from '@remix-run/react';

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
  DialogContent,
} from './ui';

export function AccountAddressEditDialog({
  open,
  setOpen,
  address,
  defaultAddress,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  address: MailingAddress;
  defaultAddress?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Edit Address</DialogTitle>

        <EditForm
          onSave={() => setOpen(false)}
          address={address}
          defaultAddress={defaultAddress}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  onSave,
  address,
  defaultAddress,
}: {
  onSave: () => void;
  address: MailingAddress;
  defaultAddress?: boolean;
}) {
  const fetcher = useFetcher();

  const form = useForm<FormData>({
    mode: 'onSubmit',
    resolver,
    defaultValues: {
      firstName: address?.firstName ?? '',
      lastName: address?.lastName ?? '',
      company: address?.company ?? '',
      address1: address?.address1 ?? '',
      address2: address?.address2 ?? '',
      city: address?.city ?? '',
      province: address?.province ?? '',
      zip: address?.zip ?? '',
      country: address?.country ?? '',
      phone: address?.phone ?? '',
      defaultAddress: defaultAddress ?? false,
    },
  });

  React.useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      onSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher]);

  function onSubmit(data: FormData) {
    const {defaultAddress, ...rest} = data;
    fetcher.submit(
      {
        ...rest,
        ...(defaultAddress && {defaultAddress}),
        'address-id': address?.id,
      },
      {
        method: 'post',
        action: `/account/address/${encodeURIComponent(address.id)}`,
      },
    );
  }

  return (
    <Form {...form}>
      <RemixForm onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({field}) => (
            <FormItem>
              <FormControl>
                <Input placeholder="First Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({field}) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Last Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({field}) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Company" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address1"
          render={({field}) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Address Line 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address2"
          render={({field}) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Address Line 2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({field}) => (
            <FormItem>
              <FormControl>
                <Input placeholder="City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="province"
          render={({field}) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Province" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="zip"
          render={({field}) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Postal Code / Zip" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({field}) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Country" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({field}) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Phone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultAddress"
          render={({field}) => (
            <FormItem>
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Set as default address</FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </RemixForm>
    </Form>
  );
}

const EditAddressFormSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: 'First name must be at least 2 characters.',
    })
    .max(30, {
      message: 'First name must not be longer than 30 characters.',
    }),
  lastName: z
    .string()
    .min(2, {
      message: 'Last name must be at least 2 characters.',
    })
    .max(30, {
      message: 'Last name must not be longer than 30 characters.',
    }),
  company: z.string().max(100, {
    message: 'Company name must not be longer than 100 characters.',
  }),
  address1: z.string().max(100, {
    message: 'Address line 1 must not be longer than 100 characters.',
  }),
  address2: z.string().max(100, {
    message: 'Address line 2 must not be longer than 100 characters.',
  }),
  city: z.string().max(100, {
    message: 'City must not be longer than 100 characters.',
  }),
  province: z.string().max(100, {
    message: 'State/Province must not be longer than 100 characters.',
  }),
  zip: z.string().max(100, {
    message: 'Zip/Postal Code must not be longer than 100 characters.',
  }),
  country: z.string().max(100, {
    message: 'Country must not be longer than 100 characters.',
  }),
  phone: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        return validator.isMobilePhone(value);
      },
      {
        message: 'Phone number is invalid.',
      },
    ),
  defaultAddress: z.boolean().default(false).optional(),
});

const resolver = zodResolver(EditAddressFormSchema);

type FormData = z.infer<typeof EditAddressFormSchema>;
