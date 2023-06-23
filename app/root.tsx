import {
  defer,
  type LoaderArgs,
  type LinksFunction,
  type AppLoadContext,
} from '@shopify/remix-oxygen';
import {
  Meta,
  Links,
  Outlet,
  Scripts,
  useLoaderData,
  ScrollRestoration,
} from '@remix-run/react';
import React from 'react';
import invariant from 'tiny-invariant';
import type {Shop, Cart} from '@shopify/hydrogen/storefront-api-types';
import {ShopifySalesChannel, Seo} from '@shopify/hydrogen';
import {PreventFlashOnWrongTheme, ThemeProvider, useTheme} from 'remix-themes';

import {Layout} from '~/components';
import {seoPayload} from '~/lib/seo.server';
import {useAnalytics} from '~/hooks';
import {themeSessionResolver} from '~/lib/session.server';

import favicon from '../public/favicon.ico';

import {
  parseMenu,
  getCartId,
  DEFAULT_LOCALE,
  type EnhancedMenu,
} from './lib/utils';
import styles from './tailwind.css';

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

export async function loader({request, context}: LoaderArgs) {
  const cartId = getCartId(request);
  const [theme, layout, customerAccessToken] = await Promise.all([
    themeSessionResolver(request).then(({getTheme}) => getTheme()),
    getLayoutData(context),
    context.session.get('customerAccessToken'),
  ]);

  const seo = seoPayload.root({shop: layout.shop, url: request.url});
  const cart = cartId ? getCart(context, cartId) : undefined;
  const isLoggedIn = Boolean(customerAccessToken);
  const selectedLocale = context.storefront.i18n;

  return defer({
    seo,
    cart,
    theme,
    layout,
    isLoggedIn,
    selectedLocale,
    analytics: {
      shopId: layout.shop.id,
      shopifySalesChannel: ShopifySalesChannel.hydrogen,
    },
  });
}

// Wrap your app with ThemeProvider.
// `specifiedTheme` is the stored theme in the session storage.
// `themeAction` is the action name that's used to change the theme in the session storage.
export default function AppWithProviders() {
  const {theme} = useLoaderData();

  return (
    <ThemeProvider specifiedTheme={theme} themeAction="/api/theme">
      <App />
    </ThemeProvider>
  );
}

// Use the theme in your app.
// If the theme is missing in session storage, PreventFlashOnWrongTheme will get
// the browser theme before hydration and will prevent a flash in the browser.
// The client code runs conditionally, it won't be rendered if we have a theme in session storage.
function App() {
  const data = useLoaderData();
  const [theme] = useTheme();
  const locale = data.selectedLocale ?? DEFAULT_LOCALE;
  const hasUserConsent = true;

  // @ts-ignore
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
          layout={data.layout as LayoutData}
          key={`${locale.language}-${locale.country}`}
        >
          <Outlet />
        </Layout>
        <ScrollRestoration getKey={(location) => location.pathname} />
        <Scripts />
      </body>
    </html>
  );
}

const LAYOUT_QUERY = `#graphql
query layoutMenus(
    $language: LanguageCode
    $headerMenuHandle: String!
    $footerMenuHandle: String!
) @inContext(language: $language) {
    shop {
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
    headerMenu: menu(handle: $headerMenuHandle) {
        id
        items {
            ...MenuItem
            items {
                ...MenuItem
            }
        }
    }
    footerMenu: menu(handle: $footerMenuHandle) {
        id
        items {
            ...MenuItem
            items {
                ...MenuItem
            }
        }
    }
}
fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
}
`;

export interface LayoutData {
  headerMenu: EnhancedMenu;
  footerMenu: EnhancedMenu;
  shop: Shop;
  cart?: Promise<Cart>;
}

async function getLayoutData({storefront}: AppLoadContext) {
  const HEADER_MENU_HANDLE = 'main-menu';
  const FOOTER_MENU_HANDLE = 'footer';

  const data = await storefront.query<LayoutData>(LAYOUT_QUERY, {
    variables: {
      headerMenuHandle: HEADER_MENU_HANDLE,
      footerMenuHandle: FOOTER_MENU_HANDLE,
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  /*
    Modify specific links/routes (optional)
    @see: https://shopify.dev/api/storefront/unstable/enums/MenuItemType
    e.g here we map:
      - /blogs/news -> /news
      - /blog/news/blog-post -> /news/blog-post
      - /collections/all -> /products
  */
  const customPrefixes = {BLOG: '', CATALOG: 'products'};

  const headerMenu = data?.headerMenu
    ? parseMenu(data.headerMenu, customPrefixes)
    : undefined;

  const footerMenu = data?.footerMenu
    ? parseMenu(data.footerMenu, customPrefixes)
    : undefined;

  return {shop: data.shop, headerMenu, footerMenu};
}

const CART_QUERY = `#graphql
query CartQuery($cartId: ID!, $country: CountryCode, $language: LanguageCode)
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
`;

export async function getCart({storefront}: AppLoadContext, cartId: string) {
  invariant(storefront, 'missing storefront client in cart query');

  const {cart} = await storefront.query<{cart?: Cart}>(CART_QUERY, {
    variables: {
      cartId,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  return cart;
}
