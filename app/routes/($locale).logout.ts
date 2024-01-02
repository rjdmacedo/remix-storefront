import type {AppLoadContext, DataFunctionArgs} from '@shopify/remix-oxygen';

import {CUSTOMER_ACCESS_TOKEN} from '~/lib/const';
import {redirectWithSuccess} from '~/lib/toast.server';

export async function action({context}: DataFunctionArgs) {
  return doLogout(context);
}

// no-op
export default function LogoutRoute() {
  return null;
}

export async function doLogout(context: AppLoadContext) {
  context.session.unset(CUSTOMER_ACCESS_TOKEN);

  return redirectWithSuccess(
    `${context.storefront.i18n.pathPrefix}/login`,
    'You have been logged out successfully.',
    {
      headers: {
        'Set-Cookie': await context.session.commit(),
      },
    },
  );
}
