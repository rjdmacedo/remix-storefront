import {json, type LoaderArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import type {Collection} from '@shopify/hydrogen/storefront-api-types';
import {
  Image,
  Pagination__unstable as Pagination,
  getPaginationVariables__unstable as getPaginationVariables,
} from '@shopify/hydrogen';

import {Grid, Heading, PageHeader, Section, Link, Button} from '~/components';
import {getImageLoadingPriority} from '~/lib/const';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';

const PAGINATION_SIZE = 4;

export const headers = routeHeaders;

export const loader = async ({request, context: {storefront}}: LoaderArgs) => {
  const variables = getPaginationVariables(request, {pageBy: PAGINATION_SIZE});
  const {collections} = await storefront.query(COLLECTIONS_QUERY, {
    variables: {
      ...variables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  const seo = seoPayload.listCollections({
    collections,
    url: request.url,
  });

  return json({collections, seo});
};

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading="Collections" />
      <Section>
        <Pagination connection={collections}>
          {({nodes, isLoading, PreviousLink, NextLink}) => (
            <>
              <div className="mb-6 flex items-center justify-center">
                <Button as={PreviousLink} variant="secondary" width="full">
                  {isLoading ? 'Loading...' : 'Previous collections'}
                </Button>
              </div>
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
              <div className="mt-6 flex items-center justify-center">
                <Button as={NextLink} variant="secondary" width="full">
                  {isLoading ? 'Loading...' : 'Next collections'}
                </Button>
              </div>
            </>
          )}
        </Pagination>
      </Section>
    </>
  );
}

function CollectionCard({
  collection,
  loading,
}: {
  collection: Collection;
  loading?: HTMLImageElement['loading'];
}) {
  return (
    <Link to={`/collections/${collection.handle}`} className="grid gap-4">
      <div className="card-image aspect-[3/2] bg-primary/5">
        {collection?.image && (
          <Image
            data={collection.image}
            aspectRatio="6/4"
            sizes="(max-width: 32em) 100vw, 45vw"
            loading={loading}
          />
        )}
      </div>
      <Heading as="h3" size="copy">
        {collection.title}
      </Heading>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
query Collections(
    $last: Int
    $first: Int
    $country: CountryCode
    $language: LanguageCode
    $endCursor: String
    $startCursor: String
) @inContext(country: $country, language: $language) {
    collections(last: $last, first: $first, after: $endCursor, before: $startCursor) {
        nodes {
            id
            title
            handle
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
        }
        pageInfo {
            endCursor
            hasNextPage
            startCursor
            hasPreviousPage
        }
    }
}
`;
