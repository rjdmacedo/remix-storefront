import {json} from '@shopify/remix-oxygen';

import {countries} from '~/data/countries';
import {CACHE_LONG} from '~/data/cache';

export async function loader() {
  return json(
    {
      ...countries,
    },
    {
      headers: {
        'cache-control': CACHE_LONG,
      },
    },
  );
}

// no-op
export default function CountriesApiRoute() {
  return null;
}
