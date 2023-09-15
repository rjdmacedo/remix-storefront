import {redirect} from '@shopify/remix-oxygen';
import type {AppLoadContext, DataFunctionArgs} from '@shopify/remix-oxygen';

import {CUSTOMER_ACCESS_TOKEN} from '~/lib/const';

export async function loader({context}: DataFunctionArgs) {
  return redirect(context.storefront.i18n.pathPrefix);
}

export async function action({context}: DataFunctionArgs) {
  return doLogout(context);
}

// no-op
export default function LogoutRoute() {
  return null;
}

export async function doLogout(context: AppLoadContext) {
  const {session} = context;
  session.unset(CUSTOMER_ACCESS_TOKEN);

  // The only file where I have to explicitly type cast i18n to pass typecheck
  return redirect(`${context.storefront.i18n.pathPrefix}/account/login`, {
    headers: {
      'Set-Cookie': await session.commit(),
    },
  });
}
