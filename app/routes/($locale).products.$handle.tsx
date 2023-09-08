import {
  Await,
  useNavigate,
  useLocation,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {Disclosure} from '@headlessui/react';
import {AnalyticsPageType, Money} from '@shopify/hydrogen';
import type {SelectedOptionInput} from '@shopify/hydrogen/storefront-api-types';
import type {ShopifyAnalyticsProduct} from '@shopify/hydrogen';
import {defer, type DataFunctionArgs} from '@shopify/remix-oxygen';
import React, {type ReactNode, Suspense, useMemo} from 'react';

import {
  MEDIA_FRAGMENT,
  PRODUCT_CARD_FRAGMENT,
  PRODUCT_VARIANT_FRAGMENT,
} from '~/data/fragments';
import {
  Link,
  Section,
  Skeleton,
  IconCheck,
  IconClose,
  ProductGallery,
  ProductSwimlane,
  AddToCartButton,
} from '~/components';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import {cn, getExcerpt} from '~/lib/utils';
import type {Storefront} from '~/lib/type';
import {
  Button,
  Select,
  useToast,
  SelectItem,
  Typography,
  ToastAction,
  SelectContent,
  SelectTrigger,
  buttonVariants,
} from '~/components/ui';

import type {
  ProductQuery,
  ProductRecommendationsQuery,
} from '../../storefrontapi.generated';

export const headers = routeHeaders;

export async function loader({params, request, context}: DataFunctionArgs) {
  const {handle} = params;
  invariant(handle, 'Missing "$handle" param, check route filename');

  const searchParams = new URL(request.url).searchParams;

  const selectedOptions: SelectedOptionInput[] = [];
  searchParams.forEach((value, name) => {
    selectedOptions.push({name, value});
  });

  const {shop, product} = await context.storefront.query<ProductQuery>(
    PRODUCT_QUERY,
    {
      variables: {
        handle,
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
        selectedOptions,
      },
    },
  );

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

  return defer({
    seo,
    shop,
    product,
    recommended,
    storeDomain: shop.primaryDomain.url,
    analytics: {
      pageType: AnalyticsPageType.product,
      products: [productAnalytics],
      resourceId: product.id,
      totalValue: parseFloat(selectedVariant.price.amount),
    },
  });
}

export default function Product() {
  const {product, shop, recommended} = useLoaderData<typeof loader>();

  const {shippingPolicy, refundPolicy} = shop;
  const {media, title, vendor, descriptionHtml} = product;

  return (
    <>
      <Section className="px-0 md:px-8 lg:px-12">
        <div className="grid items-start md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          <ProductGallery
            media={media.nodes}
            className="w-full lg:col-span-2"
          />

          <div className="hidden-scroll sticky md:top-nav md:-mb-nav md:-translate-y-nav md:overflow-y-scroll md:pt-nav">
            <section className="flex w-full max-w-xl flex-col gap-8 p-6 md:mx-auto md:max-w-sm md:px-1">
              <div className="grid gap-2">
                <Typography.Title as="h1">{title}</Typography.Title>
                {vendor && (
                  <Typography.Text className="opacity-50">
                    {vendor}
                  </Typography.Text>
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
  const {toast} = useToast();
  const navigate = useNavigate();
  const {location} = useNavigation();
  const {product, analytics} = useLoaderData<typeof loader>();
  const [currentSearchParams] = useSearchParams();

  /**
   * We update `searchParams` with in-flight request data from `location` (if available)
   * to create an optimistic UI, e.g. check the product option before the
   * request has completed.
   */
  const searchParams = useMemo(
    () =>
      location ? new URLSearchParams(location.search) : currentSearchParams,
    [location, currentSearchParams],
  );

  const firstVariant = product.variants.nodes[0];

  /**
   * Here we're making an explicit choice to display the product options
   * UI with a default variant, rather than wait for the user to select
   * options first. By default, the first variant's options are used.
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
              <Button disabled>Sold out</Button>
            ) : (
              <AddToCartButton
                data-test="add-to-cart"
                className="flex items-center justify-center gap-2"
                lines={[
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                  },
                ]}
                analytics={{
                  products: [productAnalytics],
                  totalValue: parseFloat(productAnalytics.price),
                }}
                onSuccess={() => {
                  const {dismiss} = toast({
                    title: 'Added to cart',
                    description: 'You can view your cart by clicking here.',
                    action: (
                      <ToastAction
                        altText="Go to Cart"
                        onClick={() => {
                          navigate('/cart');
                          dismiss();
                        }}
                      >
                        Go to cart
                      </ToastAction>
                    ),
                  });
                }}
              >
                <span>Add to Cart</span>
                <span>·</span>
                <Money
                  as="span"
                  data={selectedVariant?.price!}
                  withoutTrailingZeros
                />
                {isOnSale && (
                  <Money
                    withoutTrailingZeros
                    data={selectedVariant?.compareAtPrice!}
                    as="span"
                    className="line-through opacity-50"
                  />
                )}
              </AddToCartButton>
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
  options: Array<{name: string; values: string[]}>;
  searchParamsWithDefaults: URLSearchParams;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {options
        .filter((option) => option.values.length > 1)
        .map((option) => (
          <div key={option.name} className="flex flex-col flex-wrap gap-y-1">
            <Typography.Title as="legend" size="lg">
              {option.name}
            </Typography.Title>

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
                  <Select open={open} onOpenChange={setOpen}>
                    <SelectTrigger>
                      {searchParamsWithDefaults.get(option.name)}
                    </SelectTrigger>
                    <SelectContent>
                      {option.values.map((value) => (
                        <SelectItem
                          key={`option-${option.name}-${value}`}
                          value={value}
                          asChild
                          onClick={() => setOpen(false)}
                        >
                          <ProductOptionLink
                            onClick={() => setOpen(false)}
                            optionName={option.name}
                            optionValue={value}
                            searchParams={searchParamsWithDefaults}
                            className={cn(
                              'flex w-full items-center justify-between px-4 text-primary',
                            )}
                          >
                            {value}
                            {searchParamsWithDefaults.get(option.name) ===
                              value && <IconCheck />}
                          </ProductOptionLink>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <>
                  {option.values.map((value) => {
                    const checked =
                      searchParamsWithDefaults.get(option.name) === value;
                    const id = `option-${option.name}-${value}`;

                    return (
                      <Typography.Text key={id}>
                        <ProductOptionLink
                          optionName={option.name}
                          optionValue={value}
                          searchParams={searchParamsWithDefaults}
                          className={cn(
                            checked ? 'underline' : 'text-foreground/60',
                          )}
                        />
                      </Typography.Text>
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

export function ProductOptionLink({
  children,
  className,
  optionName,
  optionValue,
  searchParams,
  ...props
}: {
  children?: ReactNode;
  optionName: string;
  optionValue: string;
  searchParams: URLSearchParams;
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
      to={`${path}?${clonedSearchParams.toString()}`}
      replace
      prefetch="intent"
      preventScrollReset
      className={cn(
        buttonVariants({
          variant: 'link',
        }),
        'p-0',
        className,
      )}
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
              <Typography.Title as="h4">{title}</Typography.Title>

              <IconClose
                className={cn(
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

const PRODUCT_QUERY = `#graphql
  query Product(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      handle
      vendor
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
          ...ProductVariant
        }
      }
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        ...ProductVariant
      }
    }
    shop {
      name
      primaryDomain {
        url
      }
      refundPolicy {
        body
        handle
      }
      shippingPolicy {
        body
        handle
      }
    }
  }
  ${MEDIA_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query productRecommendations(
    $count: Int
    $country: CountryCode
    $language: LanguageCode
    $productId: ID!
  ) @inContext(country: $country, language: $language) {
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

async function getRecommendedProducts(
  storefront: Storefront,
  productId: string,
) {
  const products = await storefront.query<ProductRecommendationsQuery>(
    RECOMMENDED_PRODUCTS_QUERY,
    {
      variables: {productId, count: 12},
    },
  );

  invariant(products, 'No data returned from the API');

  const mergedProducts = (products.recommended ?? [])
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts.findIndex(
    (item) => item.id === productId,
  );

  mergedProducts.splice(originalProduct, 1);

  return {nodes: mergedProducts};
}
