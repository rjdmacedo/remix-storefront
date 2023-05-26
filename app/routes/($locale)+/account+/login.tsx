import {
  Form,
  useActionData,
  useLoaderData,
  type V2_MetaFunction,
} from '@remix-run/react';
import {
  json,
  redirect,
  type LoaderArgs,
  type ActionFunction,
  type AppLoadContext,
} from '@shopify/remix-oxygen';
import {useState} from 'react';
import type {
  CustomerAccessTokenCreatePayload,
  Shop,
} from '@shopify/hydrogen/storefront-api-types';

import {Link} from '~/components';
import {getInputStyleClasses} from '~/lib/utils';

export const handle = {isPublic: true};

export async function loader({context, params}: LoaderArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (customerAccessToken) {
    return redirect(params.locale ? `${params.locale}/account` : '/account');
  }

  const {shop} = await context.storefront.query<{
    shop: Pick<Shop, 'name'>;
  }>(SHOP_QUERY, {
    variables: {language: context.storefront.i18n.language},
  });

  return json({shopName: shop.name});
}

export const action: ActionFunction = async ({request, context, params}) => {
  const formData = await request.formData();

  const email = formData.get('email');
  const password = formData.get('password');

  if (
    !email ||
    !password ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return badRequest({
      formError: 'Please provide both an email and a password.',
    });
  }

  const {session, storefront} = context;

  try {
    const customerAccessToken = await doLogin(context, {email, password});
    session.set('customerAccessToken', customerAccessToken);

    return redirect(params.locale ? `/${params.locale}/account` : '/account', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error: any) {
    if (storefront.isApiError(error)) {
      return badRequest({
        formError: 'Something went wrong. Please try again later.',
      });
    }

    /**
     * The user did something wrong, but the raw error from the API is not super friendly.
     * Let's make one up.
     */
    return badRequest({
      formError:
        'Sorry. We did not recognize either your email or password. Please try to sign in again or create a new account.',
    });
  }
};

export const meta: V2_MetaFunction = () => [{title: 'Login'}];

export default function Login() {
  const {shopName} = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const [nativeEmailError, setNativeEmailError] = useState<null | string>(null);
  const [nativePasswordError, setNativePasswordError] = useState<null | string>(
    null,
  );

  return (
    <div className="my-24 flex justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl">Sign in.</h1>
        {/* TODO: Add onSubmit to validate _before_ submission with native? */}
        <Form
          method="post"
          noValidate
          className="mb-4 mt-4 space-y-3 pb-8 pt-6"
        >
          {actionData?.formError && (
            <div className="mb-6 flex items-center justify-center rounded-md border border-error text-justify">
              <p className="text-s m-4 text-error">{actionData.formError}</p>
            </div>
          )}
          <div>
            <input
              className={`mb-1 ${getInputStyleClasses(nativeEmailError)}`}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              aria-label="Email address"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              onBlur={(event) => {
                setNativeEmailError(
                  event.currentTarget.value.length &&
                    !event.currentTarget.validity.valid
                    ? 'Invalid email address'
                    : null,
                );
              }}
            />
            {nativeEmailError && (
              <p className="text-xs text-red-500">{nativeEmailError} &nbsp;</p>
            )}
          </div>

          <div>
            <input
              className={`mb-1 ${getInputStyleClasses(nativePasswordError)}`}
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              aria-label="Password"
              minLength={8}
              required
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              onBlur={(event) => {
                if (
                  event.currentTarget.validity.valid ||
                  !event.currentTarget.value.length
                ) {
                  setNativePasswordError(null);
                } else {
                  setNativePasswordError(
                    event.currentTarget.validity.valueMissing
                      ? 'Please enter a password'
                      : 'Passwords must be at least 8 characters',
                  );
                }
              }}
            />
            {nativePasswordError && (
              <p className="text-xs text-red-500">
                {' '}
                {nativePasswordError} &nbsp;
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="focus:shadow-outline block w-full rounded bg-primary px-4 py-2 text-contrast"
              type="submit"
              disabled={!!(nativePasswordError || nativeEmailError)}
            >
              Sign in
            </button>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-gray-300">
            <p className="mt-6 align-baseline text-sm">
              New to {shopName}? &nbsp;
              <Link className="inline underline" to="/account/register">
                Create an account
              </Link>
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

type ActionData = {
  formError?: string;
};

const SHOP_QUERY = `#graphql
  query shop($language: LanguageCode) @inContext(language: $language) {
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

const badRequest = (data: ActionData) => json(data, {status: 400});

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
  const data = await storefront.mutate<{
    customerAccessTokenCreate: CustomerAccessTokenCreatePayload;
  }>(LOGIN_MUTATION, {
    variables: {
      input: {
        email,
        password,
      },
    },
  });

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
