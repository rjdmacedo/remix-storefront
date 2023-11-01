import type {
  Cart as CartType,
  CartCost,
  CartLine,
  CartLineUpdateInput,
} from '@shopify/hydrogen/storefront-api-types';
import React, {useRef} from 'react';
import {useScroll} from 'react-use';
import {
  Money,
  Image,
  CartForm,
  OptimisticInput,
  flattenConnection,
  useOptimisticData,
} from '@shopify/hydrogen';

import {cn, getInputStyleClasses} from '~/lib/utils';
import {Button, buttonVariants, Typography} from '~/components/ui';
import {IconRemove, Link, FeaturedProducts} from '~/components';

type Layout = 'page' | 'drawer';

export function Cart({
  cart,
  layout,
  onClose,
}: {
  cart: CartType | null;
  layout: Layout;
  onClose?: () => void;
}) {
  const linesCount = Boolean(cart?.lines?.edges?.length || 0);

  return (
    <>
      <CartEmpty hidden={linesCount} onClose={onClose} layout={layout} />
      <CartDetails cart={cart} layout={layout} />
    </>
  );
}

function CartDetails({cart, layout}: {cart: CartType | null; layout: Layout}) {
  // @todo: get optimistic cart cost
  const cartHasItems = !!cart && cart.totalQuantity > 0;
  const container = {
    page: 'w-full pb-12 grid md:grid-cols-2 md:items-start gap-8 md:gap-8 lg:gap-12',
    drawer: 'grid grid-cols-1 h-screen-no-nav grid-rows-[1fr_auto]',
  };

  return (
    <div className={container[layout]}>
      <CartLines lines={cart?.lines} layout={layout} />
      {cartHasItems && (
        <CartSummary cost={cart.cost} layout={layout}>
          <CartDiscounts discountCodes={cart.discountCodes} />
          <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
        </CartSummary>
      )}
    </div>
  );
}

/**
 * Temporary discount UI
 * @param discountCodes the current discount codes applied to the cart
 * @todo rework when a design is ready
 */
function CartDiscounts({
  discountCodes,
}: {
  discountCodes: CartType['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <>
      {/* Have existing discount, display it with a remove option */}
      <dl className={codes && codes.length !== 0 ? 'grid' : 'hidden'}>
        <div className="flex items-center justify-between font-medium">
          <Typography.Text as="dt">Discount(s)</Typography.Text>
          <div className="flex items-center justify-between">
            <UpdateDiscountForm>
              <button>
                <IconRemove
                  aria-hidden="true"
                  style={{height: 18, marginRight: 4}}
                />
              </button>
            </UpdateDiscountForm>
            <Typography.Text as="dd">{codes?.join(', ')}</Typography.Text>
          </div>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div
          className={cn('flex', 'text-copy items-center justify-between gap-4')}
        >
          <input
            className={getInputStyleClasses()}
            type="text"
            name="discountCode"
            placeholder="Discount code"
          />
          <button className="flex justify-end whitespace-nowrap font-medium">
            Apply Discount
          </button>
        </div>
      </UpdateDiscountForm>
    </>
  );
}

function UpdateDiscountForm({
  children,
  discountCodes,
}: {
  children: React.ReactNode;
  discountCodes?: string[];
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{discountCodes: discountCodes || []}}
    >
      {children}
    </CartForm>
  );
}

function CartLines({
  lines: cartLines,
  layout = 'drawer',
}: {
  lines: CartType['lines'] | undefined;
  layout: Layout;
}) {
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);

  const className = cn([
    y > 0 ? 'border-t' : '',
    layout === 'page'
      ? 'flex-grow md:translate-y-4'
      : 'px-6 pb-6 sm-max:pt-2 overflow-auto transition md:px-12',
  ]);

  const currentLines = cartLines ? flattenConnection(cartLines) : [];

  return (
    <section
      ref={scrollRef}
      className={className}
      aria-labelledby="cart-contents"
    >
      <ul className="grid gap-6 md:gap-10">
        {currentLines.map((line) => (
          <CartLineItem key={line.id} line={line as CartLine} />
        ))}
      </ul>
    </section>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl: string}) {
  if (!checkoutUrl) return null;

  return (
    <div className="mt-2 flex flex-col">
      <a
        href={checkoutUrl}
        target="_self"
        className={cn(buttonVariants(), 'block w-full')}
      >
        Continue to Checkout
      </a>
      {/* @todo: <CartShopPayButton cart={cart} /> */}
    </div>
  );
}

