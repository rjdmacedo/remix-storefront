import {Authenticator, AuthorizationError} from 'remix-auth';
import {FormStrategy} from 'remix-auth-form';
import invariant from 'tiny-invariant';
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';
import * as z from 'zod';

import {doLogin} from '~/routes/($locale).login';
import {getCustomer} from '~/routes/($locale).account';
import {preprocessFormData} from '~/lib/forms';
import {emailSchema, passwordSchema} from '~/lib/validation/user';
import {HydrogenSession} from '~/lib/hydrogen.server';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<
  Pick<StorefrontAPI.Customer, 'email' | 'firstName' | 'lastName'> & {
    token: string;
  }
>(HydrogenSession.storage, {
  sessionKey: 'user',
  sessionErrorKey: 'access-token-error',
});

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({form, context}) => {
    invariant(context, 'context must be defined');

    const result = LoginFormSchema.safeParse(
      preprocessFormData(form, LoginFormSchema),
    );

    if (!result.success) {
      throw new AuthorizationError(result.error.errors[0].message);
    }

    return doLogin(context, {
      email: result.data.email,
      password: result.data.password,
    })
      .catch(() => {
        throw new AuthorizationError('Invalid email or password');
      })
      .then(async (token) => ({
        ...(await getCustomer(context, token)),
        token,
      }))
      .then(({token, email, lastName, firstName}) => ({
        email,
        token,
        lastName,
        firstName,
      }));
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  'user-pass',
);

const LoginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
