/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain,eslint-comments/disable-enable-pair */
import {
  Money,
  ShopPayButton,
  AnalyticsPageType,
  type ShopifyAnalyticsProduct,
} from '@shopify/hydrogen';
import {
  Await,
  useLocation,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react';
import type {
  Shop,
  Product as ProductType,
  ProductVariant,
  ProductConnection,
  SelectedOptionInput,
} from '@shopify/hydrogen/storefront-api-types';
import clsx from 'clsx';
import invariant from 'tiny-invariant';
import {Disclosure, Listbox} from '@headlessui/react';
import {defer, type LoaderArgs} from '@shopify/remix-oxygen';
import {type ReactNode, useRef, Suspense, useMemo} from 'react';

import {
  Link,
  Text,
  Button,
  Heading,
  Section,
  Skeleton,
  IconCaret,
  IconCheck,
  IconClose,
  ProductGallery,
  ProductSwimlane,
  AddToCartButton,
} from '~/components';
import {getExcerpt} from '~/lib/utils';
import {seoPayload} from '~/lib/seo.server';
import type {Storefront} from '~/lib/type';
import {routeHeaders, CACHE_SHORT} from '~/data/cache';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';

export const headers = routeHeaders;

export async function loader({params, request, context}: LoaderArgs) {
  const {handle} = params;
  invariant(handle, 'Missing product "handle" param, check route filename');

  const searchParams = new URL(request.url).searchParams;

  const selectedOptions: SelectedOptionInput[] = [];
  searchParams.forEach((value, name) => {
    selectedOptions.push({name, value});
  });

  const {shop, product} = await context.storefront.query<{
    shop: Shop;
    product: ProductType & {selectedVariant?: ProductVariant};
  }>(PRODUCT_QUERY, {
    variables: {
      handle,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
      selectedOptions,
    },
  });

  if (!product?.id) {
    throw new Response('product', {status: 404});
  }

  const recommended = getRecommendedProducts(context.storefront, product.id);
  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;

  const productAnalytics: ShopifyAnalyticsProduct = {
    name: product.title,
    brand: product.vendor,
    price: selectedVariant.price.amount,
    productGid: product.id,
    variantGid: selectedVariant.id,
    variantName: selectedVariant.title,
  };

  const seo = seoPayload.product({
    url: request.url,
    product,
    selectedVariant,
  });

  return defer(
    {
      seo,
      shop,
      product,
      analytics: {
        pageType: AnalyticsPageType.product,
        products: [productAnalytics],
        resourceId: product.id,
        totalValue: parseFloat(selectedVariant.price.amount),
      },
      storeDomain: shop.primaryDomain.url,
      recommended,
    },
    {
      headers: {
        'Cache-Control': CACHE_SHORT,
      },
    },
  );
}

export default function ProductPage() {
  const {shop, product, recommended} = useLoaderData<typeof loader>();
  const {media, title, vendor, descriptionHtml} = product;
  const {shippingPolicy, refundPolicy} = shop;

  return (
    <>
      <Section className="px-0 md:px-8 lg:px-12">
        <div className="grid items-start md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-20">
          <ProductGallery
            media={media.nodes}
            className="w-full lg:col-span-2"
          />
          <div className="hiddenScroll sticky md:top-nav md:-mb-nav md:h-screen md:-translate-y-nav md:overflow-y-scroll md:pt-nav">
            <section className="flex w-full max-w-xl flex-col gap-8 p-6 md:mx-auto md:max-w-sm md:px-0">
              <div className="grid gap-2">
                <Heading as="h1" className="whitespace-normal">
                  {title}
                </Heading>
                {vendor && (
                  <Text className={'font-medium opacity-50'}>{vendor}</Text>
                )}
              </div>
              <ProductForm />
              <div className="grid gap-4 py-4">
                {descriptionHtml && (
                  <ProductDetail
                    title="Product Details"
                    content={descriptionHtml}
                  />
                )}
                {shippingPolicy?.body && (
                  <ProductDetail
                    title="Shipping"
                    content={getExcerpt(shippingPolicy.body)}
                    learnMore={`/policies/${shippingPolicy.handle}`}
                  />
                )}
                {refundPolicy?.body && (
                  <ProductDetail
                    title="Returns"
                    content={getExcerpt(refundPolicy.body)}
                    learnMore={`/policies/${refundPolicy.handle}`}
                  />
                )}
              </div>
            </section>
          </div>
        </div>
      </Section>

      <Suspense fallback={<Skeleton className="h-32" />}>
        <Await
          resolve={recommended}
          errorElement="There was a problem loading related products"
        >
          {(products) => (
            <ProductSwimlane title="Related Products" products={products} />
          )}
        </Await>
      </Suspense>
    </>
  );
}

function ProductForm() {
  const {location} = useNavigation();
  const [currentSearchParams] = useSearchParams();
  const {product, analytics, storeDomain} = useLoaderData<typeof loader>();

  /**
   * We update `searchParams` with in-flight request data from `location` (if available)
   * to create an optimistic UI, e.g., check the product option before the
   * request has completed.
   */
  const searchParams = useMemo(
    () =>
      location ? new URLSearchParams(location.search) : currentSearchParams,
    [currentSearchParams, location],
  );

  const firstVariant = product.variants.nodes[0];

  /**
   * We're making an explicit choice here to display the product options
   * UI with a default variant, rather than wait for the user to select
   * options first.
   * Developers are welcome to opt-out of this behavior.
   * By default, the first variant's options are used.
   */
  const searchParamsWithDefaults = useMemo<URLSearchParams>(() => {
    const clonedParams = new URLSearchParams(searchParams);

    for (const {name, value} of firstVariant.selectedOptions) {
      if (!searchParams.has(name)) {
        clonedParams.set(name, value);
      }
    }

    return clonedParams;
  }, [searchParams, firstVariant.selectedOptions]);

  /**
   * Likewise, we're defaulting to the first variant for purposes
   * of add to cart if there is none returned from the loader.
   * A developer can opt out of this, too.
   */
  const selectedVariant = product.selectedVariant ?? firstVariant;

  const isOutOfStock = !selectedVariant?.availableForSale;

  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    selectedVariant?.price?.amount < selectedVariant?.compareAtPrice?.amount;

  const productAnalytics: ShopifyAnalyticsProduct = {
    ...analytics.products[0],
    quantity: 1,
  };

  return (
    <div className="grid gap-10">
      <div className="grid gap-4">
        <ProductOptions
          options={product.options}
          searchParamsWithDefaults={searchParamsWithDefaults}
        />
        {selectedVariant && (
          <div className="grid items-stretch gap-4">
            {isOutOfStock ? (
              <Button variant="secondary" disabled>
                <Text>Sold out</Text>
              </Button>
            ) : (
              <AddToCartButton
                lines={[
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                  },
                ]}
                variant="primary"
                data-test="add-to-cart"
                analytics={{
                  products: [productAnalytics],
                  totalValue: parseFloat(productAnalytics.price),
                }}
              >
                <Text
                  as="span"
                  className="flex items-center justify-center gap-2"
                >
                  <span>Add to Cart</span> <span>·</span>{' '}
                  <Money
                    as="span"
                    data={selectedVariant?.price!}
                    withoutTrailingZeros
                  />
                  {isOnSale && (
                    <Money
                      as="span"
                      data={selectedVariant?.compareAtPrice!}
                      className="strike opacity-50"
                      withoutTrailingZeros
                    />
                  )}
                </Text>
              </AddToCartButton>
            )}
            {!isOutOfStock && (
              <ShopPayButton
                width="100%"
                variantIds={[selectedVariant?.id!]}
                storeDomain={storeDomain}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductOptions({
  options,
  searchParamsWithDefaults,
}: {
  options: ProductType['options'];
  searchParamsWithDefaults: URLSearchParams;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      {options
        .filter((option) => option.values.length > 1)
        .map((option) => (
          <div
            key={option.name}
            className="mb-4 flex flex-col flex-wrap gap-y-2 last:mb-0"
          >
            <Heading as="legend" size="lead" className="min-w-[4rem]">
              {option.name}
            </Heading>
            <div className="flex flex-wrap items-baseline gap-4">
              {/**
               * First, we render a bunch of <Link> elements for each option value.
               * When the user clicks one of these buttons, it will hit the loader
               * to get the new data.
               *
               * If there are more than 7 values, we render a dropdown.
               * Otherwise, we just render plain links.
               */}
              {option.values.length > 7 ? (
                <div className="relative w-full">
                  <Listbox>
                    {({open}) => (
                      <>
                        <Listbox.Button
                          ref={closeRef}
                          className={clsx(
                            'flex w-full items-center justify-between border border-primary px-4 py-3',
                            open
                              ? 'rounded-b md:rounded-b-none md:rounded-t'
                              : 'rounded',
                          )}
                        >
                          <span>
                            {searchParamsWithDefaults.get(option.name)}
                          </span>
                          <IconCaret direction={open ? 'up' : 'down'} />
                        </Listbox.Button>
                        <Listbox.Options
                          className={clsx(
                            'absolute bottom-12 z-30 grid h-48 w-full overflow-y-scroll rounded-t border border-primary bg-contrast px-2 py-2 transition-[max-height] duration-150 sm:bottom-auto md:rounded-b md:rounded-t-none md:border-b md:border-t-0',
                            open ? 'max-h-48' : 'max-h-0',
                          )}
                        >
                          {option.values.map((value) => (
                            <Listbox.Option
                              key={`option-${option.name}-${value}`}
                              value={value}
                            >
                              {({active}) => (
                                <ProductOptionLink
                                  optionName={option.name}
                                  optionValue={value}
                                  className={clsx(
                                    'flex w-full cursor-pointer items-center justify-start rounded p-2 text-left text-primary transition',
                                    active && 'bg-primary/10',
                                  )}
                                  searchParams={searchParamsWithDefaults}
                                  onClick={() => {
                                    if (!closeRef?.current) return;
                                    closeRef.current.click();
                                  }}
                                >
                                  {value}
                                  {searchParamsWithDefaults.get(option.name) ===
                                    value && (
                                    <span className="ml-2">
                                      <IconCheck />
                                    </span>
                                  )}
                                </ProductOptionLink>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </>
                    )}
                  </Listbox>
                </div>
              ) : (
                <>
                  {option.values.map((value) => {
                    const checked =
                      searchParamsWithDefaults.get(option.name) === value;
                    const id = `option-${option.name}-${value}`;

                    return (
                      <Text key={id}>
                        <ProductOptionLink
                          optionName={option.name}
                          optionValue={value}
                          searchParams={searchParamsWithDefaults}
                          className={clsx(
                            'cursor-pointer border-b-[1.5px] py-1 leading-none transition-all duration-200',
                            checked ? 'border-primary/50' : 'border-primary/0',
                          )}
                        />
                      </Text>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        ))}
    </>
  );
}

function ProductOptionLink({
  optionName,
  optionValue,
  searchParams,
  children,
  ...props
}: {
  optionName: string;
  optionValue: string;
  searchParams: URLSearchParams;
  children?: ReactNode;
  [key: string]: any;
}) {
  const {pathname} = useLocation();
  const isLocalePathname = /\/[a-zA-Z]{2}-[a-zA-Z]{2}\//g.test(pathname);
  // fixes internalized pathname
  const path = isLocalePathname
    ? `/${pathname.split('/').slice(2).join('/')}`
    : pathname;

  const clonedSearchParams = new URLSearchParams(searchParams);
  clonedSearchParams.set(optionName, optionValue);

  return (
    <Link
      {...props}
      preventScrollReset
      prefetch="intent"
      replace
      to={`${path}?${clonedSearchParams.toString()}`}
    >
      {children ?? optionValue}
    </Link>
  );
}

function ProductDetail({
  title,
  content,
  learnMore,
}: {
  title: string;
  content: string;
  learnMore?: string;
}) {
  return (
    <Disclosure key={title} as="div" className="grid w-full gap-2">
      {({open}) => (
        <>
          <Disclosure.Button className="text-left">
            <div className="flex justify-between">
              <Text size="lead" as="h4">
                {title}
              </Text>
              <IconClose
                className={clsx(
                  'transform-gpu transition-transform duration-200',
                  !open && 'rotate-[45deg]',
                )}
              />
            </div>
          </Disclosure.Button>

          <Disclosure.Panel className={'grid gap-2 pb-4 pt-2'}>
            <div
              className="prose dark:prose-invert"
              dangerouslySetInnerHTML={{__html: content}}
            />
            {learnMore && (
              <div className="">
                <Link
                  className="border-b border-primary/30 pb-px text-primary/50"
                  to={learnMore}
                >
                  Learn more
                </Link>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
fragment ProductVariantFragment on ProductVariant {
    id
    sku
    title
    availableForSale

    image {
        id
        url
        altText
        width
        height
    }
    price {
        amount
        currencyCode
    }
    product {
        title
        handle
    }
    unitPrice {
        amount
        currencyCode
    }
    compareAtPrice {
        amount
        currencyCode
    }
    selectedOptions {
        name
        value
    }
}
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
        ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
        nodes {
            ...ProductCard
        }
    }
}
${PRODUCT_CARD_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
query Product(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
) @inContext(country: $country, language: $language) {
    shop {
        name

        refundPolicy {
            body
            handle
        }
        primaryDomain {
            url
        }
        shippingPolicy {
            body
            handle
        }
    }
    product(handle: $handle) {
        id
        title
        vendor
        handle
        description
        descriptionHtml

        seo {
            title
            description
        }
        media(first: 7) {
            nodes {
                ...Media
            }
        }
        options {
            name
            values
        }
        variants(first: 1) {
            nodes {
                ...ProductVariantFragment
            }
        }
        selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
            ...ProductVariantFragment
        }
    }
}
${MEDIA_FRAGMENT}
${PRODUCT_VARIANT_FRAGMENT}
`;

async function getRecommendedProducts(
  storefront: Storefront,
  productId: string,
) {
  const products = await storefront.query<{
    additional: ProductConnection;
    recommended: ProductType[];
  }>(RECOMMENDED_PRODUCTS_QUERY, {variables: {count: 12, productId}});

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = products.recommended
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts
    .map((item: ProductType) => item.id)
    .indexOf(productId);

  mergedProducts.splice(originalProduct, 1);

  return mergedProducts;
}
