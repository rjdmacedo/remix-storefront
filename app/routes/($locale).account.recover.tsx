import * as z from 'zod';
import React from 'react';
import {ExclamationTriangleIcon} from '@radix-ui/react-icons';
import {json, redirect, type DataFunctionArgs} from '@shopify/remix-oxygen';
import {Form, useActionData, type V2_MetaFunction} from '@remix-run/react';

import {
  Input,
  Alert,
  Label,
  Button,
  AlertTitle,
  Typography,
  AlertDescription,
} from '~/components/ui';
import {Link} from '~/components';
import {emailSchema} from '~/lib/validation/user';
import {preprocessFormData} from '~/lib/forms';
import {CUSTOMER_ACCESS_TOKEN} from '~/lib/const';

const RecoverFormSchema = z.object({
  email: emailSchema,
});

type FormData = z.infer<typeof RecoverFormSchema>;

export const handle = {
  isPublic: true,
};

export const meta: V2_MetaFunction = () => {
  return [{title: 'Recover Password'}];
};

export async function loader({context, params}: DataFunctionArgs) {
  const customerAccessToken = await context.session.get(CUSTOMER_ACCESS_TOKEN);

  if (customerAccessToken) {
    return redirect(params.locale ? `${params.locale}/account` : '/account');
  }

  return new Response(null);
}

export async function action({request, context}: DataFunctionArgs) {
  const formData = await request.clone().formData();

  const result = RecoverFormSchema.safeParse(
    preprocessFormData(formData, RecoverFormSchema),
  );

  if (!result.success) {
    return badRequest({
      formErrors: ['Please provide an email.'],
      fieldErrors: {},
    });
  }

  try {
    await context.storefront.mutate(CUSTOMER_RECOVER_MUTATION, {
      variables: {email: result.data.email},
    });

    return json({
      data: result.data,
      status: 'success',
      resetRequested: true,
    } as const);
  } catch (error: any) {
    return badRequest({
      formErrors: ['Something went wrong. Please try again later.'],
      fieldErrors: {},
    });
  }
}

export default function Recover() {
  const actionData = useActionData<typeof action>();
  const isSubmitted = actionData?.resetRequested;

  const formHasError = actionData?.status === 'error';

  return (
    <div className="my-24 flex justify-center px-4">
      <div className="w-full max-w-md">
        <div className="space-y-4">
          {isSubmitted ? (
            <>
              <Typography.Title>Request Sent</Typography.Title>

              <Typography.Text>
                If that email address is in our system, you will receive an
                email with instructions about how to reset your password in a
                few minutes.
              </Typography.Text>
            </>
          ) : (
            <>
              <Typography.Title>Forgot Password</Typography.Title>

              <Typography.Text>
                Enter the email address associated with your account to receive
                a link to reset your password.
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
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    aria-label="Email address"
                    autoComplete="email"
                  />
                  {actionData?.errors.fieldErrors.email && (
                    <Typography.Text color="destructive" size="xs">
                      {actionData?.errors.fieldErrors.email[0]}
                    </Typography.Text>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Button type="submit" className="block w-full">
                    Request Reset Link
                  </Button>
                </div>

                <div className="mt-8 flex items-center border-t border-gray-300">
                  <p className="mt-6 align-baseline text-sm">
                    Return to &nbsp;
                    <Link className="inline underline" to="/account/login">
                      Login
                    </Link>
                  </p>
                </div>
              </Form>
            </>
          )}
        </div>
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
      resetRequested: false,
    } as const,
    {status: 400},
  );

const CUSTOMER_RECOVER_MUTATION = `#graphql
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
