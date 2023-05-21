import type {
  Product,
  Collection,
  ProductConnection,
  CollectionConnection,
} from '@shopify/hydrogen/storefront-api-types';
import clsx from 'clsx';
import invariant from 'tiny-invariant';
import Highlighter from 'react-highlight-words';
import {flattenConnection, Image} from '@shopify/hydrogen';
import {Dialog, Transition} from '@headlessui/react';
import {json, type LoaderArgs} from '@shopify/remix-oxygen';
import {useFetcher, useLocation} from '@remix-run/react';
import {MagnifyingGlassIcon, XCircleIcon} from '@heroicons/react/24/outline';
import React, {useId, useState, useEffect} from 'react';

import {Text} from '~/components';
import {seoPayload} from '~/lib/seo.server';
import {useDebounce} from '~/hooks';
import {PAGINATION_SIZE} from '~/lib/const';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';

export async function loader({request, context: {storefront}}: LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;

  const cursor = searchParams.get('cursor')!;
  const searchTerm = searchParams.get('q')!;

  const data = await storefront.query<{
    products: ProductConnection;
  }>(SEARCH_QUERY, {
    variables: {
      pageBy: PAGINATION_SIZE,
      cursor,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
      searchTerm,
    },
  });

  // invariant(data, 'No data returned from Shopify API');

  const {products} = data;

  const getRecommendations = !searchTerm || products?.nodes?.length === 0;

  const seoCollection = {
    id: 'search',
    title: 'Search',
    handle: 'search',
    products,
    updatedAt: new Date().toISOString(),
    metafields: [],
    descriptionHtml: 'Search results',
    description: 'Search results',
    seo: {
      title: 'Search',
      description: `Showing ${products.nodes.length} search results for "${searchTerm}"`,
    },
  } satisfies Collection;

  const seo = seoPayload.collection({
    url: request.url,
    collection: seoCollection,
  });

  return json({
    seo,
    products,
    searchTerm,
    noResultRecommendations: getRecommendations
      ? await getNoResultRecommendations(storefront)
      : null,
  });
}

export function Search() {
  const [open, setOpen] = useState(false);
  const [modifierKey, setModifierKey] = useState<string>();

  useEffect(() => {
    setModifierKey(
      /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ? '⌘' : 'Ctrl ',
    );
  }, []);

  return (
    <div className="hidden lg:block lg:max-w-md lg:flex-auto">
      <button
        type="button"
        className="hidden h-8 w-full items-center gap-2 rounded px-3 text-sm ring-1 ring-notice/20 transition lg:flex"
        onClick={() => setOpen(true)}
      >
        <MagnifyingGlassIcon className="h-5 w-5" />

        <Text>Find something...</Text>

        <kbd className="text-2xs ml-auto text-zinc-400 dark:text-zinc-500">
          <kbd className="font-sans">{modifierKey}</kbd>
          <kbd className="font-sans">K</kbd>
        </kbd>
      </button>

      <SearchDialog className="hidden lg:block" setOpen={setOpen} open={open} />
    </div>
  );
}

