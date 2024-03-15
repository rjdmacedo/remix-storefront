import {MetaFunction, useLoaderData} from '@remix-run/react';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';

import {routeHeaders} from '~/data/cache';
import {redirectWithError} from '~/lib/toast.server';
import {getCustomer, useAccount} from '~/routes/($locale).account';
import {flattenConnection, Money} from '@shopify/hydrogen';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui';
import {statusMessage} from '~/lib/utils';
import {DotsHorizontalIcon} from '@radix-ui/react-icons';

export const handle = {
  accountChild: true,
};

export const meta: MetaFunction = () => {
  return [{title: 'Orders'}];
};

export const headers = routeHeaders;

export async function loader({request, context}: LoaderFunctionArgs) {
  const user = await context.authenticator.isAuthenticated(request);

  return user
    ? null
    : redirectWithError(
        '/login?redirect=/account/orders',
        'You must be logged in to view your orders.',
      );
}

export default function AccountOrders() {
  const {customer} = useAccount();

  const orders = flattenConnection(customer.orders);

  return (
    <div className="border shadow-sm rounded-lg p-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                #{order.orderNumber}
              </TableCell>
              <TableCell>
                {new Date(order.processedAt!).toDateString()}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {statusMessage(order.fulfillmentStatus)}
              </TableCell>
              <TableCell>
                <Money data={order.currentTotalPrice} />
              </TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <DotsHorizontalIcon className="w-5 h-5" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View order</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
