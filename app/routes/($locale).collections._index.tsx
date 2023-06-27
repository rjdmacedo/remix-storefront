import React from 'react';
import {useLoaderData} from '@remix-run/react';
import type {Collection} from '@shopify/hydrogen/storefront-api-types';
import {json, type DataFunctionArgs} from '@shopify/remix-oxygen';
import {Image, Pagination, getPaginationVariables} from '@shopify/hydrogen';

import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import {Button, Typography} from '~/components/ui';
import {getImageLoadingPriority} from '~/lib/const';
import {Grid, PageHeader, Section, Link} from '~/components';

import type {CollectionsQuery} from '../../storefrontapi.generated';

const PAGINATION_SIZE = 4;

export const headers = routeHeaders;

export async function loader({
  request,
  context: {storefront},
}: DataFunctionArgs) {
  const variables = getPaginationVariables(request, {pageBy: PAGINATION_SIZE});
  const {collections} = await storefront.query<CollectionsQuery>(
    COLLECTIONS_QUERY,
    {
      variables: {
        ...variables,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    },
  );

  const seo = seoPayload.listCollections({
    collections,
    url: request.url,
  });

  return json({collections, seo});
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading="Collections" />

      <Section>
        <Pagination connection={collections}>
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

              <Grid
                items={nodes.length === 3 ? 3 : 2}
                data-test="collection-grid"
              >
                {nodes.map((collection, i) => (
                  <CollectionCard
                    collection={collection as Collection}
                    key={collection.id}
                    loading={getImageLoadingPriority(i, 2)}
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
      </Section>
    </>
  );
}

function CollectionCard({
  loading,
  collection,
}: {
  loading?: HTMLImageElement['loading'];
  collection: Collection;
}) {
  return (
    <Link to={`/collections/${collection.handle}`} className="grid gap-4">
      <div className="card-image aspect-[3/2] bg-primary/5">
        {collection?.image && (
          <Image
            data={collection.image}
            sizes="(max-width: 32em) 100vw, 45vw"
            loading={loading}
            aspectRatio="6/4"
          />
        )}
      </div>
      <Typography.Title as="h3">{collection.title}</Typography.Title>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  query Collections(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
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
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
