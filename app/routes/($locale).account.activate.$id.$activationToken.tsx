import * as z from 'zod';
import React, {useState} from 'react';
import {json, redirect} from '@shopify/remix-oxygen';
import type {DataFunctionArgs} from '@shopify/remix-oxygen';
import {Form, useActionData, type V2_MetaFunction} from '@remix-run/react';
import {ExclamationTriangleIcon} from '@radix-ui/react-icons';
import {EyeIcon, EyeSlashIcon} from '@heroicons/react/24/outline';

import {passwordSchema} from '~/lib/validation/user';
import {preprocessFormData} from '~/lib/forms';
import {getInputStyleClasses} from '~/lib/utils';
import {CUSTOMER_ACCESS_TOKEN} from '~/lib/const';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  Label,
  Typography,
} from '~/components/ui';

const ActivateFormSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: passwordSchema,
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Passwords do not match',
  });

type FormData = z.infer<typeof ActivateFormSchema>;

export const handle = {
  isPublic: true,
};

export const meta: V2_MetaFunction = () => {
  return [{title: 'Activate Account'}];
};

export async function action({
  request,
  context,
  params: {locale, id, activationToken},
}: DataFunctionArgs) {
  if (!id || !activationToken) {
    return badRequest({
      formErrors: ['Wrong token. The link you followed might be wrong.'],
      fieldErrors: {},
    });
  }

  const formData = await request.clone().formData();

  const result = ActivateFormSchema.safeParse(
    preprocessFormData(formData, ActivateFormSchema),
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

  const {session, storefront} = context;

  try {
    const data = await storefront.mutate(CUSTOMER_ACTIVATE_MUTATION, {
      variables: {
        id: `gid://shopify/Customer/${id}`,
        input: {
          password: result.data.password,
          activationToken,
        },
      },
    });

    const {accessToken} = data?.customerActivate?.customerAccessToken ?? {};

    if (!accessToken) {
      /**
       * Something is wrong with the user's input.
       */
      throw new Error(data?.customerActivate?.customerUserErrors.join(', '));
    }

    session.set(CUSTOMER_ACCESS_TOKEN, accessToken);

    return redirect(locale ? `${locale}/account` : '/account', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error: any) {
    if (storefront.isApiError(error)) {
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
      formErrors: ['Sorry. We could not activate your account.'],
      fieldErrors: {},
    });
  }
}

export default function Activate() {
  const actionData = useActionData<typeof action>();
  const [eyeOpen, setEyeOpen] = useState(false);

  const formHasError = actionData?.status === 'error';

  return (
    <div className="my-24 flex justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        <Typography.Title>Activate Account</Typography.Title>

        <Typography.Text>
          Create your password to activate your account.
        </Typography.Text>

        <Form
          method="post"
          noValidate
          className="mb-4 mt-4 space-y-3 pb-8 pt-6"
        >
          {formHasError && actionData?.errors?.formErrors.length > 0 && (
            <Alert variant="destructive">
              <ExclamationTriangleIcon />
              <AlertTitle>Uh oh!</AlertTitle>
              <AlertDescription>
                {actionData?.errors?.formErrors[0]}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type={eyeOpen ? 'text' : 'password'}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              aria-label="Password"
              autoComplete="current-password"
              suffix={
                <Button
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() => setEyeOpen(!eyeOpen)}
                  className="h-6 w-6"
                >
                  {eyeOpen ? (
                    <EyeIcon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              }
            />
            {actionData?.errors.fieldErrors.password && (
              <Typography.Text color="destructive" size="xs">
                {actionData?.errors.fieldErrors.password[0]}
              </Typography.Text>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="passwordConfirm">Re-enter Password</Label>
            <Input
              id="passwordConfirm"
              type={eyeOpen ? 'text' : 'password'}
              name="passwordConfirm"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              aria-label="Re-enter password"
              autoComplete="current-password"
              suffix={
                <Button
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() => setEyeOpen(!eyeOpen)}
                  className="h-6 w-6"
                >
                  {eyeOpen ? (
                    <EyeIcon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              }
            />
            {actionData?.errors.fieldErrors.passwordConfirm && (
              <Typography.Text color="destructive" size="xs">
                {actionData?.errors.fieldErrors.passwordConfirm[0]}
              </Typography.Text>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button type="submit" className="block w-full">
              Save
            </Button>
          </div>
        </Form>
      </div>
    </div>
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

const CUSTOMER_ACTIVATE_MUTATION = `#graphql
  mutation customerActivate($id: ID!, $input: CustomerActivateInput!) {
    customerActivate(id: $id, input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
