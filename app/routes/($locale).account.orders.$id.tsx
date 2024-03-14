import React from 'react';
import invariant from 'tiny-invariant';
import {json, redirect} from '@shopify/remix-oxygen';
import type {DataFunctionArgs} from '@shopify/remix-oxygen';
import {Money, Image, flattenConnection} from '@shopify/hydrogen';
import {useLoaderData, type MetaFunction} from '@remix-run/react';

import {
  Badge,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableHeader,
  buttonVariants,
} from '~/components/ui';
import {cn, statusMessage} from '~/lib/utils';
import {CUSTOMER_ACCESS_TOKEN} from '~/lib/const';
import {PRODUCT_VARIANT_FRAGMENT} from '~/data/fragments';
import {Link, Heading, PageHeader, Section} from '~/components';

import type {CustomerOrderQuery} from '../../storefrontapi.generated';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({request, context, params}: DataFunctionArgs) {
  if (!params.id) {
    return redirect(
      params?.locale ? `${params.locale}/account/profile` : '/account/profile',
    );
  }

  await context.authenticator.isAuthenticated(request, {
    failureRedirect: `/login?redirect=/account/orders/${params.id}`,
  });

  const queryParams = new URL(request.url).searchParams;
  const orderToken = queryParams.get('key');

  invariant(orderToken, 'Order token is required');

  const customerAccessToken = await context.session.get(CUSTOMER_ACCESS_TOKEN);

  if (!customerAccessToken) {
    return redirect(params.locale ? `${params.locale}/login` : '/login');
  }

  const orderId = `gid://shopify/Order/${params.id}?key=${orderToken}`;

  const {node: order} = await context.storefront.query<CustomerOrderQuery>(
    CUSTOMER_ORDER_QUERY,
    {variables: {orderId}},
  );

  if (!order || !('lineItems' in order)) {
    throw new Response('Order not found', {status: 404});
  }

  const lineItems = flattenConnection(order.lineItems);
  const discountApplications = flattenConnection(order.discountApplications);

  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' && firstDiscount;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue' &&
    firstDiscount?.percentage;

  return json({
    order,
    lineItems,
    discountValue,
    discountPercentage,
  });
}

