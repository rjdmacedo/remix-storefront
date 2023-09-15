import {Form, useParams, useActionData, useNavigation} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {flattenConnection} from '@shopify/hydrogen';
import type {MailingAddressInput} from '@shopify/hydrogen/storefront-api-types';
import {json, redirect, type DataFunctionArgs} from '@shopify/remix-oxygen';

import {
  Input,
  Button,
  Checkbox,
  Typography,
  buttonVariants,
} from '~/components/ui';
import {Link} from '~/components';
import {cn, assertApiErrors} from '~/lib/utils';
import {CUSTOMER_ACCESS_TOKEN} from '~/lib/const';
import {useAccount} from '~/routes/($locale).account';

export const handle = {
  renderInModal: true,
};

export async function action({context, request, params}: DataFunctionArgs) {
  const {storefront, session} = context;
  const formData = await request.formData();

  const customerAccessToken = await session.get(CUSTOMER_ACCESS_TOKEN);
  invariant(customerAccessToken, 'You must be logged in to edit your account.');

  const addressId = formData.get('address-id');
  invariant(typeof addressId === 'string', 'You must provide an address id.');

  if (request.method === 'DELETE') {
    try {
      const data = await storefront.mutate(DELETE_ADDRESS_MUTATION, {
        variables: {customerAccessToken, id: addressId},
      });

      assertApiErrors(data.customerAddressDelete);

      return redirect(params.locale ? `${params.locale}/account` : '/account');
    } catch (error: any) {
      return badRequest({formError: error.message});
    }
  }

  const address: MailingAddressInput = {};

  const keys: (keyof MailingAddressInput)[] = [
    'zip',
    'city',
    'phone',
    'company',
    'country',
    'address1',
    'address2',
    'lastName',
    'province',
    'firstName',
  ];

  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value === 'string') {
      address[key] = value;
    }
  }

  const defaultAddress = formData.get('defaultAddress');

  if (addressId === 'add') {
    try {
      const data = await storefront.mutate(CREATE_ADDRESS_MUTATION, {
        variables: {customerAccessToken, address},
      });

      assertApiErrors(data.customerAddressCreate);

      const newId = data.customerAddressCreate?.customerAddress?.id;
      invariant(newId, 'Expected customer address to be created');

      if (defaultAddress) {
        const data = await storefront.mutate(UPDATE_DEFAULT_ADDRESS_MUTATION, {
          variables: {customerAccessToken, addressId: newId},
        });

        assertApiErrors(data.customerDefaultAddressUpdate);
      }

      return redirect(params.locale ? `${params.locale}/account` : '/account');
    } catch (error: any) {
      return badRequest({formError: error.message});
    }
  } else {
    try {
      const data = await storefront.mutate(UPDATE_ADDRESS_MUTATION, {
        variables: {
          address,
          customerAccessToken,
          id: decodeURIComponent(addressId),
        },
      });

      assertApiErrors(data.customerAddressUpdate);

      if (defaultAddress) {
        const data = await storefront.mutate(UPDATE_DEFAULT_ADDRESS_MUTATION, {
          variables: {
            customerAccessToken,
            addressId: decodeURIComponent(addressId),
          },
        });

        assertApiErrors(data.customerDefaultAddressUpdate);
      }

      return redirect(params.locale ? `${params.locale}/account` : '/account');
    } catch (error: any) {
      return badRequest({formError: error.message});
    }
  }
}