function CartSummary({
  cost,
  layout,
  children = null,
}: {
  cost: CartCost;
  layout: Layout;
  children?: React.ReactNode;
}) {
  const summary = {
    page: 'sticky top-nav grid gap-6 p-4 md:px-6 md:translate-y-4 bg-primary/5 rounded w-full',
    drawer: 'grid gap-4 p-6 border-t md:px-12',
  };

  return (
    <section aria-labelledby="summary-heading" className={summary[layout]}>
      <Typography.Title id="summary-heading" className="sr-only">
        Order summary
      </Typography.Title>

      <dl className="grid">
        <div className="flex items-center justify-between font-medium">
          <Typography.Text as="dt">Subtotal</Typography.Text>
          <Typography.Text as="dd" data-test="subtotal">
            {cost?.subtotalAmount?.amount ? (
              <Money data={cost?.subtotalAmount} />
            ) : (
              '-'
            )}
          </Typography.Text>
        </div>
      </dl>
      {children}
    </section>
  );
}

type OptimisticData = {
  action?: string;
  quantity?: number;
};

function CartLineItem({line}: {line: CartLine}) {
  const optimisticData = useOptimisticData<OptimisticData>(line?.id);

  if (!line?.id) return null;

  const {id, quantity, merchandise} = line;

  if (typeof quantity === 'undefined' || !merchandise?.product) return null;

  return (
    <li
      key={id}
      className="flex gap-4"
      style={{
        // Hide the line item if the optimistic data action is remove
        // Do not remove the form from the DOM
        display: optimisticData?.action === 'remove' ? 'none' : 'flex',
      }}
    >
      <div className="flex-shrink">
        {merchandise.image && (
          <Image
            alt={merchandise.title}
            data={merchandise.image}
            width={110}
            height={110}
            className="h-24 w-24 rounded border object-cover object-center md:h-28 md:w-28"
          />
        )}
      </div>

      <div className="flex flex-grow justify-between">
        <div className="grid gap-2">
          <Typography.Title as="h3" size="xl" weight="bold">
            {merchandise?.product?.handle ? (
              <Link to={`/products/${merchandise.product.handle}`}>
                {merchandise?.product?.title || ''}
              </Link>
            ) : (
              <Typography.Text>
                {merchandise?.product?.title || ''}
              </Typography.Text>
            )}
          </Typography.Title>

          <div className="grid pb-2">
            {(merchandise?.selectedOptions || []).map((option) => (
              <Typography.Text key={option.name}>
                {option.name}: {option.value}
              </Typography.Text>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-copy flex justify-start">
              <CartLineQuantityAdjust line={line} />
            </div>
            <ItemRemoveButton lineId={id} />
          </div>
        </div>

        <Typography.Text>
          <CartLinePrice line={line} as="span" />
        </Typography.Text>
      </div>
    </li>
  );
}

function ItemRemoveButton({lineId}: {lineId: CartLine['id']}) {
  return (
    <CartForm
      route="/cart"
      inputs={{lineIds: [lineId]}}
      action={CartForm.ACTIONS.LinesRemove}
    >
      {(fetcher) => (
        <Button
          size="icon"
          type="submit"
          variant="outline"
          disabled={fetcher.state !== 'idle'}
        >
          <span className="sr-only">Remove</span>
          <IconRemove aria-hidden="true" />
        </Button>
      )}
    </CartForm>
  );
}

function CartLineQuantityAdjust({line}: {line: CartLine}) {
  const optimisticId = line?.id;
  const optimisticData = useOptimisticData<OptimisticData>(optimisticId);

  if (!line || typeof line?.quantity === 'undefined') return null;

  const optimisticQuantity = optimisticData?.quantity || line.quantity;

  const {id: lineId} = line;
  const prevQuantity = Number(Math.max(0, optimisticQuantity - 1).toFixed(0));
  const nextQuantity = Number((optimisticQuantity + 1).toFixed(0));

  return (
    <>
      <label htmlFor={`quantity-${lineId}`} className="sr-only">
        Quantity, {optimisticQuantity}
      </label>
      <div className="flex items-center space-x-3">
        <UpdateCartButton lines={[{id: lineId, quantity: prevQuantity}]}>
          {({busy}) => (
            <Button
              name="decrease-quantity"
              size="icon"
              value={prevQuantity}
              variant="outline"
              disabled={optimisticQuantity <= 1 || busy}
              aria-label="Decrease quantity"
            >
              <span>&#8722;</span>
              <OptimisticInput
                id={optimisticId}
                data={{quantity: prevQuantity}}
              />
            </Button>
          )}
        </UpdateCartButton>

        <Typography.Text data-test="item-quantity">
          {optimisticQuantity}
        </Typography.Text>

        <UpdateCartButton lines={[{id: lineId, quantity: nextQuantity}]}>
          {({busy}) => (
            <Button
              name="increase-quantity"
              size="icon"
              value={nextQuantity}
              variant="outline"
              disabled={busy}
              aria-label="Increase quantity"
            >
              <span>&#43;</span>
              <OptimisticInput
                id={optimisticId}
                data={{quantity: nextQuantity}}
              />
            </Button>
          )}
        </UpdateCartButton>
      </div>
    </>
  );
}

function UpdateCartButton({
  lines,
  children,
}: {
  lines: CartLineUpdateInput[];
  children: React.ReactNode | (({busy}: {busy: boolean}) => React.ReactNode);
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {(fetcher) =>
        typeof children === 'function'
          ? children({busy: fetcher.state !== 'idle'})
          : children
      }
    </CartForm>
  );
}

function CartLinePrice({
  line,
  priceType = 'regular',
  ...passThroughProps
}: {
  line: CartLine;
  priceType?: 'regular' | 'compareAt';
  [key: string]: any;
}) {
  if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) return null;

  const moneyV2 =
    priceType === 'regular'
      ? line.cost.totalAmount
      : line.cost.compareAtAmountPerQuantity;

  if (moneyV2 == null) {
    return null;
  }

  return <Money withoutTrailingZeros {...passThroughProps} data={moneyV2} />;
}

function CartEmpty({
  hidden = false,
  layout = 'drawer',
  onClose,
}: {
  hidden: boolean;
  layout?: Layout;
  onClose?: () => void;
}) {
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);

  const container = {
    page: cn([
      hidden ? '' : 'grid',
      `pb-12 w-full md:items-start gap-4 md:gap-8 lg:gap-12`,
    ]),
    drawer: cn([
      'content-start gap-4 px-6 pb-8 transition overflow-y-scroll md:gap-12 md:px-12 h-screen-no-nav md:pb-12',
      y > 0 ? 'border-t' : '',
    ]),
  };

  return (
    <div ref={scrollRef} className={container[layout]} hidden={hidden}>
      <section className="grid gap-6">
        <Typography.Text format>
          Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
          started!
        </Typography.Text>

        <div>
          <Button onClick={onClose}>Continue shopping</Button>
        </div>
      </section>
      <section className="grid gap-8 pt-16">
        <FeaturedProducts
          count={4}
          heading="Shop Best Sellers"
          layout={layout}
          onClose={onClose}
          sortKey="BEST_SELLING"
        />
      </section>
    </div>
  );
}
