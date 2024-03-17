import {redirect} from '@shopify/remix-oxygen';
import type {DataFunctionArgs} from '@shopify/remix-oxygen';

import {redirectWithSuccess} from '~/lib/toast.server';
import {prefixPathWithLocale} from '~/lib/utils';

export async function loader() {
  return redirect('/', 302);
}

export async function action({context}: DataFunctionArgs) {
  context.session.unset(context.authenticator.sessionKey);

  const to = prefixPathWithLocale('/', context.storefront);

  console.log('to', to);

  return redirectWithSuccess(to, 'You have been successfully logged out', {
    headers: {
      'Set-Cookie': await context.session.commit(),
    },
  });
}

// no-op
export default function LogoutRoute() {
  return null;
}
