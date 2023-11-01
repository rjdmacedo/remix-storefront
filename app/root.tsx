import type {ShouldRevalidateFunction} from '@remix-run/react';
import {
  Meta,
  Links,
  Outlet,
  Scripts,
  useMatches,
  LiveReload,
  useLoaderData,
  useRouteError,
  ScrollRestoration,
  isRouteErrorResponse,
} from '@remix-run/react';
import {defer} from '@shopify/remix-oxygen';
import type {
  LoaderArgs,
  LinksFunction,
  SerializeFrom,
  AppLoadContext,
} from '@shopify/remix-oxygen';
import React from 'react';
import invariant from 'tiny-invariant';
import {ShopifySalesChannel, Seo, useNonce} from '@shopify/hydrogen';
import {PreventFlashOnWrongTheme, ThemeProvider, useTheme} from 'remix-themes';

import styles from '~/styles/tailwind.css';
import {Layout} from '~/components';
import {seoPayload} from '~/lib/seo.server';
import {useAnalytics} from '~/hooks';
import {themeSessionResolver} from '~/lib/session.server';
import {parseMenu, DEFAULT_LOCALE} from '~/lib/utils';
import {Toaster, TooltipProvider} from '~/components/ui';
import {CUSTOMER_ACCESS_TOKEN} from '~/lib/const';
import {GenericError} from '~/components/GenericError';
import {NotFound} from '~/components/NotFound';

import favicon from '../public/favicon.ico';

// This is important to avoid re-fetching root queries on sub-navigations
export const shouldRevalidate: ShouldRevalidateFunction = ({
  nextUrl,
  currentUrl,
  formMethod,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') {
    return true;
  }
  // revalidate when manually revalidating via useRevalidator
  return currentUrl.toString() === nextUrl.toString();
};

export const links: LinksFunction = () => {
  return [
    {rel: 'stylesheet', href: styles},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/favicons/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicons/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicons/favicon-16x16.png',
    },
    {rel: 'manifest', href: '/site.webmanifest'},
    {rel: 'icon', href: '/favicon.ico'},
    {rel: 'stylesheet', href: '/fonts/nunito-sans/font.css'},
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ].filter(Boolean);
};

export const useRootLoaderData = () => {
  const [root] = useMatches();
  return root?.data as SerializeFrom<typeof loader>;
};

export async function loader({request, context}: LoaderArgs) {
  const {session, storefront, cart} = context;
  const [theme, layout, customerAccessToken] = await Promise.all([
    themeSessionResolver(request).then(({getTheme}) => getTheme()),
    getLayoutData(context),
    session.get(CUSTOMER_ACCESS_TOKEN),
  ]);

  const seo = seoPayload.root({shop: layout.shop, url: request.url});

  return defer(
    {
      seo,
      cart,
      theme,
      layout,
      isLoggedIn: Boolean(customerAccessToken),
      selectedLocale: storefront.i18n,
      analytics: {
        shopId: layout.shop.id,
        shopifySalesChannel: ShopifySalesChannel.hydrogen,
      },
    },
    {
      headers: {
        'Set-Cookie': await context.session.commit(),
      },
    },
  );
}

// Wrap your app with ThemeProvider.
// `specifiedTheme` is the stored theme in the session storage.
// `themeAction` is the action name that's used to change the theme in the session storage.
export default function AppWithProviders() {
  const {theme} = useLoaderData();

  return (
    <ThemeProvider specifiedTheme={theme} themeAction="/api/theme">
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </ThemeProvider>
  );
}

/**
 * Use the theme in your app.
 * If the theme is missing in session storage, PreventFlashOnWrongTheme will get
 * the browser theme before hydration and will prevent a flash in the browser.
 * The client code runs conditionally, it won't be rendered if we have a theme in session storage.
 */
function App() {
  const data = useLoaderData<typeof loader>();
  const nonce = useNonce();
  const [theme] = useTheme();
  const locale = data.selectedLocale ?? DEFAULT_LOCALE;
  const hasUserConsent = true;

  useAnalytics(hasUserConsent, locale);

  return (
    <html lang={locale.language} data-theme={theme ?? ''}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Seo />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body>
        <Layout
          key={`${locale.language}-${locale.country}`}
          layout={data.layout}
        >
          <Outlet />
        </Layout>
        <Toaster />
        {/** Pass the nonce to all components that generate a script **/}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload nonce={nonce} />
      </body>
    </html>
  );
}

