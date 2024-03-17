/// <reference types="@remix-run/dev" />
/// <reference types="@shopify/remix-oxygen" />
/// <reference types="@shopify/oxygen-workers-types" />

import {Authenticator} from 'remix-auth';

import type {
  Storefront,
  HydrogenCart,
  CustomerAccount,
} from '@shopify/hydrogen';
import type {AppSession} from '~/lib/hydrogen.server';
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

declare global {
  /**
   * A global `process` object is only available during build to access NODE_ENV.
   */
  const process: {env: {NODE_ENV: 'production' | 'development'}};

  /**
   * Declare expected Env parameter in fetch handler.
   */
  interface Env {
    SESSION_SECRET: string;
    PUBLIC_STOREFRONT_API_TOKEN: string;
    PRIVATE_STOREFRONT_API_TOKEN: string;
    PUBLIC_STORE_DOMAIN: string;
    PUBLIC_STOREFRONT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_URL: string;
  }
}

declare module '@shopify/remix-oxygen' {
  /**
   * Declare local additions to the Remix loader context.
   */
  export interface AppLoadContext {
    env: Env;
    cart: HydrogenCart;
    session: AppSession;
    waitUntil: ExecutionContext['waitUntil'];
    storefront: Storefront;
    customerAccount: CustomerAccount;
    authenticator: Authenticator<
      Pick<StorefrontAPI.Customer, 'email' | 'firstName' | 'lastName'> & {
        token: string;
      }
    >;
  }

  /**
   * Declare the data we expect to access via `context.session`.
   */
  export interface SessionData {
    customerAccessToken: string;
  }
}

// Needed to make this file a module.
export {};
