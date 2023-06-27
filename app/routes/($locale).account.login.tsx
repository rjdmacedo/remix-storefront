import {
  Form,
  useActionData,
  useLoaderData,
  type V2_MetaFunction,
} from '@remix-run/react';
import {
  json,
  redirect,
  type AppLoadContext,
  type DataFunctionArgs,
} from '@shopify/remix-oxygen';
import * as z from 'zod';
import React from 'react';
import {ExclamationTriangleIcon} from '@radix-ui/react-icons';

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

import type {CustomerAccessTokenCreateMutation} from '../../storefrontapi.generated';

const LoginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

type FormData = z.infer<typeof LoginFormSchema>;

export const handle = {
  isPublic: true,
};

export const meta: V2_MetaFunction = () => {
  return [{title: 'Login'}];
};

export async function loader({context, params}: DataFunctionArgs) {
  const customerAccessToken = await context.session.get(CUSTOMER_ACCESS_TOKEN);

  if (customerAccessToken) {
    return redirect(params.locale ? `${params.locale}/account` : '/account');
  }

  const {shop} = await context.storefront.query(SHOP_QUERY, {
    variables: {language: context.storefront.i18n.language},
  });

  return json({shopName: shop.name});
}

export async function action({request, context, params}: DataFunctionArgs) {
  const formData = await request.clone().formData();

  const result = LoginFormSchema.safeParse(
    preprocessFormData(formData, LoginFormSchema),
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
    const customerAccessToken = await doLogin(context, {
      email: result.data.email,
      password: result.data.password,
    });
    session.set(CUSTOMER_ACCESS_TOKEN, customerAccessToken);

    return redirect(params.locale ? `/${params.locale}/account` : '/account', {
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
      formErrors: [
        'Sorry. We did not recognize either your email or password. Please try to sign in again or create a new account.',
      ],
      fieldErrors: {},
    });
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const {shopName} = useLoaderData<typeof loader>();

  const formHasError = actionData?.status === 'error';

  return (
    <div className="my-24 flex justify-center px-4">
      <div className="w-full max-w-md">
        <Typography.Title>Sign in</Typography.Title>

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
              Sign in
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-gray-300">
            <p className="mt-6 align-baseline text-sm">
              <>
                New to {shopName}? &nbsp;
                <Link className="inline underline" to="/account/register">
                  Create an account
                </Link>
              </>
            </p>
            <Link
              className="mt-6 inline-block align-baseline text-sm text-primary/50"
              to="/account/recover"
            >
              Forgot password
            </Link>
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

const SHOP_QUERY = `#graphql
  query ShopName($language: LanguageCode) @inContext(language: $language) {
    shop {
      name
    }
  }
`;

const LOGIN_MUTATION = `#graphql
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerUserErrors {
        code
        field
        message
      }
      customerAccessToken {
        expiresAt
        accessToken
      }
    }
  }
`;

export async function doLogin(
  {storefront}: AppLoadContext,
  {
    email,
    password,
  }: {
    email: string;
    password: string;
  },
) {
  const data = await storefront.mutate<CustomerAccessTokenCreateMutation>(
    LOGIN_MUTATION,
    {
      variables: {
        input: {
          email,
          password,
        },
      },
    },
  );

  if (data?.customerAccessTokenCreate?.customerAccessToken?.accessToken) {
    return data.customerAccessTokenCreate.customerAccessToken.accessToken;
  }

  /**
   * Something is wrong with the user's input.
   */
  throw new Error(
    data?.customerAccessTokenCreate?.customerUserErrors.join(', '),
  );
}
