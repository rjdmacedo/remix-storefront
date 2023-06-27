import React from 'react';
import {useFetcher} from '@remix-run/react';
import type {MoneyV2, Product} from '@shopify/hydrogen/storefront-api-types';
import type {ShopifyAnalyticsProduct} from '@shopify/hydrogen';
import {flattenConnection, Image, Money, useMoney} from '@shopify/hydrogen';

import {
  Card,
  Badge,
  Button,
  Popover,
  Typography,
  CardContent,
  PopoverContent,
  PopoverTrigger,
  DropdownMenuCheckboxItem,
  RadioGroup,
  RadioGroupItem,
  Label,
} from '~/components/ui';
import {AddToCartButton, Link} from '~/components';
import {getProductPlaceholder} from '~/lib/placeholders';
import type {
  ProductCardFragment,
  ProductVariantFragment,
} from 'storefrontapi.generated';
import {cn, isDiscounted, isNewArrival} from '~/lib/utils';

export function ProductCard({
  label,
  product,
  loading,
  onClick,
  quickAdd,
  className,
}: {
  label?: string;
  product: ProductCardFragment;
  loading?: HTMLImageElement['loading'];
  onClick?: () => void;
  quickAdd?: boolean;
  className?: string;
}) {
  let cardLabel;

  const cardProduct: Product = product?.variants
    ? (product as Product)
    : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const firstVariant = flattenConnection(cardProduct.variants)[0];

  if (!firstVariant) return null;
  const {image, price, compareAtPrice} = firstVariant;

  if (label) {
    cardLabel = label;
  } else if (isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2)) {
    cardLabel = 'Sale';
  } else if (isNewArrival(product.publishedAt)) {
    cardLabel = 'New';
  }

  const productAnalytics: ShopifyAnalyticsProduct = {
    name: product.title,
    brand: product.vendor,
    price: firstVariant.price.amount,
    quantity: 1,
    productGid: product.id,
    variantGid: firstVariant.id,
    variantName: firstVariant.title,
  };

  return (
    <Card>
      <Link
        to={`/products/${product.handle}`}
        onClick={onClick}
        prefetch="intent"
      >
        <div className="card-image aspect-[4/5] bg-primary/5">
          {image && (
            <Image
              alt={image.altText || `Picture of ${product.title}`}
              data={image}
              sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
              loading={loading}
              className="w-full object-cover fade-in"
              aspectRatio="4/5"
            />
          )}
          {cardLabel && (
            <Badge
              variant="secondary"
              className="absolute right-2 top-2 rounded-xl"
            >
              {cardLabel}
            </Badge>
          )}
        </div>
      </Link>

      <CardContent
        className={cn('grid w-full items-center gap-2 p-4', className)}
      >
        <Typography.Text className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {product.title}
        </Typography.Text>

        <Typography.Text className="flex gap-4">
          <Money withoutTrailingZeros data={price!} />
          {isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2) && (
            <CompareAtPrice
              data={compareAtPrice as MoneyV2}
              className="opacity-50"
            />
          )}
        </Typography.Text>

        {quickAdd && (
          <ProductOptionsDropdownMenu
            product={product}
            options={product.options}
          />
        )}
      </CardContent>
    </Card>
  );
}

function ProductOptionsDropdownMenu({
  product,
  options,
}: {
  product: ProductCardFragment;
  options: Array<{name: string; values: string[]}>;
}) {
  const fetcher = useFetcher();
  const [open, setOpen] = React.useState(false);
  const [selectedOptions, setSelectedOptions] = React.useState<
    Record<string, string>
  >(() =>
    options.reduce((acc, {name, values}) => {
      acc[name] = values[0];
      return acc;
    }, {} as Record<string, string>),
  );

  React.useEffect(() => {
    if (!product.handle || Object.keys(selectedOptions).length < 1) return;

    fetcher.load(
      `/api/selected-variant?handle=${
        product.handle
      }&selectedOptions=${JSON.stringify(selectedOptions)}`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptions]);

  const variant = fetcher.data?.data?.variant as ProductVariantFragment;
  const isOutOfStock = variant?.availableForSale === false;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary">Select an Option</Button>
      </PopoverTrigger>

      <PopoverContent className="flex max-w-xs flex-col space-y-6 p-4">
        {options.map(({name, values}) => (
          <div key={name} className="flex flex-col space-y-2">
            <Typography.Text>{name}</Typography.Text>
            <RadioGroup
              id={name}
              value={selectedOptions[name]}
              onValueChange={(value) =>
                setSelectedOptions((prev) => ({...prev, [name]: value}))
              }
            >
              {values.map((value) => (
                <div
                  key={`option-${name}-${value}`}
                  className="flex items-center space-x-2 space-y-0"
                >
                  <RadioGroupItem
                    id={`${name}-${value}`}
                    key={value}
                    value={value}
                    className="text-sm"
                  />
                  <Label htmlFor={`${name}-${value}`} className="text-sm">
                    {value}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}

        <AddToCartButton
          variant={isOutOfStock ? 'destructive' : 'default'}
          disabled={!variant || isOutOfStock}
          onSuccess={() => setOpen(false)}
          lines={[
            {
              quantity: 1,
              merchandiseId: variant?.id,
            },
          ]}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </AddToCartButton>
      </PopoverContent>
    </Popover>
  );
}

function CompareAtPrice({
  data,
  className,
}: {
  data: MoneyV2;
  className?: string;
}) {
  const {currencyNarrowSymbol, withoutTrailingZerosAndCurrency} =
    useMoney(data);

  return (
    <span className={cn('line-through', className)}>
      {currencyNarrowSymbol}
      {withoutTrailingZerosAndCurrency}
    </span>
  );
}
