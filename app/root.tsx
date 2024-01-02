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
import type {
  LinksFunction,
  SerializeFrom,
  AppLoadContext,
  LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import React from 'react';
import {defer} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';
import type {ShouldRevalidateFunction} from '@remix-run/react';
import {ShopifySalesChannel, Seo, useNonce} from '@shopify/hydrogen';
import {PreventFlashOnWrongTheme, ThemeProvider, useTheme} from 'remix-themes';

import styles from '~/styles/tailwind.css';
import {Layout} from '~/components';
import {getToast} from '~/lib/toast.server';
import {NotFound} from '~/components/NotFound';
import {seoPayload} from '~/lib/seo.server';
import {useAnalytics} from '~/hooks';
import {GenericError} from '~/components/GenericError';
import {themeSessionResolver} from '~/lib/hydrogen.server';
import {CUSTOMER_ACCESS_TOKEN} from '~/lib/const';
import {Toaster, TooltipProvider} from '~/components/ui';
import {parseMenu, DEFAULT_LOCALE} from '~/lib/utils';

import favicon from '../public/favicon.ico';

// This is important to avoid re-fetching root queries on sub-navigations
export const shouldRevalidate: ShouldRevalidateFunction = ({
  nextUrl,
  currentUrl,
  formMethod,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'get') {
    return true;
  }
  // revalidate when manually revalidating via useRevalidator
  return currentUrl.toString() === nextUrl.toString();
};

export const links: LinksFunction = () => {
  return [
    {rel: 'stylesheet', href: styles},
    {rel: 'preconnect', href: 'https://cdn.shopify.com'},
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
};

export const useRootLoaderData = () => {
  const [root] = useMatches();
  return root?.data as SerializeFrom<typeof loader>;
};

export async function loader({request, context}: LoaderFunctionArgs) {
  const {session, storefront, cart} = context;
  const [theme, layout, customerAccessToken, {toast, headers}] =
    await Promise.all([
      themeSessionResolver(request).then(({getTheme}) => getTheme()),
      getLayoutData(context),
      session.get(CUSTOMER_ACCESS_TOKEN),
      getToast(request),
    ]);

  const seo = seoPayload.root({shop: layout.shop, url: request.url});

  return defer(
    {
      seo,
      cart: cart.get(),
      theme,
      toast,
      layout,
      isLoggedIn: Boolean(customerAccessToken),
      selectedLocale: storefront.i18n,
      analytics: {
        shopId: layout.shop.id,
        shopifySalesChannel: ShopifySalesChannel.hydrogen,
      },
    },
    {headers},
  );
}

// Wrap your app with ThemeProvider.
// `specifiedTheme` is the stored theme in the session storage.
// `themeAction` is the action name that's used to change the theme in the session storage.
export default function AppWithProviders() {
  const {theme} = useRootLoaderData();

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
        <meta name="msvalidate.01" content="A352E6A0AF9A652267361BBB572B8468" />
        <Seo />
        <Meta />
        <Links />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
      </head>
      <body>
        <Layout
          key={`${locale.language}-${locale.country}`}
          layout={data.layout}
        >
          <Outlet />
          <Toaster />
        </Layout>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload nonce={nonce} />
      </body>
    </html>
  );
}

export function ErrorBoundary({error}: {error: Error | unknown}) {
  const nonce = useNonce();
  const rootData = useRootLoaderData();
  const routeError = useRouteError();

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
fragment MenuItem on MenuItem {
  id
  resourceId
  tags
  title
  type
  url
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
fragment Menu on Menu {
  id
  items {
    ...ParentMenuItem
  }
}
` as const;

async function getLayoutData({env, storefront}: AppLoadContext) {
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
