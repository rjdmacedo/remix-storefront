import {useLocation} from '@remix-run/react';

import {DEFAULT_LOCALE} from '~/lib/utils';
import {useRootLoaderData} from '~/root';

/**
 * Returns true if the current path is the home page
 */
export function useIsHomePath() {
  const rootData = useRootLoaderData();
  const {pathname} = useLocation();

  const selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;
  const strippedPathname = pathname.replace(selectedLocale.pathPrefix, '');

  return strippedPathname === '/';
}
