import invariant from 'tiny-invariant';
import {useLoaderData} from '@remix-run/react';
import {json, type LoaderArgs} from '@shopify/remix-oxygen';

import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import type {NonNullableFields} from '~/lib/type';
import {PageHeader, Section, Heading, Link} from '~/components';

export const headers = routeHeaders;

export async function loader({request, context: {storefront}}: LoaderArgs) {
  const data = await storefront.query(POLICIES_QUERY);

  invariant(data, 'No data returned from Shopify API');
  const policies = Object.values(
    data.shop as NonNullableFields<typeof data.shop>,
  ).filter(Boolean);

  if (policies.length === 0) {
    throw new Response('Not found', {status: 404});
  }

  const seo = seoPayload.policies({
    url: request.url,
    policies: policies,
  });

  return json({
    seo,
    policies,
  });
}

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading="Policies" />
      <Section padding="x" className="mb-24">
        {policies.map((policy) => {
          return (
            policy && (
              <Heading className="text-heading font-normal" key={policy.id}>
                <Link to={`/policies/${policy.handle}`}>{policy.title}</Link>
              </Heading>
            )
          );
        })}
      </Section>
    </>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyIndex on ShopPolicy {
    id
    title
    handle
  }

  query PoliciesIndex {
    shop {
      privacyPolicy {
        ...PolicyIndex
      }
      shippingPolicy {
        ...PolicyIndex
      }
      termsOfService {
        ...PolicyIndex
      }
      refundPolicy {
        ...PolicyIndex
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
`;
