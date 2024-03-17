export const PAGINATION_SIZE = 8;
export const MAX_AMOUNT_SIZE = 250;
export const ATTR_LOADING_EAGER = 'eager';
export const CUSTOMER_ACCESS_TOKEN = 'customer-access-token';
export const DEFAULT_GRID_IMG_LOAD_EAGER_COUNT = 4;

export function getImageLoadingPriority(
  index: number,
  maxEagerLoadCount = DEFAULT_GRID_IMG_LOAD_EAGER_COUNT,
) {
  return index < maxEagerLoadCount ? ATTR_LOADING_EAGER : undefined;
}
