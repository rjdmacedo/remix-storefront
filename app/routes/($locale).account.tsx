import {
  Outlet,
  useOutlet,
  useMatches,
  useLoaderData,
  useOutletContext,
  Form as RemixForm,
} from '@remix-run/react';
import React from 'react';
import {defer, redirect} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs, AppLoadContext} from '@shopify/remix-oxygen';

import type {
  CustomerDetailsQuery,
  CustomerDetailsFragment,
} from 'storefrontapi.generated';
import {getFeaturedData} from '~/routes/($locale).featured-products';
import type {FeaturedData} from '~/routes/($locale).featured-products';
import {Button, Typography} from '~/components/ui';
import {ORDER_CARD_FRAGMENT} from '~/components/OrderCard';
import {usePrefixPathWithLocale} from '~/hooks';
import {AccountAside, PageHeader} from '~/components';
import {CACHE_NONE, routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

type ContextType = {
  customer: CustomerDetailsFragment;
};

// Combining json + Response + defer in a loader breaks the
// types returned by useLoaderData. This is a temporary fix.
type TmpRemixFix = ReturnType<typeof defer<{authenticated: false}>>;

export async function loader({request, context}: LoaderFunctionArgs) {
  const {pathname} = new URL(request.url);

  if (pathname === '/account') {
    throw redirect('/account/profile', 302) as unknown as TmpRemixFix;
  }

  const user = await context.authenticator.isAuthenticated(request);

  if (!user?.token) {
    return redirect('/login') as unknown as TmpRemixFix;
  }

  const customer = await getCustomer(context, user.token);

  const heading = customer
    ? customer.firstName
      ? `Welcome back, ${customer.firstName}`
      : `Welcome to your account`
    : 'Account Details';

  return defer(
    {
      heading,
      customer,
      featuredData: getFeaturedData(context.storefront),
      authenticated: !!user,
    },
    {headers: {'Cache-Control': CACHE_NONE}},
  );
}

export default function AccountLayoutPage() {
  const data = useLoaderData<typeof loader>();
  const outlet = useOutlet();
  const matches = useMatches();

  // routes that export handle { accountChild: true }
  const routeIsAccountChild = matches.some(
    // @ts-ignore
    (match) => match?.handle?.accountChild,
  );

  // Public routes, like login and register pages
  if (!data.authenticated) {
    return <Outlet />;
  }

  // Authenticated routes
  if (outlet) {
    if (routeIsAccountChild) {
      return (
        <Account {...data}>
          <Outlet context={{customer: data.customer}} />
        </Account>
      );
    } else {
      return <Outlet context={{customer: data.customer}} />;
    }
  }

  return (
    <Account {...data}>
      <Typography.Text as="p">
        You are logged in as {data.customer?.firstName}{' '}
        {data.customer?.lastName}
      </Typography.Text>
      <Typography.Text as="p">
        Please select an option from the menu on the left.
      </Typography.Text>
    </Account>
  );
}

type AccountT = {
  heading: string;
  children: React.ReactNode;
  customer: CustomerDetailsFragment;
  featuredData: Promise<FeaturedData>;
};

function Account({children, heading}: AccountT) {
  return (
    <>
      <PageHeader
        heading={heading}
        className="flex gap-x-2 justify-between items-center"
      >
        <RemixForm
          method="post"
          action={usePrefixPathWithLocale('/logout')}
          className="hidden md:block"
        >
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </RemixForm>
      </PageHeader>

      <div className="mx-auto lg:flex lg:gap-x-16">
        <AccountAside />
        <main className="pt-8 lg:flex-auto lg:pt-0">{children}</main>
      </div>
    </>
  );
}

export function useAccount() {
  return useOutletContext<ContextType>();
}

const CUSTOMER_QUERY = `#graphql
  query CustomerDetails(
    $customerAccessToken: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customer(customerAccessToken: $customerAccessToken) {
      ...CustomerDetails
    }
  }

  fragment AddressPartial on MailingAddress {
    id
    zip
    city
    phone
    company
    country
    province
    address1
    address2
    lastName
    firstName
    formatted
  }

  fragment CustomerDetails on Customer {
    email
    phone
    lastName
    firstName
    orders(first: 250, sortKey: PROCESSED_AT, reverse: true) {
      edges {
        node {
          ...OrderCard
        }
      }
    }
    addresses(first: 6) {
      edges {
        node {
          ...AddressPartial
        }
      }
    }
    defaultAddress {
      ...AddressPartial
    }
  }

  ${ORDER_CARD_FRAGMENT}
` as const;

export const CUSTOMER_UPDATE_MUTATION = `#graphql
mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
  customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
    customerUserErrors {
      code
      field
      message
    }
  }
}
`;

export async function getCustomer(
  context: AppLoadContext,
  customerAccessToken: string,
) {
  const data = await context.storefront.query<CustomerDetailsQuery>(
    CUSTOMER_QUERY,
    {
      variables: {
        customerAccessToken,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
      cache: context.storefront.CacheNone(),
    },
  );

  /** If the customer failed to load, we assume their access token is invalid. */
  if (!data || !data.customer) {
    throw new Error('Invalid access token');
  }

  return data.customer;
}
