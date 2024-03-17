import {Form, useLoaderData, type MetaFunction} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import type {
  AppLoadContext,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@shopify/remix-oxygen';
import React, {useState} from 'react';
import {EyeIcon, EyeSlashIcon} from '@heroicons/react/24/outline';

import {Input, Label, Button, Typography} from '~/components/ui';
import {Link} from '~/components';
import type {
  ShopNameQuery,
  CustomerAccessTokenCreateMutation,
} from 'storefrontapi.generated';
import {jsonWithError, redirectWithSuccess} from '~/lib/toast.server';

export const handle = {
  isPublic: true,
};

export const meta: MetaFunction = () => {
  return [{title: 'Login'}];
};

export async function loader({context, params, request}: LoaderFunctionArgs) {
  const {session, storefront, authenticator} = context;

  const searchParams = new URL(request.url).searchParams;
  const successRedirect =
    searchParams.get('redirect') ||
    searchParams.get('return_to') ||
    params.locale
      ? `/${params.locale}/account/profile`
      : '/account/profile';

  // If the user is already logged in, redirect them to the successRedirect.
  await authenticator.isAuthenticated(request, {successRedirect});

  const error = session.get(authenticator.sessionErrorKey);

  const {shop} = await storefront.query<ShopNameQuery>(SHOP_QUERY, {
    variables: {language: storefront.i18n.language},
  });

  if (error) {
    return jsonWithError({shopName: shop.name}, error.message);
  }

  return json({shopName: shop.name});
}

export async function action({context, params, request}: ActionFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const redirectTo =
    searchParams.get('redirect') ||
    searchParams.get('return_to') ||
    params.locale
      ? `/${params.locale}/account/profile`
      : '/account/profile';

  const user = await context.authenticator.authenticate('user-pass', request, {
    context,
    failureRedirect: '/login',
  });

  context.session.set(context.authenticator.sessionKey, user);
  const headers = new Headers({
    'Set-Cookie': await context.session.commit(),
  });

  return redirectWithSuccess(redirectTo, `Welcome back!`, {headers});
}

export default function Login() {
  const {shopName} = useLoaderData<typeof loader>();
  const [eyeOpen, setEyeOpen] = useState(false);

  return (
    <div className="my-24 flex justify-center px-4">
      <div className="w-full max-w-md">
        <Typography.Title>Sign in</Typography.Title>

        <Form
          method="post"
          noValidate
          className="mb-4 mt-4 space-y-4 pb-8 pt-6"
        >
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
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type={eyeOpen ? 'text' : 'password'}
              required
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
                <Link className="inline underline" to="/register">
                  Create an account
                </Link>
              </>
            </p>
            <Link
              to="/recover"
              className="mt-6 inline-block align-baseline text-sm text-primary/50"
            >
              Forgot password
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}

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
