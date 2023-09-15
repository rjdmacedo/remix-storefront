import {json, type LoaderArgs} from '@shopify/remix-oxygen';
import invariant from 'tiny-invariant';

import {
  PRODUCT_CARD_FRAGMENT,
  FEATURED_COLLECTION_FRAGMENT,
} from '~/data/fragments';

import type {FeaturedItemsQuery} from '../../storefrontapi.generated';

export async function loader({context: {storefront}}: LoaderArgs) {
  return json(await getFeaturedData(storefront));
}

export async function getFeaturedData(
  storefront: LoaderArgs['context']['storefront'],
  variables: {pageBy?: number} = {},
) {
  const data = await storefront.query<FeaturedItemsQuery>(
    FEATURED_ITEMS_QUERY,
    {
      variables: {
        pageBy: 12,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
        ...variables,
      },
    },
  );

  invariant(data, 'No featured items data returned from the API');

  return data;
}

export type FeaturedData = Awaited<ReturnType<typeof getFeaturedData>>;

export const FEATURED_ITEMS_QUERY = `#graphql
  query FeaturedItems(
    $pageBy: Int = 12
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    featuredCollections: collections(first: 3, sortKey: UPDATED_AT) {
      nodes {
        ...FeaturedCollectionDetails
      }
    }
    featuredProducts: products(first: $pageBy) {
      nodes {
        ...ProductCard
      }
    }
  }

  ${PRODUCT_CARD_FRAGMENT}
  ${FEATURED_COLLECTION_FRAGMENT}
` as const;
