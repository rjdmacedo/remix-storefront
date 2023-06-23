import {json, type LoaderArgs} from '@shopify/remix-oxygen';
import {
  useLoaderData,
  type V2_MetaFunction,
  useRouteError,
  isRouteErrorResponse,
} from '@remix-run/react';
import type {Page as PageType} from '@shopify/hydrogen/storefront-api-types';
import type {SeoHandleFunction} from '@shopify/hydrogen';

export async function loader({params, context}: LoaderArgs) {
  if (!params.pageHandle) {
    throw new Error('Missing page handle');
  }

  const {page} = await context.storefront.query<{page: PageType}>(PAGE_QUERY, {
    variables: {
      handle: params.pageHandle,
    },
  });

  if (!page) {
    throw new Response('Not Found', {
      status: 404,
    });
  }

  return json({page});
}

const seo: SeoHandleFunction<typeof loader> = ({data}) => ({
  title: data?.page?.seo?.title,
  description: data?.page?.seo?.description,
});

export const handle = {
  seo,
};

export const meta: V2_MetaFunction = ({data}) => {
  const {title, description} = data?.page.seo ?? {};
  return [{title}, {name: 'description', content: description}];
};

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  return (
    <>
      <header>
        <h1>{page.title}</h1>
      </header>
      <main dangerouslySetInnerHTML={{__html: page.body}} />
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    console.error(error.status, error.statusText, error.data);
    return <div>Route Error</div>;
  } else {
    console.error((error as Error).message);
    return <div>Thrown Error</div>;
  }
}

const PAGE_QUERY = `#graphql
    query page_details($language: LanguageCode, $handle: String!)
    @inContext(language: $language) {
      page(handle: $handle) {
        id
        title
        body
        seo {
          description
          title
        }
      }
    }
  `;