export default function OrderRoute() {
  const {order, lineItems, discountValue, discountPercentage} =
    useLoaderData<typeof loader>();

  return (
    <div>
      <PageHeader heading="Order detail">
        <Link
          to="/account"
          className={buttonVariants({
            variant: 'default',
          })}
        >
          Return to Account Overview
        </Link>
      </PageHeader>

      <Section>
        <Typography.Text>Order No. {order.name}</Typography.Text>
        <Typography.Text className="mt-2" as="p">
          Placed on {new Date(order.processedAt!).toDateString()}
        </Typography.Text>

        <div className="flex space-x-6 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Price</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-center">Total</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200">
              {lineItems.map((lineItem) => (
                <TableRow key={lineItem.variant!.id}>
                  <TableCell>
                    <div className="flex gap-6">
                      <Link
                        to={`/products/${lineItem.variant!.product!.handle}`}
                      >
                        {lineItem?.variant?.image && (
                          <div className="card-image aspect-square w-24">
                            <Image
                              data={lineItem.variant.image}
                              width={96}
                              height={96}
                            />
                          </div>
                        )}
                      </Link>

                      <div className="flex flex-col justify-center space-y-1">
                        <Typography.Text as="p">
                          {lineItem.title}
                        </Typography.Text>
                        <Typography.Text as="p" size="xs" className="truncate">
                          {lineItem.variant!.title}
                        </Typography.Text>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <Money data={lineItem.variant!.price!} />
                  </TableCell>
                  <TableCell className="text-center">
                    {lineItem.quantity}
                  </TableCell>
                  <TableCell className="text-center">
                    <Money data={lineItem.discountedTotalPrice!} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ShippingAddress order={order} className="hidden w-1/5 lg:block" />
        </div>

        <div className="flex justify-end space-x-6">
          {((discountValue && discountValue.amount) || discountPercentage) && (
            <div className="flex flex-col items-end space-y-1">
              <Typography.Text>Discounts</Typography.Text>
              <Typography.Text>
                {discountPercentage ? (
                  <span className="text-sm">-{discountPercentage}% OFF</span>
                ) : (
                  discountValue && <Money data={discountValue!} />
                )}
              </Typography.Text>
            </div>
          )}
          <div className="flex flex-col items-end space-y-1">
            <Typography.Text>Subtotal</Typography.Text>
            <Typography.Text>Tax</Typography.Text>
            <Typography.Text>Total</Typography.Text>
          </div>
          <div className="flex flex-col space-y-1">
            <Typography.Text>
              <Money data={order.subtotalPriceV2!} />
            </Typography.Text>
            <Typography.Text>
              <Money data={order.totalTaxV2!} />
            </Typography.Text>
            <Typography.Text>
              <Money data={order.totalPriceV2!} />
            </Typography.Text>
          </div>
        </div>
      </Section>
    </div>
  );
}

function ShippingAddress({
  order,
  className,
}: {
  order: CustomerOrderQuery['node'];
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <Typography.Title weight="bold" className="truncate" as="h3">
        Shipping Address
      </Typography.Title>
      {order?.shippingAddress ? (
        <ul className="mt-6">
          <li>
            <Typography.Text>
              {order.shippingAddress.firstName &&
                order.shippingAddress.firstName + ' '}
              {order.shippingAddress.lastName}
            </Typography.Text>
          </li>
          {order?.shippingAddress?.formatted &&
            order.shippingAddress.formatted.map((line: string) => (
              <li key={line}>
                <Typography.Text>{line}</Typography.Text>
              </li>
            ))}
        </ul>
      ) : (
        <p className="mt-3">No shipping address defined</p>
      )}
      <Heading size="copy" className="mt-8 font-semibold" as="h3">
        Status
      </Heading>

      {order?.fulfillmentStatus && (
        <Badge
          className={cn(
            order.fulfillmentStatus === 'FULFILLED'
              ? 'bg-green-100 text-green-800'
              : '',
          )}
        >
          {statusMessage(order.fulfillmentStatus!)}
        </Badge>
      )}
    </div>
  );
}

const CUSTOMER_ORDER_QUERY = `#graphql
  ${PRODUCT_VARIANT_FRAGMENT}
  fragment Money on MoneyV2 {
    amount
    currencyCode
  }
  fragment AddressFull on MailingAddress {
    address1
    address2
    city
    company
    country
    countryCodeV2
    firstName
    formatted
    id
    lastName
    name
    phone
    province
    provinceCode
    zip
  }
  fragment DiscountApplication on DiscountApplication {
    value {
      __typename
      ... on MoneyV2 {
        amount
        currencyCode
      }
      ... on PricingPercentageValue {
        percentage
      }
    }
  }
  fragment LineItemFull on OrderLineItem {
    title
    quantity
    discountAllocations {
      allocatedAmount {
        ...Money
      }
      discountApplication {
        ...DiscountApplication
      }
    }
    originalTotalPrice {
      ...Money
    }
    discountedTotalPrice {
      ...Money
    }
    variant {
      ...ProductVariant
    }
  }

  query CustomerOrder(
    $country: CountryCode
    $language: LanguageCode
    $orderId: ID!
  ) @inContext(country: $country, language: $language) {
    node(id: $orderId) {
      ... on Order {
        id
        name
        orderNumber
        processedAt
        fulfillmentStatus
        totalTaxV2 {
          ...Money
        }
        totalPriceV2 {
          ...Money
        }
        subtotalPriceV2 {
          ...Money
        }
        shippingAddress {
          ...AddressFull
        }
        discountApplications(first: 100) {
          nodes {
            ...DiscountApplication
          }
        }
        lineItems(first: 100) {
          nodes {
            ...LineItemFull
          }
        }
      }
    }
  }
`;
