import {
  defer,
  type LoaderArgs,
  type LinksFunction,
  type AppLoadContext,
} from '@shopify/remix-oxygen';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  useLoaderData,
  ScrollRestoration,
} from '@remix-run/react';
import {ShopifySalesChannel, Seo} from '@shopify/hydrogen';
import styles from './styles/tailwind.css';
import favicon from '../public/favicon.ico';
import {seoPayload} from '~/lib/seo.server';
import {
  parseMenu,
  getCartId,
  DEFAULT_LOCALE,
  type EnhancedMenu,
} from './lib/utils';
import invariant from 'tiny-invariant';
import {Shop, Cart} from '@shopify/hydrogen/storefront-api-types';
import {useAnalytics} from '~/hooks';
import React from 'react';
import {Layout} from '~/components';

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
  const [customerAccessToken, layout] = await Promise.all([
    context.session.get('customerAccessToken'),
    getLayoutData(context),
  ]);

  const seo = seoPayload.root({shop: layout.shop, url: request.url});

  return defer({
    isLoggedIn: Boolean(customerAccessToken),
    layout,
    selectedLocale: context.storefront.i18n,
    cart: cartId ? getCart(context, cartId) : undefined,
    analytics: {
      shopifySalesChannel: ShopifySalesChannel.hydrogen,
      shopId: layout.shop.id,
    },
    seo,
  });
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  const locale = data.selectedLocale ?? DEFAULT_LOCALE;
  const hasUserConsent = true;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  useAnalytics(hasUserConsent, locale);

  return (
    <html lang={locale.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Seo />
        <Meta />
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
