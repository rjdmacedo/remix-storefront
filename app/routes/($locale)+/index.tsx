import type {
  ProductConnection,
  CollectionConnection,
} from '@shopify/hydrogen/storefront-api-types';
import React from 'react';
import {defer, type LoaderArgs} from '@shopify/remix-oxygen';
import {V2_MetaFunction} from '@remix-run/react';

import {seoPayload} from '~/lib/seo.server';
import {AnalyticsPageType} from '@shopify/hydrogen';
import {CACHE_SHORT, routeHeaders} from '~/data/cache';
import {Heading, type CollectionHero} from '~/components';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {Button} from '~/components/ui/button';
import {Loader2, Mail} from 'lucide-react';

interface HomeSeoData {
  shop: {
    name: string;
    description: string;
  };
}

export const headers = routeHeaders;

export const meta: V2_MetaFunction = () => {
  return [{title: 'Home'}];
};

export async function loader({params, context}: LoaderArgs) {
  const {language, country} = context.storefront.i18n;

  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the locale URL param is defined, yet we still are on `EN-US`
    // the locale param must be invalid, send to the 404 page
    throw new Response(null, {status: 404});
  }

  const {shop, hero} = await context.storefront.query<{
    shop: HomeSeoData;
    hero: CollectionHero;
  }>(HOMEPAGE_SEO_QUERY, {
    variables: {handle: 'all'},
  });

  const seo = seoPayload.home();

  return defer(
    {
      shop,
      primaryHero: hero,
      // These different queries are separated to illustrate how 3rd party content
      // fetching can be optimized for both above and below the fold.
      featuredProducts: context.storefront.query<{
        products: ProductConnection;
      }>(HOMEPAGE_FEATURED_PRODUCTS_QUERY, {
        variables: {
          /**
           * Country and language properties are automatically injected
           * into all queries. Passing them is unnecessary unless you
           * want to override them from the following default:
           */
          country,
          language,
        },
      }),
      secondaryHero: context.storefront.query<{hero: CollectionHero}>(
        COLLECTION_HERO_QUERY,
        {
          variables: {
            handle: 'backcountry',
            country,
            language,
          },
        },
      ),
      featuredCollections: context.storefront.query<{
        collections: CollectionConnection;
      }>(FEATURED_COLLECTIONS_QUERY, {
        variables: {
          country,
          language,
        },
      }),
      tertiaryHero: context.storefront.query<{hero: CollectionHero}>(
        COLLECTION_HERO_QUERY,
        {
          variables: {
            handle: 'winter-2022',
            country,
            language,
          },
        },
      ),
      seo,
      analytics: {pageType: AnalyticsPageType.home},
    },
    {
      headers: {
        'Cache-Control': CACHE_SHORT,
      },
    },
  );
}

export default function HomePage() {
  // const {
  //   primaryHero,
  //   secondaryHero,
  //   tertiaryHero,
  //   featuredProducts,
  //   featuredCollections,
  // } = useLoaderData<typeof loader>();

  return (
    <div className="m-10 flex gap-2">
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <Heading>Solid</Heading>
        <Button>solid</Button>
        <Button variant="ghost">ghost</Button>
        <Button variant="secondary">
          <Mail className="mr-2 h-4 w-4" /> secondary
        </Button>
        <Button variant="destructive">destructive</Button>

        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
        <Button variant="secondary" disabled>
          secondary loading
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </Button>
        <Button variant="destructive" disabled>
          destructive <Loader2 className="mr-2 h-4 w-4 animate-spin" /> loading
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <Heading>Outline</Heading>
        <Button variant="outline">outline</Button>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <Heading>Link</Heading>
        <Button variant="link">link</Button>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <Heading>Ghost</Heading>
        <Button variant="ghost">ghost</Button>
      </div>
    </div>
  );
}

const COLLECTION_CONTENT_FRAGMENT = `#graphql
fragment CollectionContent on Collection {
    id
    title
    handle
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") {
        value
    }
    byline: metafield(namespace: "hero", key: "byline") {
        value
    }
    cta: metafield(namespace: "hero", key: "cta") {
        value
    }
    spread: metafield(namespace: "hero", key: "spread") {
        reference {
            ...Media
        }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
        reference {
            ...Media
        }
    }
}
${MEDIA_FRAGMENT}
`;

const HOMEPAGE_SEO_QUERY = `#graphql
query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
@inContext(country: $country, language: $language) {
    shop {
        name
        description
    }
    hero: collection(handle: $handle) {
        ...CollectionContent
    }
}
${COLLECTION_CONTENT_FRAGMENT}
`;

const COLLECTION_HERO_QUERY = `#graphql
query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
@inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
        ...CollectionContent
    }
}
${COLLECTION_CONTENT_FRAGMENT}
`;

// @see: https://shopify.dev/api/storefront/2023-04/queries/products
export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)
@inContext(country: $country, language: $language) {
    products(first: 8) {
        nodes {
            ...ProductCard
        }
    }
}
${PRODUCT_CARD_FRAGMENT}
`;

// @see: https://shopify.dev/api/storefront/2023-04/queries/collections
export const FEATURED_COLLECTIONS_QUERY = `#graphql
query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)
@inContext(country: $country, language: $language) {
    collections(
        first: 4,
        sortKey: UPDATED_AT
    ) {
        nodes {
            id
            title
            handle
            image {
                altText
                width
                height
                url
            }
        }
    }
}
`;