export function ErrorBoundary({error}: {error: Error}) {
  const nonce = useNonce();
  const routeError = useRouteError();
  const rootData = useRootLoaderData();
  const locale = rootData?.selectedLocale ?? DEFAULT_LOCALE;
  const isRouteError = isRouteErrorResponse(routeError);

  let title = 'Error';
  let pageType = 'page';

  if (isRouteError) {
    title = 'Not found';
    if (routeError.status === 404) pageType = routeError.data || pageType;
  }

  return (
    <html lang={locale.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{title}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Layout
          layout={rootData?.layout}
          key={`${locale.language}-${locale.country}`}
        >
          {isRouteError ? (
            <>
              {routeError.status === 404 ? (
                <NotFound type={pageType} />
              ) : (
                <GenericError
                  error={{message: `${routeError.status} ${routeError.data}`}}
                />
              )}
            </>
          ) : (
            <GenericError error={error instanceof Error ? error : undefined} />
          )}
        </Layout>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload nonce={nonce} />
      </body>
    </html>
  );
}

const LAYOUT_QUERY = `#graphql
  query layout(
    $language: LanguageCode
    $headerMenuHandle: String!
    $footerMenuHandle: String!
  ) @inContext(language: $language) {
    shop {
      ...Shop
    }
    header: menu(handle: $headerMenuHandle) {
      ...Menu
    }
    footer: menu(handle: $footerMenuHandle) {
      ...Menu
    }
  }
  fragment Shop on Shop {
    id
    name
    description
    primaryDomain {
      url
    }
    brand {
      logo {
        image {
          url
        }
      }
    }
  }
  fragment Menu on Menu {
    id
    items {
      ...ParentMenuItem
    }
  }
  fragment MenuItem on MenuItem {
    id
    url
    tags
    type
    title
    resourceId
  }
  fragment ChildMenuItem on MenuItem {
    ...MenuItem
  }
  fragment ParentMenuItem on MenuItem {
    ...MenuItem
    items {
      ...ChildMenuItem
    }
  }
` as const;

async function getLayoutData({storefront, env}: AppLoadContext) {
  const data = await storefront.query(LAYOUT_QUERY, {
    variables: {
      headerMenuHandle: 'main-menu',
      footerMenuHandle: 'footer',
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from the API');

  /*
    Modify specific links/routes (optional)
    @see: https://shopify.dev/api/storefront/unstable/enums/MenuItemType
    e.g here we map:
      - /blogs/news -> /news
      - /blog/news/blog-post -> /news/blog-post
      - /collections/all -> /products
  */
  const customPrefixes = {BLOG: '', CATALOG: 'products'};

  const header = data?.header
    ? parseMenu(data.header, data.shop.primaryDomain.url, env, customPrefixes)
    : undefined;

  const footer = data?.footer
    ? parseMenu(data.footer, data.shop.primaryDomain.url, env, customPrefixes)
    : undefined;

  return {shop: data.shop, header, footer};
}

const CART_QUERY = `#graphql
  query cartQuery($cartId: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          attributes {
            key
            value
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            amountPerQuantity {
              amount
              currencyCode
            }
            compareAtAmountPerQuantity {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              availableForSale
              compareAtPrice {
                ...MoneyFragment
              }
              price {
                ...MoneyFragment
              }
              requiresShipping
              title
              image {
                ...ImageFragment
              }
              product {
                handle
                title
                id
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        ...MoneyFragment
      }
      totalAmount {
        ...MoneyFragment
      }
      totalDutyAmount {
        ...MoneyFragment
      }
      totalTaxAmount {
        ...MoneyFragment
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
    }
  }

  fragment MoneyFragment on MoneyV2 {
    currencyCode
    amount
  }

  fragment ImageFragment on Image {
    id
    url
    altText
    width
    height
  }
` as const;

export async function getCart({storefront}: AppLoadContext, cartId: string) {
  invariant(storefront, 'missing storefront client in cart query');

  const {cart} = await storefront.query(CART_QUERY, {
    variables: {
      cartId,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  return cart;
}
