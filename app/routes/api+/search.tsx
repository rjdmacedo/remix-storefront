import {
  XCircleIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import type {
  Product,
  Collection,
  ProductConnection,
} from '@shopify/hydrogen/storefront-api-types';
import clsx from 'clsx';
import invariant from 'tiny-invariant';
import Highlighter from 'react-highlight-words';
import {flattenConnection} from '@shopify/hydrogen';
import {json, type LoaderArgs} from '@shopify/remix-oxygen';
import {Combobox, Dialog, Transition} from '@headlessui/react';
import React, {useState, useEffect, Fragment} from 'react';
import {Form, useFetcher, useLocation, useNavigate} from '@remix-run/react';

import {
  SEARCH_QUERY,
  getNoResultRecommendations,
} from '~/routes/($locale)+/search';
import {seoPayload} from '~/lib/seo.server';
import {useDebounce} from '~/hooks';
import {ProductCard} from '~/components';
import {useIsHomePath} from '~/lib/utils';

export async function loader({request, context: {storefront}}: LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;

  const cursor = searchParams.get('cursor')!;
  const searchTerm = searchParams.get('q')!;

  const data = await storefront.query<{
    products: ProductConnection;
  }>(SEARCH_QUERY, {
    variables: {
      pageBy: 250,
      cursor,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
      searchTerm,
    },
  });

  invariant(data, 'No data returned from Shopify API');

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
    products: flattenConnection(products),
    searchTerm,
    noResultRecommendations: getRecommendations
      ? await getNoResultRecommendations(storefront)
      : null,
  });
}

export function Search() {
  const isHome = useIsHomePath();
  const [open, setOpen] = useState(false);
  const [modifierKey, setModifierKey] = useState<string>();

  useEffect(() => {
    setModifierKey(
      /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ? '⌘' : 'Ctrl ',
    );
  }, []);

  return (
    <>
      <Form
        method="GET"
        action="/search"
        className="relative flex items-center"
      >
        <input
          name="q"
          type="text"
          onClick={() => setOpen(true)}
          placeholder="Search something..."
          className={clsx(
            'rounded-md border-0 py-1.5 pr-10 transition-shadow focus:shadow-xl focus:outline-none',
            isHome
              ? 'bg-contrast/30 text-contrast placeholder:text-contrast focus:ring-contrast'
              : 'bg-primary/20 text-primary placeholder:text-primary focus:ring-primary',
          )}
          autoCorrect="off"
          autoComplete="off"
          autoCapitalize="off"
        />
        <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
          <kbd
            className={clsx(
              'inline-flex items-center rounded border px-1 font-sans text-xs',
              isHome
                ? 'border-contrast text-contrast'
                : 'border-primary text-primary',
            )}
          >
            {modifierKey}K
          </kbd>
        </div>
      </Form>

      <SearchDialog setOpen={setOpen} open={open} />
    </>
  );
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
  const navigate = useNavigate();
  const location = useLocation();
  const searchFetcher = useFetcher<typeof loader>();
  const [query, setQuery] = useState('');

  const handleInputChange = useDebounce((value: string) => {
    setQuery(value);
    searchFetcher.submit(
      {q: value ?? ''},
      {method: 'get', action: '/api/search', replace: true},
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
  const {products = []} = searchFetcher.data ?? {};

  return (
    <Transition.Root
      as={Fragment}
      show={open}
      appear
      afterLeave={() => setQuery('')}
    >
      <Dialog
        as="div"
        onClose={setOpen}
        className={clsx(className, 'relative z-50')}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-primary bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-3xl transform divide-y divide-primary overflow-hidden rounded-xl bg-contrast shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              <Combobox<Product>
                onChange={(product) => navigate(`/product/${product.handle}`)}
              >
                {({activeOption}) => (
                  <>
                    <div className="relative">
                      <MagnifyingGlassIcon
                        className="pointer-events-none absolute left-4 top-3.5 h-5 w-5"
                        aria-hidden="true"
                      />
                      <Combobox.Input
                        type="search"
                        autoComplete="off"
                        className="h-12 w-full border-0 bg-contrast pl-11 pr-4 text-primary placeholder:text-primary"
                        placeholder="Start typing to search..."
                        onChange={(event) =>
                          handleInputChange(event.target.value)
                        }
                      />
                    </div>

                    {query !== '' && products.length > 0 && (
                      <Combobox.Options
                        as="div"
                        hold
                        static
                        className="flex max-h-[78vh] divide-x divide-primary/30"
                      >
                        <div
                          className={clsx(
                            'min-w-0 flex-auto scroll-py-4 overflow-y-auto px-6 py-4',
                          )}
                        >
                          <div className="-mx-2 text-sm text-primary">
                            {products.map((product) => (
                              <Combobox.Option
                                as="div"
                                key={product.id}
                                value={product}
                                className={({active}) =>
                                  clsx(
                                    'flex cursor-default select-none items-center rounded-md p-2',
                                    active
                                      ? 'bg-primary/30 text-primary'
                                      : 'text-primary/80',
                                  )
                                }
                              >
                                {({active}) => (
                                  <>
                                    <span className="ml-3 flex-auto truncate">
                                      <HighlightQuery
                                        text={product.title}
                                        query={query}
                                      />
                                    </span>
                                    {active && (
                                      <ChevronRightIcon
                                        className="ml-3 h-5 w-5 flex-none text-primary"
                                        aria-hidden="true"
                                      />
                                    )}
                                  </>
                                )}
                              </Combobox.Option>
                            ))}
                          </div>
                        </div>

                        {activeOption && (
                          <div className="hidden w-1/2 flex-none flex-col divide-y divide-gray-100 overflow-y-auto p-6 sm:flex">
                            <ProductCard product={activeOption} quickAdd />
                          </div>
                        )}
                      </Combobox.Options>
                    )}

                    {query !== '' && !busy && products.length === 0 && (
                      <div className="px-6 py-14 text-center text-xl sm:px-14">
                        <XCircleIcon
                          className="mx-auto h-10 w-10 text-error"
                          aria-hidden="true"
                        />
                        <p className="mt-4 font-semibold text-primary">
                          Nothing found for{' '}
                          <strong className="break-words font-semibold text-notice">
                            &lsquo;{query}&rsquo;
                          </strong>
                          . Please try again.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
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
