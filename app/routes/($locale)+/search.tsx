import type {
  Product,
  Collection,
  ProductConnection,
} from '@shopify/hydrogen/storefront-api-types';
import React, {Suspense} from 'react';
import invariant from 'tiny-invariant';
import {Await, useLoaderData} from '@remix-run/react';
import {defer, type LoaderArgs} from '@shopify/remix-oxygen';

import {
  Text,
  Section,
  ProductGrid,
  ProductSwimlane,
  FeaturedCollections,
} from '~/components';
import {seoPayload} from '~/lib/seo.server';
import {PAGINATION_SIZE} from '~/lib/const';
import {
  SEARCH_QUERY,
  getNoResultRecommendations,
} from '~/routes/($locale)+/api+/search';
import {Typography} from '~/components/ui/typography';

export async function loader({request, context: {storefront}}: LoaderArgs) {
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
  const {searchTerm, products, noResultRecommendations} = useLoaderData();

  const noResults = products?.nodes?.length === 0;

  return (
    <>
      {!searchTerm || noResults ? (
        <>
          {noResults && (
            <Section padding="all" heading="Uh oh!">
              <Typography.Text
                color="default"
                size="default"
                align="default"
                leading="default"
                spacing="default"
              >
                No results, try something else.
              </Typography.Text>
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
                    collections={data!.featuredCollections as Collection[]}
                  />
                  <ProductSwimlane
                    title="Trending Products"
                    products={data!.featuredProducts as Product[]}
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
            url={`/api/search?q=${searchTerm}`}
            collection={{products} as Collection}
          />
        </Section>
      )}
    </>
  );
}