export default function EditAddress() {
  const {state} = useNavigation();
  const {customer} = useAccount();
  const actionData = useActionData<ActionData>();
  const {id: addressId} = useParams();

  const isNewAddress = addressId === 'add';
  const defaultAddress = customer?.defaultAddress;

  const addresses = flattenConnection(customer?.addresses);

  /**
   * When a refresh happens (or a user visits this link directly), the URL
   * is actually stale because it contains a special token. This means the data
   * loaded by the parent and passed to the outlet contains a newer, fresher token,
   * and we don't find a match. We update the `find` logic to just perform a match
   * on the first (permanent) part of the ID.
   */
  const normalizedAddress = decodeURIComponent(addressId ?? '').split('?')[0];
  const address = addresses.find((address) =>
    address.id!.startsWith(normalizedAddress),
  );

  return (
    <>
      <Typography.Title>
        {isNewAddress ? 'Add address' : 'Edit address'}
      </Typography.Title>

      <div className="max-w-lg">
        <Form method="post" className="flex flex-col space-y-4">
          <input
            type="hidden"
            name="address-id"
            value={address?.id ?? addressId}
          />

          {actionData?.formError && (
            <div className="mb-6 flex items-center justify-center rounded bg-red-100">
              <p className="m-4 text-sm text-red-900">{actionData.formError}</p>
            </div>
          )}

          <Input
            id="firstName"
            name="firstName"
            required
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            aria-label="First name"
            defaultValue={address?.firstName ?? ''}
          />

          <Input
            id="lastName"
            name="lastName"
            required
            type="text"
            autoComplete="family-name"
            placeholder="Last name"
            aria-label="Last name"
            defaultValue={address?.lastName ?? ''}
          />

          <Input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            placeholder="Company"
            aria-label="Company"
            defaultValue={address?.company ?? ''}
          />

          <Input
            id="address1"
            name="address1"
            type="text"
            autoComplete="address-line1"
            placeholder="Address line 1*"
            required
            aria-label="Address line 1"
            defaultValue={address?.address1 ?? ''}
          />

          <Input
            id="address2"
            name="address2"
            type="text"
            autoComplete="address-line2"
            placeholder="Address line 2"
            aria-label="Address line 2"
            defaultValue={address?.address2 ?? ''}
          />

          <Input
            id="city"
            name="city"
            type="text"
            required
            autoComplete="address-level2"
            placeholder="City"
            aria-label="City"
            defaultValue={address?.city ?? ''}
          />

          <Input
            id="province"
            name="province"
            type="text"
            autoComplete="address-level1"
            placeholder="State / Province"
            required
            aria-label="State"
            defaultValue={address?.province ?? ''}
          />

          <Input
            id="zip"
            name="zip"
            type="text"
            autoComplete="postal-code"
            placeholder="Zip / Postal Code"
            required
            aria-label="Zip"
            defaultValue={address?.zip ?? ''}
          />

          <Input
            id="country"
            name="country"
            type="text"
            autoComplete="country-name"
            placeholder="Country"
            required
            aria-label="Country"
            defaultValue={address?.country ?? ''}
          />

          <Input
            id="phone"
            name="phone"
            type="tel"
            aria-label="Phone"
            placeholder="Phone"
            autoComplete="tel"
            defaultValue={address?.phone ?? ''}
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="defaultAddress"
              name="defaultAddress"
              defaultChecked={defaultAddress?.id === address?.id}
            />
            <label
              className="ml-2 inline-block cursor-pointer text-sm"
              htmlFor="defaultAddress"
            >
              Set as default address
            </label>
          </div>

          <Button
            type="submit"
            disabled={state !== 'idle'}
            className="block w-full"
          >
            {state !== 'idle' ? 'Saving' : 'Save'}
          </Button>

          <Link
            to=".."
            className={cn(buttonVariants({variant: 'ghost'}), 'block w-full')}
          >
            Cancel
          </Link>
        </Form>
      </div>
    </>
  );
}

interface ActionData {
  formError?: string;
}

const badRequest = (data: ActionData) => json(data, {status: 400});

const UPDATE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressUpdate(
    $address: MailingAddressInput!
    $customerAccessToken: String!
    $id: ID!
  ) {
    customerAddressUpdate(
      address: $address
      customerAccessToken: $customerAccessToken
      id: $id
    ) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CREATE_ADDRESS_MUTATION = `#graphql
mutation customerAddressCreate(
  $address: MailingAddressInput!
  $customerAccessToken: String!
) {
  customerAddressCreate(
    address: $address
    customerAccessToken: $customerAccessToken
  ) {
    customerAddress {
      id
    }
    customerUserErrors {
      code
      field
      message
    }
  }
}
`;

const DELETE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      customerUserErrors {
        code
        field
        message
      }
      deletedCustomerAddressId
    }
  }
`;

const UPDATE_DEFAULT_ADDRESS_MUTATION = `#graphql
  mutation customerDefaultAddressUpdate(
    $addressId: ID!
    $customerAccessToken: String!
  ) {
    customerDefaultAddressUpdate(
      addressId: $addressId
      customerAccessToken: $customerAccessToken
    ) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
