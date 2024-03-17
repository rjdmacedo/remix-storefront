import invariant from 'tiny-invariant';
import {redirect} from '@shopify/remix-oxygen';
import type {DataFunctionArgs} from '@shopify/remix-oxygen';
import type {MailingAddressInput} from '@shopify/hydrogen/storefront-api-types';

import {jsonWithError, jsonWithSuccess} from '~/lib/toast.server';
import {assertApiErrors} from '~/lib/utils';
import type {
  CustomerAddressCreateMutation,
  CustomerAddressDeleteMutation,
  CustomerAddressUpdateMutation,
  CustomerDefaultAddressUpdateMutation,
} from 'storefrontapi.generated';

export async function loader() {
  return redirect('/account/addresses');
}

export async function action({context, request}: DataFunctionArgs) {
  const {storefront, authenticator} = context;

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const formData = await request.formData();

  const addressId = formData.get('address-id');
  invariant(typeof addressId === 'string', 'You must provide an address id.');

  if (request.method === 'DELETE') {
    try {
      const data = await storefront.mutate<CustomerAddressDeleteMutation>(
        DELETE_ADDRESS_MUTATION,
        {
          variables: {
            id: addressId,
            token: user.token,
          },
        },
      );

      assertApiErrors(data.customerAddressDelete);

      return jsonWithSuccess({}, 'Address deleted successfully');
    } catch (error: any) {
      return badRequest(
        {
          status: 'error',
          errors: {form: error.message},
        },
        `Address deletion failed because ${error.message.toLowerCase()}`,
      );
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
      const data = await storefront.mutate<CustomerAddressCreateMutation>(
        CREATE_ADDRESS_MUTATION,
        {
          variables: {token: user.token, address},
        },
      );

      assertApiErrors(data.customerAddressCreate);

      const newId = data.customerAddressCreate?.customerAddress?.id;
      invariant(newId, 'Expected customer address to be created');
      if (defaultAddress) {
        const data =
          await storefront.mutate<CustomerDefaultAddressUpdateMutation>(
            UPDATE_DEFAULT_ADDRESS_MUTATION,
            {
              variables: {
                token: user.token,
                addressId: newId,
              },
            },
          );

        assertApiErrors(data.customerDefaultAddressUpdate);
      }

      return jsonWithSuccess({}, 'Address created successfully');
    } catch (error: any) {
      return badRequest(
        {
          status: 'error',
          errors: {form: error.message},
        },
        `Address creation failed because ${error.message.toLowerCase()}`,
      );
    }
  } else {
    try {
      const data = await storefront.mutate<CustomerAddressUpdateMutation>(
        UPDATE_ADDRESS_MUTATION,
        {
          variables: {
            id: decodeURIComponent(addressId),
            token: user.token,
            address,
          },
        },
      );

      assertApiErrors(data.customerAddressUpdate);

      if (defaultAddress) {
        const data =
          await storefront.mutate<CustomerDefaultAddressUpdateMutation>(
            UPDATE_DEFAULT_ADDRESS_MUTATION,
            {
              variables: {
                token: user.token,
                addressId: decodeURIComponent(addressId),
              },
            },
          );

        assertApiErrors(data.customerDefaultAddressUpdate);
      }

      return jsonWithSuccess(
        {
          status: 'success',
          errors: {},
        },
        'Address updated successfully',
      );
    } catch (error: any) {
      return badRequest(
        {
          status: 'error',
          errors: {form: error.message},
        },
        `Address update failed because ${error.message.toLowerCase()}`,
      );
    }
  }
}

// no-op
export default function EditAddress() {
  return null;
}

interface ActionData {
  status?: 'success' | 'error';
  errors?: Record<string, string>;
}

const badRequest = (data: ActionData, toast: string) =>
  jsonWithError(data, toast, {status: 400});

const UPDATE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressUpdate(
    $id: ID!
    $token: String!
    $address: MailingAddressInput!
  ) {
    customerAddressUpdate(
      id: $id
      address: $address
      customerAccessToken: $token
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
  $token: String!
  $address: MailingAddressInput!
) {
  customerAddressCreate(
    address: $address
    customerAccessToken: $token
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
  mutation customerAddressDelete($id: ID!, $token: String!) {
    customerAddressDelete(customerAccessToken: $token, id: $id) {
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
    $token: String!
    $addressId: ID!
  ) {
    customerDefaultAddressUpdate(
      addressId: $addressId
      customerAccessToken: $token
    ) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
