import invariant from 'tiny-invariant';
import {useLoaderData} from '@remix-run/react';
import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Pagination, getPaginationVariables} from '@shopify/hydrogen';

import {cn} from '~/lib/utils';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import {buttonVariants} from '~/components/ui';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getImageLoadingPriority} from '~/lib/const';
import {PageHeader, Section, ProductCard, Grid} from '~/components';

import type {AllProductsQuery} from '../../storefrontapi.generated';

const PAGE_BY = 8;

export const headers = routeHeaders;

export async function loader({
  request,
  context: {storefront},
}: LoaderFunctionArgs) {
  const variables = getPaginationVariables(request, {pageBy: PAGE_BY});

  const data = await storefront.query<AllProductsQuery>(ALL_PRODUCTS_QUERY, {
    variables: {
      ...variables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from the API');

  const seo = seoPayload.collection({
    url: request.url,
    collection: {
      id: 'all-products',
      title: 'All Products',
      handle: 'products',
      products: data.products,
      updatedAt: '',
      metafields: [],
      description: 'All the store products',
      descriptionHtml: 'All the store products',
      seo: {
        title: 'All Products',
        description: 'All the store products',
      },
    },
  });

  return json({
    seo,
    products: data.products,
  });
}

export default function AllProducts() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading="All Products" />

      <Section>
        <Pagination connection={products}>
          {({nodes, isLoading, NextLink, PreviousLink}) => (
            <>
              <div className="mb-6 flex items-center justify-center">
                <PreviousLink className={cn(buttonVariants(), 'block w-full')}>
                  {isLoading ? 'Loading...' : 'Previous'}
                </PreviousLink>
              </div>

              <Grid data-test="product-grid">
                {nodes.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quickAdd
                    loading={getImageLoadingPriority(idx)}
                  />
                ))}
              </Grid>

              <div className="mt-6 flex items-center justify-center">
                <NextLink className={cn(buttonVariants(), 'block w-full')}>
                  {isLoading ? 'Loading...' : 'Next'}
                </NextLink>
              </div>
            </>
          )}
        </Pagination>
      </Section>
    </>
  );
}

const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts(
    $last: Int
    $first: Int
    $country: CountryCode
    $language: LanguageCode
    $endCursor: String
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    products(last: $last, first: $first, after: $endCursor, before: $startCursor) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
