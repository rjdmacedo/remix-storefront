import {
  useShopifyCookies,
  AnalyticsEventName,
  sendShopifyAnalytics,
  getClientBrowserParameters,
  type ShopifyPageViewPayload,
  type ShopifyAddToCartPayload,
} from '@shopify/hydrogen';
import {useEffect} from 'react';
import {useLocation} from '@remix-run/react';

import {CartAction, type I18nLocale} from '~/lib/type';
import {useDataFromMatches} from '~/hooks/useDataFromMatches';
import {useDataFromFetchers} from '~/hooks/useDataFromFetchers';

export function useAnalytics(hasUserConsent: boolean, locale: I18nLocale) {
  useShopifyCookies({hasUserConsent});
  const location = useLocation();
  const analyticsFromMatches = useDataFromMatches(
    'analytics',
  ) as unknown as ShopifyPageViewPayload;

  const pageAnalytics = {
    ...analyticsFromMatches,
    currency: locale.currency,
    acceptedLanguage: locale.language,
    hasUserConsent,
  };

  // Page view analytics
  // We want useEffect to execute only when location changes
  // which represents a page view
  useEffect(() => {
    const payload: ShopifyPageViewPayload = {
      ...getClientBrowserParameters(),
      ...pageAnalytics,
    };

    sendShopifyAnalytics({
      eventName: AnalyticsEventName.PAGE_VIEW,
      payload,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // Add to cart analytics
  const cartData = useDataFromFetchers({
    formDataKey: 'cartAction',
    formDataValue: CartAction.ADD_TO_CART,
    dataKey: 'analytics',
  }) as unknown as ShopifyAddToCartPayload;
  if (cartData) {
    const addToCartPayload: ShopifyAddToCartPayload = {
      ...getClientBrowserParameters(),
      ...pageAnalytics,
      ...cartData,
    };

    sendShopifyAnalytics({
      eventName: AnalyticsEventName.ADD_TO_CART,
      payload: addToCartPayload,
    });
  }
}
