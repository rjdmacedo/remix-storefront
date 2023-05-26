import type {TwSize} from '~/lib/type';

export const PAGINATION_SIZE = 8;
export const MAX_AMOUNT_SIZE = 250;
export const DEFAULT_GRID_IMG_LOAD_EAGER_COUNT = 4;
export const ATTR_LOADING_EAGER = 'eager';

export function getImageLoadingPriority(
  index: number,
  maxEagerLoadCount = DEFAULT_GRID_IMG_LOAD_EAGER_COUNT,
) {
  return index < maxEagerLoadCount ? ATTR_LOADING_EAGER : undefined;
}

/**
 * The size of the space
 * 4xs: 4 (16px)
 * 3xs: 8 (32px)
 * 2xs: 12 (48px)
 * xs: 16 (64px)
 * sm: 20 (80px)
 * md: 24 (96px)
 * lg: 28 (112px)
 * xl: 32 (128px)
 * 2xl: 36 (144px)
 * 3xl: 40 (160px)
 * 4xl: 44 (176px)
 */
export const Sizes: Record<TwSize, string> = {
  '4xs': '4',
  '3xs': '8',
  '2xs': '12',
  xs: '16',
  sm: '20',
  md: '24',
  lg: '28',
  xl: '32',
  '2xl': '36',
  '3xl': '40',
  '4xl': '44',
};
