import {z} from 'zod';
import validator from 'validator';
import {
  Form as RemixForm,
  Outlet,
  useLoaderData,
  useMatches,
  useOutlet,
  useOutletContext,
} from '@remix-run/react';
import {
  json,
  defer,
  redirect,
  type LoaderArgs,
  type AppLoadContext,
} from '@shopify/remix-oxygen';
import React from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';

import type {
  CustomerDetailsQuery,
  CustomerDetailsFragment,
} from 'storefrontapi.generated';
import {PageHeader, Modal, AccountAside} from '~/components';
import {usePrefixPathWithLocale} from '~/lib/utils';
import {CACHE_NONE, routeHeaders} from '~/data/cache';
import {ORDER_CARD_FRAGMENT} from '~/components/OrderCard';
import {CUSTOMER_ACCESS_TOKEN} from '~/lib/const';
import {
  toast,
  Input,
  Form,
  Button,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '~/components/ui';

import {
  getFeaturedData,
  type FeaturedData,
} from './($locale).featured-products';
import {doLogout} from './($locale).account.logout';

// Combining json + Response + defer in a loader breaks the
// types returned by useLoaderData. This is a temporary fix.
type TmpRemixFix = ReturnType<typeof defer<{isAuthenticated: false}>>;

type ContextType = {customer: CustomerDetailsQuery['customer']};

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
  email: z
    .string({
      required_error: 'Please select an email to display.',
    })
    .email(),
  contact: z.string().refine(validator.isMobilePhone),
});

type FormData = z.infer<typeof ProfileFormSchema>;

export const headers = routeHeaders;

export async function loader({request, context, params}: LoaderArgs) {
  const locale = params.locale;
  const {pathname} = new URL(request.url);

  const loginPath = locale ? `/${locale}/account/login` : '/account/login';
  const isAccountPage = /^\/account\/?$/.test(pathname);

  const customerAccessToken = await context.session.get(CUSTOMER_ACCESS_TOKEN);
  const isAuthenticated = !!customerAccessToken;

  if (!isAuthenticated) {
    if (isAccountPage) {
      return redirect(loginPath) as unknown as TmpRemixFix;
    }
    // pass through to public routes
    return json({isAuthenticated: false}) as unknown as TmpRemixFix;
  }

  const customer = await getCustomer(context, customerAccessToken);

  const heading = customer
    ? customer.firstName
      ? `Welcome back, ${customer.firstName}`
      : `Welcome to your account`
    : 'Account Details';

  return defer(
    {
      heading,
      customer,
      isAuthenticated,
      featuredData: getFeaturedData(context.storefront),
    },
    {
      headers: {
        'Cache-Control': CACHE_NONE,
      },
    },
  );
}

export default function Authenticated() {
  const data = useLoaderData<typeof loader>();
  const outlet = useOutlet();
  const matches = useMatches();

  // routes that export handle { renderInModal: true }
  const renderOutletInModal = matches.some(
    (match) => match?.handle?.renderInModal,
  );
  // routes that export handle { accountChild: true }
  const routeIsAccountChild = matches.some(
    (match) => match?.handle?.accountChild,
  );

  // Public routes
  if (!data.isAuthenticated) {
    return <Outlet />;
  }

  // Authenticated routes
  if (outlet) {
    if (renderOutletInModal) {
      return (
        <>
          <Modal cancelLink="/account">
            <Outlet context={{customer: data.customer} satisfies ContextType} />
          </Modal>
          <Account {...data}>lorem</Account>
        </>
      );
    } else if (routeIsAccountChild) {
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
      <ProfileForm customer={data.customer} />
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
          action={usePrefixPathWithLocale('/account/logout')}
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

function ProfileForm({customer}: {customer: CustomerDetailsFragment}) {
  const defaultValues = {
    email: customer.email || '',
    contact: customer.phone || '',
    lastName: customer.lastName || '',
    firstName: customer.firstName || '',
  };

  const form = useForm<FormData>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  function onSubmit(data: FormData) {
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <RemixForm onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="firstName"
          render={({field}) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder={customer.firstName || ''} {...field} />
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
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder={customer.lastName || ''} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({field}) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder={customer.email || ''} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact"
          render={({field}) => (
            <FormItem>
              <FormLabel>Contact</FormLabel>
              <FormControl>
                <Input placeholder={customer.phone || ''} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Update profile</Button>
      </RemixForm>
    </Form>
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

export async function getCustomer(
  context: AppLoadContext,
  customerAccessToken: string,
) {
  const {storefront} = context;

  const data = await storefront.query<CustomerDetailsQuery>(CUSTOMER_QUERY, {
    variables: {
      customerAccessToken,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  /**
   * If the customer failed to load, we assume their access token is invalid.
   */
  if (!data || !data.customer) {
    throw await doLogout(context);
  }

  return data.customer;
}