async function getNoResultRecommendations(
  storefront: LoaderArgs['context']['storefront'],
) {
  const data = await storefront.query<{
    featuredCollections: CollectionConnection;
    featuredProducts: ProductConnection;
  }>(SEARCH_NO_RESULTS_QUERY, {
    variables: {
      pageBy: PAGINATION_SIZE,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  return {
    featuredProducts: flattenConnection(data.featuredProducts),
    featuredCollections: flattenConnection(data.featuredCollections),
  };
}

function SearchDialog({
  open,
  setOpen,
  className,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  className?: string;
}) {
  const location = useLocation();
  const searchFetcher = useFetcher<typeof loader>();

  const handleInputChange = useDebounce((value: string) => {
    searchFetcher.submit(
      {q: value ?? ''},
      {method: 'get', action: '/resources/search', replace: true},
    );
  }, 300);

  useEffect(() => {
    open && setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (open) {
      return;
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, setOpen]);

  const busy = searchFetcher.state !== 'idle';
  const {products, searchTerm} = searchFetcher.data ?? {};

  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog
        onClose={setOpen}
        className={clsx('fixed inset-0 z-50', className)}
      >
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-zinc-400/25 backdrop-blur-sm dark:bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-20 md:py-32 lg:px-8 lg:py-[15vh]">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto overflow-hidden rounded-lg bg-contrast shadow-xl ring-1 ring-notice sm:max-w-xl">
              <searchFetcher.Form>
                <SearchInput
                  onChange={(e) => {
                    handleInputChange(e.currentTarget.value);
                  }}
                />

                <div className="border-t border-notice bg-contrast empty:hidden">
                  {!busy && searchTerm && (
                    <SearchResults
                      query={searchTerm}
                      products={flattenConnection(products)}
                    />
                  )}
                </div>
              </searchFetcher.Form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

const SearchInput = ({
  onChange,
}: {
  onChange: React.InputHTMLAttributes<HTMLInputElement>['onChange'];
}) => (
  <div className="group relative flex h-12">
    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-0 h-full w-5 stroke-primary" />
    <input
      name="q"
      type="search"
      onChange={onChange}
      placeholder="Search"
      className={clsx(
        'flex-auto appearance-none bg-transparent pl-10 text-primary outline-none placeholder:text-primary/30 focus:w-full focus:flex-none sm:text-sm',
      )}
    />
  </div>
);

function SearchResults({
  query,
  products,
}: {
  query: string;
  products: Product[];
}) {
  if (products.length === 0) {
    return (
      <div className="p-6 text-center">
        <XCircleIcon className="mx-auto h-5 w-5 stroke-primary" />
        <p className="mt-2 text-xs text-zinc-700 dark:text-zinc-400">
          Nothing found for{' '}
          <strong className="break-words font-semibold text-zinc-900 dark:text-white">
            &lsquo;{query}&rsquo;
          </strong>
          . Please try again.
        </p>
      </div>
    );
  }

  return (
    <ul role="listbox">
      {products.map((product, index) => (
        <SearchResult
          key={product.id}
          query={query}
          product={product}
          resultIndex={index}
        />
      ))}
    </ul>
  );
}

function SearchResult({
  query,
  product,
  resultIndex,
}: {
  query: string;
  product: Product;
  resultIndex: number;
}) {
  const id = useId();
  const variant = flattenConnection(product.variants)[0];

  return (
    <li
      role="option"
      className={clsx(
        'group block cursor-default px-4 py-3 hover:bg-primary/5 aria-selected:bg-zinc-50',
        resultIndex > 0 && 'border-t',
      )}
      aria-labelledby={`${id}-hierarchy ${id}-title`}
    >
      <div
        id={`${id}-title`}
        aria-hidden="true"
        className="text-sm font-medium text-primary group-aria-selected:text-primary"
      >
        <HighlightQuery text={product.title} query={query} />
      </div>
      <Text>
        {variant.price?.amount} {variant.price?.currencyCode}
      </Text>
      {variant.image && (
        <Image src={variant.image.url} width="100" height="100" />
      )}
    </li>
  );
}

function HighlightQuery({text, query}: {text: string; query: string}) {
  return (
    <Highlighter
      highlightClassName="underline bg-transparent text-notice"
      autoEscape={true}
      searchWords={[query]}
      textToHighlight={text}
    />
  );
}

const SEARCH_QUERY = `#graphql
${PRODUCT_CARD_FRAGMENT}
query search(
    $searchTerm: String
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
    $after: String
) @inContext(country: $country, language: $language) {
    products(
        first: $pageBy
        query: $searchTerm
        after: $after
        sortKey: RELEVANCE
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
`;

const SEARCH_NO_RESULTS_QUERY = `#graphql
query searchNoResult(
    $pageBy: Int!
    $country: CountryCode
    $language: LanguageCode
) @inContext(country: $country, language: $language) {
    featuredCollections: collections(first: 3, sortKey: UPDATED_AT) {
        nodes {
            id
            title
            handle
            image {
                url
                width
                height
                altText
            }
        }
    }
    featuredProducts: products(first: $pageBy) {
        nodes {
            ...ProductCard
        }
    }
}
${PRODUCT_CARD_FRAGMENT}
`;
