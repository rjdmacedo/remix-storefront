import type {
  ProductConnection,
  CollectionConnection,
} from '@shopify/hydrogen/storefront-api-types';
import React from 'react';
import {defer, type LoaderArgs} from '@shopify/remix-oxygen';
import {useLoaderData, V2_MetaFunction} from '@remix-run/react';

import {seoPayload} from '~/lib/seo.server';
import {AnalyticsPageType} from '@shopify/hydrogen';
import {CACHE_SHORT, routeHeaders} from '~/data/cache';
import {Prose, type CollectionHero} from '~/components';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';

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
    <>
      <Prose as="article">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error fuga
        harum non officiis praesentium repellat veritatis voluptas! Animi autem
        commodi dicta doloribus est eveniet exercitationem, necessitatibus
        nesciunt quod voluptate. Nisi. Lorem ipsum dolor sit amet, consectetur
        adipisicing elit. Animi aperiam aut autem beatae dignissimos, dolor
        doloremque doloribus eos ipsa iure maxime praesentium quaerat saepe
        suscipit temporibus tenetur, veniam. Libero, praesentium? Lorem ipsum
        dolor sit amet, consectetur adipisicing elit. Aperiam asperiores
        blanditiis dolorum fugit laboriosam minima odio placeat tenetur, vitae.
        Architecto dicta enim excepturi labore natus officia, praesentium quas
        tempore totam! Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        Autem, dignissimos libero maxime pariatur ratione sapiente! Ad animi
        aperiam asperiores cumque inventore necessitatibus nobis, perspiciatis
        quas quo sed totam unde velit. Lorem ipsum dolor sit amet, consectetur
        adipisicing elit. In omnis quaerat quibusdam reiciendis! Animi minus nam
        necessitatibus vero! Aut dolorem ducimus est molestiae obcaecati qui
        repellendus saepe sed suscipit unde.
      </Prose>

      <Prose as="article">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error fuga
        harum non officiis praesentium repellat veritatis voluptas! Animi autem
        commodi dicta doloribus est eveniet exercitationem, necessitatibus
        nesciunt quod voluptate. Nisi. Lorem ipsum dolor sit amet, consectetur
        adipisicing elit. Animi aperiam aut autem beatae dignissimos, dolor
        doloremque doloribus eos ipsa iure maxime praesentium quaerat saepe
        suscipit temporibus tenetur, veniam. Libero, praesentium? Lorem ipsum
        dolor sit amet, consectetur adipisicing elit. Aperiam asperiores
        blanditiis dolorum fugit laboriosam minima odio placeat tenetur, vitae.
        Architecto dicta enim excepturi labore natus officia, praesentium quas
        tempore totam! Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        Autem, dignissimos libero maxime pariatur ratione sapiente! Ad animi
        aperiam asperiores cumque inventore necessitatibus nobis, perspiciatis
        quas quo sed totam unde velit. Lorem ipsum dolor sit amet, consectetur
        adipisicing elit. In omnis quaerat quibusdam reiciendis! Animi minus nam
        necessitatibus vero! Aut dolorem ducimus est molestiae obcaecati qui
        repellendus saepe sed suscipit unde.
      </Prose>

      <Prose as="article">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error fuga
        harum non officiis praesentium repellat veritatis voluptas! Animi autem
        commodi dicta doloribus est eveniet exercitationem, necessitatibus
        nesciunt quod voluptate. Nisi. Lorem ipsum dolor sit amet, consectetur
        adipisicing elit. Animi aperiam aut autem beatae dignissimos, dolor
        doloremque doloribus eos ipsa iure maxime praesentium quaerat saepe
        suscipit temporibus tenetur, veniam. Libero, praesentium? Lorem ipsum
        dolor sit amet, consectetur adipisicing elit. Aperiam asperiores
        blanditiis dolorum fugit laboriosam minima odio placeat tenetur, vitae.
        Architecto dicta enim excepturi labore natus officia, praesentium quas
        tempore totam! Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        Autem, dignissimos libero maxime pariatur ratione sapiente! Ad animi
        aperiam asperiores cumque inventore necessitatibus nobis, perspiciatis
        quas quo sed totam unde velit. Lorem ipsum dolor sit amet, consectetur
        adipisicing elit. In omnis quaerat quibusdam reiciendis! Animi minus nam
        necessitatibus vero! Aut dolorem ducimus est molestiae obcaecati qui
        repellendus saepe sed suscipit unde.
      </Prose>

      <Prose as="article">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error fuga
        harum non officiis praesentium repellat veritatis voluptas! Animi autem
        commodi dicta doloribus est eveniet exercitationem, necessitatibus
        nesciunt quod voluptate. Nisi. Lorem ipsum dolor sit amet, consectetur
        adipisicing elit. Animi aperiam aut autem beatae dignissimos, dolor
        doloremque doloribus eos ipsa iure maxime praesentium quaerat saepe
        suscipit temporibus tenetur, veniam. Libero, praesentium? Lorem ipsum
        dolor sit amet, consectetur adipisicing elit. Aperiam asperiores
        blanditiis dolorum fugit laboriosam minima odio placeat tenetur, vitae.
        Architecto dicta enim excepturi labore natus officia, praesentium quas
        tempore totam! Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        Autem, dignissimos libero maxime pariatur ratione sapiente! Ad animi
        aperiam asperiores cumque inventore necessitatibus nobis, perspiciatis
        quas quo sed totam unde velit. Lorem ipsum dolor sit amet, consectetur
        adipisicing elit. In omnis quaerat quibusdam reiciendis! Animi minus nam
        necessitatibus vero! Aut dolorem ducimus est molestiae obcaecati qui
        repellendus saepe sed suscipit unde.
      </Prose>
    </>
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
