import React from 'react';
import {MetaFunction} from '@remix-run/react';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {flattenConnection, Money} from '@shopify/hydrogen';

import {
  Table,
  Button,
  TableRow,
  Separator,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableHeader,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui';
import {useAccount} from '~/routes/($locale).account';
import {routeHeaders} from '~/data/cache';
import {statusMessage} from '~/lib/utils';
import {redirectWithError} from '~/lib/toast.server';
import {DotsHorizontalIcon} from '@radix-ui/react-icons';
import {CustomerDetailsFragment} from '../../storefrontapi.generated';

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

  return (
    <div className="space-y-6">
      <Typography.Title size="xl">Orders</Typography.Title>
      <Typography.Text size="sm" color="muted-foreground">
        View your order history and manage your orders.
      </Typography.Text>
      <Separator />
      <OrdersTable customer={customer} />
    </div>
  );
}

function OrdersTable({customer}: {customer: CustomerDetailsFragment}) {
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
