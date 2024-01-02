import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import * as z from 'zod';
import React from 'react';
import {ExclamationTriangleIcon} from '@radix-ui/react-icons';
import {Form, useActionData, type MetaFunction} from '@remix-run/react';

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
import {preprocessFormData} from '~/lib/forms';
import {CUSTOMER_ACCESS_TOKEN} from '~/lib/const';
import {emailSchema, passwordSchema} from '~/lib/validation/user';

import {doLogin} from './($locale).login';

const RegisterFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

type FormData = z.infer<typeof RegisterFormSchema>;

export const handle = {
  isPublic: true,
};

export const meta: MetaFunction = () => {
  return [{title: 'Register'}];
};

export async function loader({context, params}: LoaderFunctionArgs) {
  const customerAccessToken = await context.session.get(CUSTOMER_ACCESS_TOKEN);

  if (customerAccessToken) {
    return redirect(
      params.locale ? `${params.locale}/account/profile` : '/account/profile',
    );
  }

  return new Response(null);
}

export async function action({request, context, params}: ActionFunctionArgs) {
  const formData = await request.clone().formData();

  const result = RegisterFormSchema.safeParse(
    preprocessFormData(formData, RegisterFormSchema),
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
    const data = await storefront.mutate(CUSTOMER_CREATE_MUTATION, {
      variables: {
        input: {
          email: result.data.email,
          password: result.data.password,
        },
      },
    });

    if (!data?.customerCreate?.customer?.id) {
      /**
       * Something is wrong with the user's input.
       */
      throw new Error(data?.customerCreate?.customerUserErrors.join(', '));
    }

    const customerAccessToken = await doLogin(context, {
      email: result.data.email,
      password: result.data.password,
    });
    session.set(CUSTOMER_ACCESS_TOKEN, customerAccessToken);

    return redirect(
      params.locale ? `${params.locale}/account/profile` : '/account/profile',
      {
        headers: {
          'Set-Cookie': await session.commit(),
        },
      },
    );
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
      formErrors: [
        'Sorry. We could not create an account with this email. User might already exist, try to login instead.',
      ],
      fieldErrors: {},
    });
  }
}

export default function Register() {
  const actionData = useActionData<typeof action>();

  const formHasError = actionData?.status === 'error';

  return (
    <div className="my-24 flex justify-center px-4">
      <div className="w-full max-w-md">
        <Typography.Title format>Create an Account</Typography.Title>

        <Form
          method="post"
          noValidate
          className="mb-4 mt-4 space-y-4 pb-8 pt-6"
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

          <div className="flex flex-col space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
            {actionData?.errors.fieldErrors.password && (
              <Typography.Text color="destructive" size="xs">
                {actionData?.errors.fieldErrors.password[0]}
              </Typography.Text>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button type="submit" className="block w-full">
              Create Account
            </Button>
          </div>

          <div className="mt-8 flex items-center border-t border-gray-300">
            <p className="mt-6 align-baseline text-sm">
              Already have an account? &nbsp;
              <Link className="inline underline" to="/login">
                Sign in
              </Link>
            </p>
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

const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
