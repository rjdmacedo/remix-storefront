import React, {useEffect} from 'react';
import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, useNavigate} from '@remix-run/react';
import {useInView} from 'react-intersection-observer';
import type {
  Filter,
  ProductCollectionSortKeys,
  ProductFilter,
} from '@shopify/hydrogen/storefront-api-types';
import {
  AnalyticsPageType,
  Pagination,
  flattenConnection,
  getPaginationVariables,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';

import type {SortParam} from '~/components';
import {
  Grid,
  Section,
  PageHeader,
  SortFilter,
  ProductCard,
  FILTER_URL_PREFIX,
} from '~/components';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {routeHeaders} from '~/data/cache';
import {seoPayload} from '~/lib/seo.server';
import {getImageLoadingPriority} from '~/lib/const';
import {parseAsCurrency} from '~/lib/utils';
import {Button, Typography} from '~/components/ui';

export const headers = routeHeaders;

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });
  const {handle} = params;
  const locale = context.storefront.i18n;

  invariant(handle, 'Missing "$handle" param');

  const searchParams = new URL(request.url).searchParams;

  const {sortKey, reverse} = getSortValuesFromParam(
    searchParams.get('sort') as SortParam,
  );
  const filters = [...searchParams.entries()].reduce(
    (filters, [key, value]) => {
      if (key.startsWith(FILTER_URL_PREFIX)) {
        const filterKey = key.substring(FILTER_URL_PREFIX.length);
        filters.push({
          [filterKey]: JSON.parse(value),
        });
      }
      return filters;
    },
    [] as ProductFilter[],
  );

  const {collection, collections} = await context.storefront.query(
    COLLECTION_QUERY,
    {
      variables: {
        ...paginationVariables,
        handle,
        filters,
        sortKey,
        reverse,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    },
  );

  if (!collection) {
    throw new Response('collection', {status: 404});
  }

  const seo = seoPayload.collection({collection, url: request.url});

  const allFilterValues = collection.products.filters.flatMap(
    (filter) => filter.values,
  );

  const appliedFilters = filters
    .map((filter) => {
      const foundValue = allFilterValues.find((value) => {
        const valueInput = JSON.parse(value.input as string) as ProductFilter;
        // special case for price, the user can enter something freeform (still a number, though)
        // that may not make sense for the locale/currency.
        // Basically just check if the price filter is applied at all.
        if (valueInput.price && filter.price) {
          return true;
        }
        return (
          // This comparison should be okay as long as we're not manipulating the input we
          // get from the API before using it as a URL param.
          JSON.stringify(valueInput) === JSON.stringify(filter)
        );
      });
      if (!foundValue) {
        // eslint-disable-next-line no-console
        console.error('Could not find filter value for filter', filter);
        return null;
      }

      if (foundValue.id === 'filter.v.price') {
        // Special case for price, we want to show the min and max values as the label.
        const input = JSON.parse(foundValue.input as string) as ProductFilter;
        const min = parseAsCurrency(input.price?.min ?? 0, locale);
        const max = input.price?.max
          ? parseAsCurrency(input.price.max, locale)
          : '';
        const label = min && max ? `${min} - ${max}` : 'Price';

        return {
          filter,
          label,
        };
      }
      return {
        filter,
        label: foundValue.label,
      };
    })
    .filter((filter): filter is NonNullable<typeof filter> => filter !== null);

  return json({
    collection,
    appliedFilters,
    collections: flattenConnection(collections),
    analytics: {
      pageType: AnalyticsPageType.collection,
      resourceId: collection.id,
      collectionHandle: handle,
    },
    seo,
  });
}

export default function Collection() {
  const {collection, collections, appliedFilters} =
    useLoaderData<typeof loader>();

  const {ref, inView} = useInView();

  return (
    <>
      <PageHeader heading={collection.title}>
        {collection?.description && (
          <div className="flex items-baseline justify-between w-full">
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
          appliedFilters={appliedFilters}
          collections={collections}
        >
          <Pagination connection={collection.products}>
            {({
              nodes,
              isLoading,
              PreviousLink,
              NextLink,
              nextPageUrl,
              hasNextPage,
              state,
            }) => (
              <>
                <div className="flex items-center justify-center mb-6">
                  <Button as={PreviousLink} variant="secondary">
                    {isLoading ? 'Loading...' : 'Load previous'}
                  </Button>
                </div>
                <ProductsLoadedOnScroll
                  nodes={nodes}
                  inView={inView}
                  nextPageUrl={nextPageUrl}
                  hasNextPage={hasNextPage}
                  state={state}
                />
                <div className="flex items-center justify-center mt-6">
                  <Button ref={ref} as={NextLink} variant="secondary">
                    {isLoading ? 'Loading...' : 'Load more products'}
                  </Button>
                </div>
              </>
            )}
          </Pagination>
        </SortFilter>
      </Section>
    </>
  );
}

function ProductsLoadedOnScroll({
  nodes,
  inView,
  nextPageUrl,
  hasNextPage,
  state,
}: {
  nodes: any;
  inView: boolean;
  nextPageUrl: string;
  hasNextPage: boolean;
  state: any;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (inView && hasNextPage) {
      navigate(nextPageUrl, {
        replace: true,
        preventScrollReset: true,
        state,
      });
    }
  }, [inView, navigate, state, nextPageUrl, hasNextPage]);

  return (
    <Grid layout="products">
      {nodes.map((product: any, i: number) => (
        <ProductCard
          key={product.id}
          product={product}
          loading={getImageLoadingPriority(i)}
          quickAdd
        />
      ))}
    </Grid>
  );
}

const COLLECTION_QUERY = `#graphql
query CollectionDetails(
  $handle: String!
  $country: CountryCode
  $language: LanguageCode
  $filters: [ProductFilter!]
  $sortKey: ProductCollectionSortKeys!
  $reverse: Boolean
  $first: Int
  $last: Int
  $startCursor: String
  $endCursor: String
) @inContext(country: $country, language: $language) {
  collection(handle: $handle) {
    id
    handle
    title
    description
    seo {
      description
      title
    }
    image {
      id
      url
      width
      height
      altText
    }
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
      filters: $filters,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      filters {
        id
        label
        type
        values {
          id
          label
          count
          input
        }
      }
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        endCursor
        startCursor
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
