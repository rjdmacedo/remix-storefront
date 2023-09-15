import {json, type LinksFunction, type LoaderArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';

import {PageHeader, Section} from '~/components';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';

import styles from '../styles/custom-font.css';

const BLOG_HANDLE = 'journal';

export const headers = routeHeaders;

export const links: LinksFunction = () => {
  return [{rel: 'stylesheet', href: styles}];
};

export async function loader({request, params, context}: LoaderArgs) {
  const {language, country} = context.storefront.i18n;

  invariant(params.journalHandle, 'Missing journal handle');

  const {blog} = await context.storefront.query(ARTICLE_QUERY, {
    variables: {
      blogHandle: BLOG_HANDLE,
      articleHandle: params.journalHandle,
      language,
    },
  });

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  const article = blog.articleByHandle;

  const formattedDate = new Intl.DateTimeFormat(`${language}-${country}`, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(article?.publishedAt!));

  const seo = seoPayload.article({article, url: request.url});

  return json({article, formattedDate, seo});
}

export default function Article() {
  const {article, formattedDate} = useLoaderData<typeof loader>();

  const {title, image, contentHtml, author} = article;

  return (
    <>
      <PageHeader heading={title} variant="blog-post">
        <span>
          {formattedDate} &middot; {author?.name}
        </span>
      </PageHeader>
      <Section as="article" padding="x">
        {image && (
          <Image
            data={image}
            sizes="90vw"
            loading="eager"
            className="mx-auto mt-8 w-full max-w-7xl md:mt-16"
          />
        )}
        <div
          className="article"
          dangerouslySetInnerHTML={{__html: contentHtml}}
        />
      </Section>
    </>
  );
}

const ARTICLE_QUERY = `#graphql
query ArticleDetails(
  $language: LanguageCode
  $blogHandle: String!
  $articleHandle: String!
) @inContext(language: $language) {
  blog(handle: $blogHandle) {
    articleByHandle(handle: $articleHandle) {
      title
      contentHtml
      publishedAt
      author: authorV2 {
        name
      }
      image {
        id
        altText
        url
        width
        height
      }
      seo {
        description
        title
      }
    }
  }
}
`;
