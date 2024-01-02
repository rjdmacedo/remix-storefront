import {useLoaderData} from '@remix-run/react';
import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {flattenConnection, Image} from '@shopify/hydrogen';

import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import type {ArticleFragment, BlogQuery} from 'storefrontapi.generated';
import {Grid, PageHeader, Section, Link} from '~/components';
import {getImageLoadingPriority, PAGINATION_SIZE} from '~/lib/const';

const BLOG_HANDLE = 'Journal';

export const headers = routeHeaders;

export const loader = async ({
  request,
  context: {storefront},
}: LoaderFunctionArgs) => {
  const {language, country} = storefront.i18n;

  const {blog} = await storefront.query<BlogQuery>(BLOGS_QUERY, {
    variables: {
      pageBy: PAGINATION_SIZE,
      language,
      blogHandle: BLOG_HANDLE,
    },
  });

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  const articles = flattenConnection(blog.articles).map((article) => {
    const {publishedAt} = article!;

    return {
      ...article,
      publishedAt: new Intl.DateTimeFormat(`${language}-${country}`, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(publishedAt!)),
    };
  });

  const seo = seoPayload.blog({
    url: request.url,
    blog,
  });

  return json({
    seo,
    articles,
  });
};

export default function Journals() {
  const {articles} = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading={BLOG_HANDLE} />
      <Section>
        <Grid as="ol" layout="blog">
          {articles.map((article, i) => (
            <ArticleCard
              blogHandle={BLOG_HANDLE.toLowerCase()}
              article={article}
              key={article.id}
              loading={getImageLoadingPriority(i, 2)}
            />
          ))}
        </Grid>
      </Section>
    </>
  );
}

function ArticleCard({
  article,
  loading,
  blogHandle,
}: {
  article: ArticleFragment;
  loading?: HTMLImageElement['loading'];
  blogHandle: string;
}) {
  return (
    <li key={article.id}>
      <Link to={`/${blogHandle}/${article.handle}`}>
        {article.image && (
          <div className="card-image aspect-[3/2]">
            <Image
              alt={article.image.altText || article.title}
              className="w-full object-cover"
              data={article.image}
              aspectRatio="3/2"
              loading={loading}
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        )}
        <h2 className="mt-4 font-medium">{article.title}</h2>
        <span className="mt-1 block">{article.publishedAt}</span>
      </Link>
    </li>
  );
}

const BLOGS_QUERY = `#graphql
query Blog(
  $pageBy: Int!
  $cursor: String
  $language: LanguageCode
  $blogHandle: String!
) @inContext(language: $language) {
  blog(handle: $blogHandle) {
    title
    seo {
      title
      description
    }
    articles(first: $pageBy, after: $cursor) {
      edges {
        node {
          ...Article
        }
      }
    }
  }
}

fragment Article on Article {
  id
  title
  handle
  contentHtml
  publishedAt
  image {
    id
    url
    width
    height
    altText
  }
  author: authorV2 {
    name
  }
}
`;
