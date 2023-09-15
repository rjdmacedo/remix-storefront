import {Suspense} from 'react';
import {defer, type LoaderArgs} from '@shopify/remix-oxygen';
import {Await, Form, useLoaderData} from '@remix-run/react';
import {Pagination, getPaginationVariables} from '@shopify/hydrogen';
import {MagnifyingGlassIcon} from '@radix-ui/react-icons';

import {
  Grid,
  Section,
  PageHeader,
  ProductCard,
  ProductSwimlane,
  FeaturedCollections,
} from '~/components';
import {seoPayload} from '~/lib/seo.server';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {
  getImageLoadingPriority,
  MAX_AMOUNT_SIZE,
  PAGINATION_SIZE,
} from '~/lib/const';
import {Button, Input, Typography} from '~/components/ui';

import type {PaginatedProductsSearchQuery} from '../../storefrontapi.generated';

import {
  getFeaturedData,
  type FeaturedData,
} from './($locale).featured-products';

export async function loader({request, context: {storefront}}: LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;
  const searchTerm = searchParams.get('q')!;
  const variables = getPaginationVariables(request, {pageBy: MAX_AMOUNT_SIZE});

  const {products} = await storefront.query<PaginatedProductsSearchQuery>(
    SEARCH_QUERY,
    {
      variables: {
        searchTerm,
        ...variables,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    },
  );

  const shouldGetRecommendations = !searchTerm || products?.nodes?.length === 0;

  const seo = seoPayload.collection({
    url: request.url,
    collection: {
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
    },
  });

  return defer({
    seo,
    products,
    searchTerm,
    noResultRecommendations: shouldGetRecommendations
      ? getNoResultRecommendations(storefront)
      : Promise.resolve(null),
  });
}

export default function Search() {
  const {products, searchTerm, noResultRecommendations} =
    useLoaderData<typeof loader>();

  const noResults = products?.nodes?.length === 0;

  return (
    <>
      <PageHeader>
        <Typography.Title format>Search</Typography.Title>
        <Form method="get" className="flex w-full gap-2">
          <Input
            name="q"
            type="search"
            prefix={<MagnifyingGlassIcon className="h-5 w-5" />}
            className="w-full"
            placeholder="Search…"
            defaultValue={searchTerm}
          />
          <Button type="submit" variant="default">
            Search
          </Button>
        </Form>
      </PageHeader>

      {!searchTerm || noResults ? (
        <NoResults
          noResults={noResults}
          recommendations={noResultRecommendations}
        />
      ) : (
        <Section>
          <Pagination connection={products}>
            {({nodes, isLoading, NextLink, PreviousLink}) => {
              const itemsMarkup = nodes.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  loading={getImageLoadingPriority(i)}
                />
              ));

              return (
                <>
                  <div className="mt-6 flex items-center justify-center">
                    <PreviousLink className="bg-contrast inline-block w-full rounded border border-primary/10 px-6 py-3 text-center font-medium text-primary">
                      {isLoading ? 'Loading...' : 'Previous'}
                    </PreviousLink>
                  </div>
                  <Grid data-test="product-grid">{itemsMarkup}</Grid>
                  <div className="mt-6 flex items-center justify-center">
                    <NextLink className="bg-contrast inline-block w-full rounded border border-primary/10 px-6 py-3 text-center font-medium text-primary">
                      {isLoading ? 'Loading...' : 'Next'}
                    </NextLink>
                  </div>
                </>
              );
            }}
          </Pagination>
        </Section>
      )}
    </>
  );
}

function NoResults({
  noResults,
  recommendations,
}: {
  noResults: boolean;
  recommendations: Promise<null | FeaturedData>;
}) {
  return (
    <>
      {noResults && (
        <Section>
          <Typography.Text className="text-center opacity-50">
            No results, try a different search.
          </Typography.Text>
        </Section>
      )}
      <Suspense>
        <Await
          resolve={recommendations}
          errorElement="There was a problem loading related products"
        >
          {(result) => {
            if (!result) return null;

            const {featuredCollections, featuredProducts} = result;

            return (
              <>
                <FeaturedCollections
                  title="Trending Collections"
                  collections={featuredCollections}
                />
                <ProductSwimlane
                  title="Trending Products"
                  products={featuredProducts}
                />
              </>
            );
          }}
        </Await>
      </Suspense>
    </>
  );
}

export function getNoResultRecommendations(
  storefront: LoaderArgs['context']['storefront'],
) {
  return getFeaturedData(storefront, {pageBy: PAGINATION_SIZE});
}

const SEARCH_QUERY = `#graphql
  query PaginatedProductsSearch(
    $last: Int
    $first: Int
    $country: CountryCode
    $language: LanguageCode
    $endCursor: String
    $searchTerm: String
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      last: $last,
      first: $first,
      query: $searchTerm
      after: $endCursor,
      before: $startCursor,
      sortKey: RELEVANCE,
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

  ${PRODUCT_CARD_FRAGMENT}
` as const;
