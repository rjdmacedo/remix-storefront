import * as z from 'zod';
import {json} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import React, {useState} from 'react';
import type {MetaFunction} from '@remix-run/react';
import {Form, useActionData} from '@remix-run/react';
import {EyeIcon, EyeSlashIcon} from '@heroicons/react/24/outline';
import {ExclamationTriangleIcon} from '@radix-ui/react-icons';
import type {DataFunctionArgs, LoaderFunctionArgs} from '@shopify/remix-oxygen';

import {
  Alert,
  Input,
  Label,
  Button,
  Separator,
  AlertTitle,
  Typography,
  AlertDescription,
} from '~/components/ui';
import {
  getCustomer,
  CUSTOMER_UPDATE_MUTATION,
} from '~/routes/($locale).account';
import {doLogin} from '~/routes/($locale).login';
import {routeHeaders} from '~/data/cache';
import {passwordSchema} from '~/lib/validation/user';
import {preprocessFormData} from '~/lib/forms';
import {CUSTOMER_ACCESS_TOKEN} from '~/lib/const';
import type {CustomerUpdateMutation} from 'storefrontapi.generated';
import {redirectWithError, redirectWithSuccess} from '~/lib/toast.server';

export const handle = {
  accountChild: true,
};

export const meta: MetaFunction = () => {
  return [{title: 'Change Password'}];
};

export const headers = routeHeaders;

export async function loader({request, context}: LoaderFunctionArgs) {
  const user = await context.authenticator.isAuthenticated(request);

  return user
    ? json({user})
    : redirectWithError(
        '/login?redirect=/account/security',
        'You must be logged in to update your account details.',
      );
}

export async function action({request, context, params}: DataFunctionArgs) {
  const customerAccessToken = await context.session.get(CUSTOMER_ACCESS_TOKEN);

  invariant(
    customerAccessToken,
    'You must be logged in to update your account details.',
  );

  // Double-check current user is logged in.
  // Will throw a logout redirect if not.
  const customer = await getCustomer(context, customerAccessToken);

  const formData = await request.clone().formData();

  const result = PasswordResetFormSchema.safeParse(
    preprocessFormData(formData, PasswordResetFormSchema),
  );

  if (!result.success) {
    return json(
      {
        status: 'error',
        errors: result.error.flatten(),
      } as const,
      {
        status: 400,
      },
    );
  }

  try {
    await doLogin(context, {
      email: customer.email!,
      password: result.data.currentPassword,
    });

    await context.storefront.mutate<CustomerUpdateMutation>(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customerAccessToken,
          customer: {
            password: result.data.newPassword,
          },
        },
      },
    );

    return redirectWithSuccess(
      params?.locale ? `${params.locale}/account/profile` : '/account/profile',
      'Password updated successfully',
      {
        headers: {
          'Set-Cookie': await context.session.commit(),
        },
      },
    );
  } catch (error: any) {
    if (context.storefront.isApiError(error)) {
      return badRequest({
        formErrors: ['Something went wrong. Please try again later.'],
        fieldErrors: {},
      });
    }

    /**
     * The user did something wrong, but the raw error from the API is not super friendly.
     * Let's make one up.
     */
    return badRequest({
      formErrors: [],
      fieldErrors: {
        currentPassword: [
          'Your current password is incorrect. Please try again.',
        ],
      },
    });
  }
}

export default function AccountSecurityPage() {
  return (
    <div className="space-y-6">
      <Typography.Title size="xl">Change Password</Typography.Title>
      <Typography.Text size="sm" color="muted-foreground">
        Update your password associated with your account.
      </Typography.Text>

      <Separator />

      <ChangePasswordForm />
    </div>
  );
}

function ChangePasswordForm() {
  const actionData = useActionData<typeof action>();
  const [newEyeOpen, setNewEyeOpen] = useState(false);
  const [currEyeOpen, setCurrEyeOpen] = useState(false);
  const [confirmEyeOpen, setConfirmEyeOpen] = useState(false);

  const formHasError = actionData?.status === 'error';

  return (
    <Form method="post" className="md:col-span-2">
      {formHasError && actionData?.errors?.formErrors.length > 0 && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon />
          <AlertTitle>Uh oh!</AlertTitle>
          <AlertDescription>
            {actionData?.errors?.formErrors[0]}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-lg sm:grid-cols-6">
        <div className="col-span-full">
          <Label htmlFor="current-password">Current password</Label>
          <div className="mt-2">
            <Input
              id="current-password"
              type={currEyeOpen ? 'text' : 'password'}
              name="currentPassword"
              autoComplete="current-password"
              suffix={
                <Button
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() => setCurrEyeOpen(!currEyeOpen)}
                  className="h-6 w-6"
                >
                  {currEyeOpen ? (
                    <EyeIcon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              }
            />
            {actionData?.errors.fieldErrors.currentPassword && (
              <Typography.Text color="destructive" size="xs">
                {actionData?.errors.fieldErrors.currentPassword[0]}
              </Typography.Text>
            )}
          </div>
        </div>

        <div className="col-span-full">
          <Label htmlFor="new-password">New password</Label>
          <div className="mt-2">
            <Input
              id="new-password"
              type={newEyeOpen ? 'text' : 'password'}
              name="newPassword"
              autoComplete="new-password"
              suffix={
                <Button
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() => setNewEyeOpen(!newEyeOpen)}
                  className="h-6 w-6"
                >
                  {newEyeOpen ? (
                    <EyeIcon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              }
            />
          </div>
          {actionData?.errors.fieldErrors.newPasswordConfirm && (
            <Typography.Text color="destructive" size="xs">
              {actionData?.errors.fieldErrors.newPasswordConfirm[0]}
            </Typography.Text>
          )}
        </div>

        <div className="col-span-full">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <div className="mt-2">
            <Input
              id="confirm-password"
              type={confirmEyeOpen ? 'text' : 'password'}
              name="newPasswordConfirm"
              autoComplete="new-password"
              suffix={
                <Button
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() => setConfirmEyeOpen(!confirmEyeOpen)}
                  className="h-6 w-6"
                >
                  {confirmEyeOpen ? (
                    <EyeIcon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex">
        <Button type="submit">Save</Button>
      </div>
    </Form>
  );
}

const badRequest = (data: z.typeToFlattenedError<FormData>) =>
  json(
    {
      status: 'error',
      errors: {
        formErrors: data.formErrors,
        fieldErrors: data.fieldErrors,
      },
    } as const,
    {status: 400},
  );

const PasswordResetFormSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    newPasswordConfirm: passwordSchema,
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    path: ['newPasswordConfirm'],
    message: 'Passwords do not match',
  });

type FormData = z.infer<typeof PasswordResetFormSchema>;
