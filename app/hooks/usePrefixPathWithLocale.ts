import {DEFAULT_LOCALE} from '~/lib/utils';
import {useRootLoaderData} from '~/root';

/**
 * Prefixes the path with the current locale path prefix.
 * @param path The path to prefix
 */
export function usePrefixPathWithLocale(path: string) {
  const rootData = useRootLoaderData();
  const selectedLocale = rootData?.selectedLocale ?? DEFAULT_LOCALE;

  return `${selectedLocale.pathPrefix}${
    path.startsWith('/') ? path : '/' + path
  }`;
}
