import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {
  useRemixForm,
  RemixFormProvider,
  useRemixFormContext,
  getValidatedFormData,
} from 'remix-hook-form';
import {z} from 'zod';
import React from 'react';
import {json} from '@shopify/remix-oxygen';
import validator from 'validator';
import invariant from 'tiny-invariant';
import {zodResolver} from '@hookform/resolvers/zod';
import {Form, type MetaFunction} from '@remix-run/react';

import {routeHeaders} from '~/data/cache';
import {CUSTOMER_ACCESS_TOKEN} from '~/lib/const';
import {jsonWithError, jsonWithSuccess} from '~/lib/toast.server';
import {useAccount, CUSTOMER_UPDATE_MUTATION} from '~/routes/($locale).account';
import {assertApiErrors, requireLoggedInUser} from '~/lib/utils';
import {Label, Input, Separator, Typography, Button} from '~/components/ui';
import type {
  CustomerDetailsQuery,
  CustomerUpdateMutation,
} from 'storefrontapi.generated';

export const handle = {
  accountChild: true,
};

export const meta: MetaFunction = () => {
  return [{title: 'Profile'}];
};

export const headers = routeHeaders;

export async function loader({params, context}: LoaderFunctionArgs) {
  await requireLoggedInUser(context, {
    locale: params.locale,
    redirectTo: '/account/profile',
  });

  return json(null);
}

export async function action({request, context}: ActionFunctionArgs) {
  const customerAccessToken = await context.session.get(CUSTOMER_ACCESS_TOKEN);

  invariant(
    customerAccessToken,
    'You must be logged in to update your account details.',
  );

  const {data, errors} = await getValidatedFormData<FormData>(
    request,
    resolver,
  );

  if (errors) {
    // The keys "errors" and "defaultValue" are picked up automatically by useRemixForm
    return jsonWithError(
      {
        status: 'error',
        errors,
      },
      'Please fix the errors below.',
      {status: 400},
    );
  }

  try {
    const {customerUpdate} =
      await context.storefront.mutate<CustomerUpdateMutation>(
        CUSTOMER_UPDATE_MUTATION,
        {
          variables: {
            customerAccessToken,
            customer: {
              email: data.email,
              phone: data?.phone || null,
              firstName: data.firstName,
              lastName: data.lastName,
            },
          },
        },
      );

    assertApiErrors(customerUpdate);

    return jsonWithSuccess(
      {
        status: 'success',
        errors: {},
      },
      'Profile updated successfully.',
    );
  } catch (error: any) {
    if (context.storefront.isApiError(error)) {
      return jsonWithError(
        {
          status: 'error',
          errors: 'Something went wrong. Please try again later.',
        },
        'Something went wrong. Please try again later.',
        {
          status: 500,
        },
      );
    }

    return jsonWithError(
      {
        status: 'error',
        errors: error.message,
      },
      error.message,
      {status: 400},
    );
  }
}

export default function AccountProfilePage() {
  const {customer} = useAccount();

  return (
    <div className="space-y-6">
      <Typography.Title size="xl">
        {customer?.firstName}&apos;s Profile
      </Typography.Title>
      <Typography.Text size="sm" color="muted-foreground">
        Update your profile information.
      </Typography.Text>
      <Separator />
      <ProfileForm customer={customer} />
    </div>
  );
}

function ProfileForm({customer}: {customer: CustomerDetailsQuery['customer']}) {
  const methods = useRemixForm<FormData>({
    mode: 'onSubmit',
    resolver,
    defaultValues: {
      email: customer?.email || '',
      phone: customer?.phone || '',
      lastName: customer?.lastName || '',
      firstName: customer?.firstName || '',
    },
  });

  return (
    <RemixFormProvider {...methods}>
      <Form
        onSubmit={methods.handleSubmit}
        className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-lg sm:grid-cols-6"
      >
        <FormField
          id="first-name"
          name="firstName"
          label="* First Name"
          autoComplete="given-name"
        />

        <FormField
          id="last-name"
          name="lastName"
          label="* Last Name"
          autoComplete="family-name"
        />

        <FormField
          id="email"
          name="email"
          type="email"
          label="* Email"
          autoComplete="email"
        />

        <FormField
          id="phone"
          name="phone"
          type="tel"
          label="Phone"
          autoComplete="tel"
        />

        <div className="flex">
          <Button type="submit">Save</Button>
        </div>
      </Form>
    </RemixFormProvider>
  );
}

function FormField({
  id,
  name,
  label,
  type = 'text',
  autoComplete,
}: {
  id: string;
  name: keyof FormData;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'password';
  autoComplete?: string;
}) {
  const {
    register,
    formState: {errors},
  } = useRemixFormContext<FormData>();

  const hasError = Boolean(errors[name]);

  return (
    <div className="col-span-full">
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-2">
        <Input
          id={id}
          type={type}
          autoComplete={autoComplete}
          {...register(name)}
        />
        {hasError && (
          <Typography.Text color="destructive" size="xs">
            {errors?.[name]?.message}
          </Typography.Text>
        )}
      </div>
    </div>
  );
}

const ProfileFormSchema = z.object({
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
  email: z.string().email({
    message: 'Email is invalid.',
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
});

const resolver = zodResolver(ProfileFormSchema);

type FormData = z.infer<typeof ProfileFormSchema>;
