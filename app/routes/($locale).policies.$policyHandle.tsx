import invariant from 'tiny-invariant';
import {useLoaderData} from '@remix-run/react';
import {json, type LoaderArgs} from '@shopify/remix-oxygen';

import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import {Link, PageHeader, Section} from '~/components';
import {buttonVariants} from '~/components/ui';
import {cn} from '~/lib/utils';

import type {PoliciesHandleQuery} from '../../storefrontapi.generated';

export const headers = routeHeaders;

export async function loader({request, params, context}: LoaderArgs) {
  invariant(params.policyHandle, 'Missing policy handle');

  const policyName = params.policyHandle.replace(
    /-([a-z])/g,
    (_: unknown, m1: string) => m1.toUpperCase(),
  ) as 'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy';

  const data = await context.storefront.query<PoliciesHandleQuery>(
    POLICY_CONTENT_QUERY,
    {
      variables: {
        [policyName]: true,
        refundPolicy: false,
        privacyPolicy: false,
        shippingPolicy: false,
        termsOfService: false,
        language: context.storefront.i18n.language,
      },
    },
  );

  invariant(data, 'No data returned from the API');
  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response(null, {status: 404});
  }

  const seo = seoPayload.policy({
    url: request.url,
    policy,
  });

  return json({
    seo,
    policy,
  });
}

export default function Policies() {
  const {policy} = useLoaderData<typeof loader>();

  return (
    <Section
      padding="all"
      display="flex"
      className="w-full flex-col items-baseline gap-8 md:flex-row"
    >
      <PageHeader
        heading={policy.title}
        className="top-36 grid flex-grow items-start gap-4 md:sticky md:w-5/12"
      >
        <Link
          to="/policies"
          className={cn(
            buttonVariants({variant: 'default'}),
            'justify-self-start',
          )}
        >
          &larr; Back to Policies
        </Link>
      </PageHeader>
      <div className="w-full flex-grow md:w-7/12">
        <div
          className="prose"
          dangerouslySetInnerHTML={{__html: policy.body}}
        />
      </div>
    </Section>
  );
}

const POLICY_CONTENT_QUERY = `#graphql
  fragment PolicyHandle on ShopPolicy {
    body
    handle
    id
    title
    url
  }

  query PoliciesHandle(
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
    $refundPolicy: Boolean!
  ) @inContext(language: $language) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...PolicyHandle
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...PolicyHandle
      }
      termsOfService @include(if: $termsOfService) {
        ...PolicyHandle
      }
      refundPolicy @include(if: $refundPolicy) {
        ...PolicyHandle
      }
    }
  }
`;
