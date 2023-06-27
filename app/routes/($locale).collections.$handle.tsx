import type {
  Filter,
  ProductCollectionSortKeys,
} from '@shopify/hydrogen/storefront-api-types';
import {
  Pagination,
  flattenConnection,
  AnalyticsPageType,
  getPaginationVariables,
} from '@shopify/hydrogen';
import React from 'react';
import invariant from 'tiny-invariant';
import {useLoaderData} from '@remix-run/react';
import {json, type LoaderArgs} from '@shopify/remix-oxygen';

import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import {Button, Typography} from '~/components/ui';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getImageLoadingPriority} from '~/lib/const';
import type {AppliedFilter, SortParam} from '~/components/sort-filter';
import {Grid, Section, PageHeader, SortFilter, ProductCard} from '~/components';

import type {CollectionDetailsQuery} from '../../storefrontapi.generated';

export const headers = routeHeaders;

type VariantFilterParam = Record<string, string | boolean>;
type PriceFiltersQueryParam = Record<'price', {max?: number; min?: number}>;
type VariantOptionFiltersQueryParam = Record<
  'variantOption',
  {name: string; value: string}
>;
type FiltersQueryParams = Array<
  VariantFilterParam | PriceFiltersQueryParam | VariantOptionFiltersQueryParam
>;

export async function loader({params, request, context}: LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });
  const {handle} = params;

  invariant(handle, 'Missing "$handle" param');

  const available = 'available';
  const knownFilters = ['productVendor', 'productType'];
  const variantOption = 'variantOption';

  const filters: FiltersQueryParams = [];
  const appliedFilters: AppliedFilter[] = [];

  const searchParams = new URL(request.url).searchParams;

  const {sortKey, reverse} = getSortValuesFromParam(
    searchParams.get('sort') as SortParam,
  );

  for (const [key, value] of searchParams.entries()) {
    if (available === key) {
      filters.push({available: value === 'true'});
      appliedFilters.push({
        label: value === 'true' ? 'In stock' : 'Out of stock',
        urlParam: {
          key: available,
          value,
        },
      });
    } else if (knownFilters.includes(key)) {
      filters.push({[key]: value});
      appliedFilters.push({label: value, urlParam: {key, value}});
    } else if (key.includes(variantOption)) {
      const [name, val] = value.split(':');
      filters.push({variantOption: {name, value: val}});
      appliedFilters.push({label: val, urlParam: {key, value}});
    }
  }

  // Builds min and max price filter since we can't stack them separately into
  // the filter array. See price filters limitations:
  // https://shopify.dev/custom-storefronts/products-collections/filter-products#limitations
  if (searchParams.has('minPrice') || searchParams.has('maxPrice')) {
    const price: {min?: number; max?: number} = {};
    if (searchParams.has('minPrice')) {
      price.min = Number(searchParams.get('minPrice')) || 0;
      appliedFilters.push({
        label: `Min: $${price.min}`,
        urlParam: {key: 'minPrice', value: searchParams.get('minPrice')!},
      });
    }
    if (searchParams.has('maxPrice')) {
      price.max = Number(searchParams.get('maxPrice')) || 0;
      appliedFilters.push({
        label: `Max: $${price.max}`,
        urlParam: {key: 'maxPrice', value: searchParams.get('maxPrice')!},
      });
    }
    filters.push({
      price,
    });
  }

  const {collection, collections} =
    await context.storefront.query<CollectionDetailsQuery>(COLLECTION_QUERY, {
      variables: {
        ...paginationVariables,
        handle,
        filters,
        sortKey,
        reverse,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    });

  if (!collection) {
    throw new Response('collection', {status: 404});
  }

  const seo = seoPayload.collection({collection, url: request.url});

  return json({
    seo,
    analytics: {
      handle,
      pageType: AnalyticsPageType.collection,
      resourceId: collection.id,
    },
    collection,
    collections: flattenConnection(collections),
    appliedFilters,
  });
}

export default function Collection() {
  const {collection, collections, appliedFilters} =
    useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading={collection.title}>
        {collection?.description && (
          <div className="flex w-full items-baseline justify-between">
            <div>
              <Typography.Text format spacing="tight" as="p">
                {collection.description}
              </Typography.Text>
            </div>
          </div>
        )}
      </PageHeader>

      <Section>
        <SortFilter
          filters={collection.products.filters as Filter[]}
          collections={collections}
          appliedFilters={appliedFilters}
        >
          <Pagination connection={collection.products}>
            {({
              nodes,
              NextLink,
              isLoading,
              hasNextPage,
              PreviousLink,
              hasPreviousPage,
            }) => (
              <>
                {hasPreviousPage && (
                  <div className="mb-6 flex items-center justify-center">
                    <Button as={PreviousLink} className="w-full">
                      {isLoading ? 'Loading...' : 'Load previous'}
                    </Button>
                  </div>
                )}

                <Grid layout="products">
                  {nodes.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      loading={getImageLoadingPriority(i)}
                      quickAdd
                    />
                  ))}
                </Grid>

                {hasNextPage && (
                  <div className="mt-6 flex items-center justify-center">
                    <Button as={NextLink} className="w-full">
                      {isLoading ? 'Loading...' : 'Load more products'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </Pagination>
        </SortFilter>
      </Section>
    </>
  );
}

const COLLECTION_QUERY = `#graphql
  query CollectionDetails(
    $last: Int
    $first: Int
    $handle: String!
    $country: CountryCode
    $reverse: Boolean
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $language: LanguageCode
    $endCursor: String
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      seo {
        title
        description
      }
      image {
        id
        url
        width
        height
        altText
      }
      products(
        last: $last,
        first: $first,
        after: $endCursor,
        before: $startCursor,
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        nodes {
          ...ProductCard
        }
        filters {
          id
          type
          label
          values {
            id
            count
            label
            input
          }
        }
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
    }
    collections(first: 100) {
      edges {
        node {
          title
          handle
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

function getSortValuesFromParam(sortParam: SortParam | null): {
  sortKey: ProductCollectionSortKeys;
  reverse: boolean;
} {
  switch (sortParam) {
    case 'price-high-low':
      return {
        sortKey: 'PRICE',
        reverse: true,
      };
    case 'price-low-high':
      return {
        sortKey: 'PRICE',
        reverse: false,
      };
    case 'best-selling':
      return {
        sortKey: 'BEST_SELLING',
        reverse: false,
      };
    case 'newest':
      return {
        sortKey: 'CREATED',
        reverse: true,
      };
    case 'featured':
      return {
        sortKey: 'MANUAL',
        reverse: false,
      };
    default:
      return {
        sortKey: 'RELEVANCE',
        reverse: false,
      };
  }
}
