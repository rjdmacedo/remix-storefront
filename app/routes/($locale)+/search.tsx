import type {
  Product,
  Collection,
  ProductConnection,
  CollectionConnection,
} from '@shopify/hydrogen/storefront-api-types';
import React, {Suspense} from 'react';
import invariant from 'tiny-invariant';
import {flattenConnection} from '@shopify/hydrogen';
import {Await, Form, useLoaderData} from '@remix-run/react';
import {defer, type LoaderArgs, SerializeFrom} from '@shopify/remix-oxygen';

import {
  Text,
  Input,
  Section,
  Heading,
  PageHeader,
  ProductGrid,
  ProductSwimlane,
  FeaturedCollections,
  Button,
} from '~/components';
import {seoPayload} from '~/lib/seo.server';
import {PAGINATION_SIZE} from '~/lib/const';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {
  EnvelopeIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export async function loader({request, context: {storefront}}: LoaderArgs) {
  console.log(storefront.i18n.country);
  const searchParams = new URL(request.url).searchParams;

  const cursor = searchParams.get('cursor')!;
  const searchTerm = searchParams.get('q')!;

  const data = await storefront.query<{
    products: ProductConnection;
  }>(SEARCH_QUERY, {
    variables: {
      cursor,
      pageBy: PAGINATION_SIZE,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
      searchTerm,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  const {products} = data;

  const getRecommendations = !searchTerm || products?.nodes?.length === 0;
  const seoCollection = {
    id: 'search',
    title: 'Search',
    handle: 'search',
    descriptionHtml: 'Search results',
    description: 'Search results',
    seo: {
      title: 'Search',
      description: `Showing ${products.nodes.length} search results for "${searchTerm}"`,
    },
    metafields: [],
    products,
    updatedAt: new Date().toISOString(),
  } satisfies Collection;

  const seo = seoPayload.collection({
    collection: seoCollection,
    url: request.url,
  });

  return defer({
    seo,
    searchTerm,
    products,
    noResultRecommendations: getRecommendations
      ? getNoResultRecommendations(storefront)
      : null,
  });
}

export default function SearchPage() {
  const {searchTerm, products, noResultRecommendations} =
    useLoaderData<typeof loader>();

  const noResults = products?.nodes?.length === 0;

  return (
    <>
      <PageHeader>
        <Form method="get" className="flex w-full items-center justify-end">
          <Input
            name="q"
            type="search"
            className="w-full max-w-sm px-10"
            placeholder="Type something to search…"
            defaultValue={searchTerm}
            prefix={
              <button type="submit" className="p-1">
                <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            }
            suffix={
              <button type="submit" className="px-2">
                Go
              </button>
            }
          />
        </Form>
      </PageHeader>
      {!searchTerm || noResults ? (
        <>
          {noResults && (
            <Section padding="x">
              <Text className="opacity-50">
                No results, try something else.
              </Text>
            </Section>
          )}
          <Suspense>
            <Await
              errorElement="There was a problem loading related products"
              resolve={noResultRecommendations}
            >
              {(data) => (
                <>
                  <FeaturedCollections
                    title="Trending Collections"
                    collections={
                      data!.featuredCollections as SerializeFrom<Collection[]>
                    }
                  />
                  <ProductSwimlane
                    title="Trending Products"
                    products={
                      data!.featuredProducts as SerializeFrom<Product[]>
                    }
                  />
                </>
              )}
            </Await>
          </Suspense>
        </>
      ) : (
        <Section>
          <ProductGrid
            key="search"
            url={`/search?q=${searchTerm}`}
            collection={{products} as Collection}
          />
        </Section>
      )}
    </>
  );
}

export const SEARCH_QUERY = `#graphql
${PRODUCT_CARD_FRAGMENT}
query search(
    $pageBy: Int!
    $after: String
    $country: CountryCode
    $language: LanguageCode
    $searchTerm: String
) @inContext(country: $country, language: $language) {
    products(
        first: $pageBy
        query: $searchTerm
        after: $after
        sortKey: RELEVANCE
    ) {
        nodes {
            ...ProductCard
        }
        pageInfo {
            startCursor
            endCursor
            hasNextPage
            hasPreviousPage
        }
    }
}
`;

export const SEARCH_NO_RESULTS_QUERY = `#graphql
query searchNoResult(
    $pageBy: Int!
    $country: CountryCode
    $language: LanguageCode
) @inContext(country: $country, language: $language) {
    featuredCollections: collections(first: 3, sortKey: UPDATED_AT) {
        nodes {
            id
            title
            handle
            image {
                url
                width
                height
                altText
            }
        }
    }
    featuredProducts: products(first: $pageBy) {
        nodes {
            ...ProductCard
        }
    }
}
${PRODUCT_CARD_FRAGMENT}
`;

export async function getNoResultRecommendations(
  storefront: LoaderArgs['context']['storefront'],
) {
  const data = await storefront.query<{
    featuredProducts: ProductConnection;
    featuredCollections: CollectionConnection;
  }>(SEARCH_NO_RESULTS_QUERY, {
    variables: {
      pageBy: PAGINATION_SIZE,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  return {
    featuredProducts: flattenConnection(data.featuredProducts),
    featuredCollections: flattenConnection(data.featuredCollections),
  };
}
