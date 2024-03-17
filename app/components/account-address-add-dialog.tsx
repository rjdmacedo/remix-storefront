import {z} from 'zod';
import React from 'react';
import validator from 'validator';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Form as RemixForm, useFetcher} from '@remix-run/react';

import {
  Form,
  Input,
  Button,
  Dialog,
  FormItem,
  FormField,
  FormControl,
  FormMessage,
  DialogTitle,
  DialogContent,
} from './ui';

export function AccountAddressAddDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Add Address</DialogTitle>

        <CreateForm onSave={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CreateForm({onSave}: {onSave: () => void}) {
  const fetcher = useFetcher();

  const form = useForm<FormData>({
    mode: 'onSubmit',
    resolver,
  });

  React.useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      onSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher]);

  function onSubmit(data: FormData) {
    fetcher.submit(
      {
        ...data,
        'address-id': 'add',
      },
      {
        method: 'post',
        action: '/account/address/create',
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

        <Button type="submit">Submit</Button>
      </RemixForm>
    </Form>
  );
}

const CreateAddressFormSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: 'First name must be at least 2 characters.',
    })
    .max(30, {
      message: 'First name must not be longer than 30 characters.',
    })
    .default(''),
  lastName: z
    .string()
    .min(2, {
      message: 'Last name must be at least 2 characters.',
    })
    .max(30, {
      message: 'Last name must not be longer than 30 characters.',
    })
    .default(''),
  company: z
    .string()
    .max(100, {
      message: 'Company name must not be longer than 100 characters.',
    })
    .default(''),
  address1: z
    .string({
      required_error: 'Address line is required.',
    })
    .max(100, {
      message: 'Address line 1 must not be longer than 100 characters.',
    }),
  address2: z
    .string()
    .max(100, {
      message: 'Address line 2 must not be longer than 100 characters.',
    })
    .default(''),
  city: z
    .string({
      required_error: 'City is required.',
    })
    .max(100, {
      message: 'City must not be longer than 100 characters.',
    }),
  province: z
    .string()
    .max(100, {
      message: 'State/Province must not be longer than 100 characters.',
    })
    .default(''),
  zip: z
    .string({
      required_error: 'Postal code is required.',
    })
    .max(100, {
      message: 'Postal code must not be longer than 100 characters.',
    }),
  country: z
    .string({
      required_error: 'Country is required.',
    })
    .max(100, {
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
    )
    .default(''),
});

const resolver = zodResolver(CreateAddressFormSchema);

type FormData = z.infer<typeof CreateAddressFormSchema>;
