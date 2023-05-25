import {flattenConnection} from '@shopify/hydrogen';
import type {LoaderArgs} from '@shopify/remix-oxygen';
import type {
  PageConnection,
  ProductConnection,
  CollectionConnection,
} from '@shopify/hydrogen/storefront-api-types';
import invariant from 'tiny-invariant';

const MAX_URLS = 250; // the google limit is 50K, however, SF API only allow querying for 250 resources each time

interface SitemapQueryData {
  pages: PageConnection;
  products: ProductConnection;
  collections: CollectionConnection;
}

interface ProductEntry {
  url: string;
  lastMod: string;
  changeFreq: string;
  image?: {
    url: string;
    title?: string;
    caption?: string;
  };
}

export async function loader({request, context: {storefront}}: LoaderArgs) {
  const data = await storefront.query<SitemapQueryData>(SITEMAP_QUERY, {
    variables: {
      urlLimits: MAX_URLS,
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'Sitemap data is missing');

  return new Response(
    shopSitemap({
      data,
      baseUrl: new URL(request.url).origin,
    }),
    {
      headers: {
        contentType: 'application/xml',
        // Cache for 24 hours
        cacheControl: `max-age=${60 * 60 * 24}`,
      },
    },
  );
}

function xmlEncode(string: string) {
  return string.replace(/[&<>'"]/g, (char) => `&#${char.charCodeAt(0)};`);
}

function shopSitemap({
  data,
  baseUrl,
}: {
  data: SitemapQueryData;
  baseUrl: string;
}) {
  const productsData: ProductEntry[] = flattenConnection(data.products)
    .filter((product) => product.onlineStoreUrl)
    .map((product) => ({
      url: `${baseUrl}/product/${xmlEncode(product.handle)}`,
      lastMod: product.updatedAt,
      changeFreq: 'daily',
      ...(product.featuredImage?.url && {
        image: {
          url: xmlEncode(product.featuredImage.url),
          ...(product.title && {title: xmlEncode(product.title)}),
          ...(product.featuredImage.altText && {
            caption: xmlEncode(product.featuredImage.altText),
          }),
        },
      }),
    }));

  const collectionsData = flattenConnection(data.collections)
    .filter((collection) => collection.onlineStoreUrl)
    .map((collection) => ({
      url: `${baseUrl}/collections/${collection.handle}`,
      lastMod: collection.updatedAt,
      changeFreq: 'daily',
    }));

  const pagesData = flattenConnection(data.pages)
    .filter((page) => page.onlineStoreUrl)
    .map((page) => ({
      url: `${baseUrl}/pages/${page.handle}`,
      lastMod: page.updatedAt,
      changeFreq: 'weekly',
    }));

  return `
    <urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
    >
      ${[...productsData, ...collectionsData, ...pagesData]
        .map((data) => renderUrlTag(data))
        .join('')}
    </urlset>`;
}

function renderUrlTag({
  url,
  image,
  lastMod,
  changeFreq,
}: {
  url: string;
  lastMod?: string;
  changeFreq?: string;
  image?: {
    url: string;
    title?: string;
    caption?: string;
  };
}) {
  return `
    <url>
      <loc>${url}</loc>
      <lastmod>${lastMod}</lastmod>
      <changefreq>${changeFreq}</changefreq>
      ${
        image
          ? `
        <image:image>
          <image:loc>${image.url}</image:loc>
          <image:title>${image.title ?? ''}</image:title>
          <image:caption>${image.caption ?? ''}</image:caption>
        </image:image>`
          : ''
      }

    </url>
  `;
}

const SITEMAP_QUERY = `#graphql
  query sitemaps($urlLimits: Int, $language: LanguageCode) @inContext(language: $language) {
    products(
      first: $urlLimits
      query: "published_status:'online_store:visible'"
    ) {
      nodes {
        title
        handle
        updatedAt
        onlineStoreUrl
        featuredImage {
          url
          altText
        }
      }
    }
    collections(
      first: $urlLimits
      query: "published_status:'online_store:visible'"
    ) {
      nodes {
        handle
        updatedAt
        onlineStoreUrl
      }
    }
    pages(first: $urlLimits, query: "published_status:'published'") {
      nodes {
        handle
        updatedAt
        onlineStoreUrl
      }
    }
  }
`;
