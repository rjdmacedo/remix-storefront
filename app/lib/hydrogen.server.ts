import type {HydrogenSession} from '@shopify/hydrogen';
import {createThemeSessionResolver} from 'remix-themes';
import {createCookieSessionStorage} from '@shopify/remix-oxygen';
import type {Session, SessionStorage} from '@shopify/remix-oxygen';

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: '__theme',
    // domain: 'remix.run',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secrets: ['s3cr3t'],
    // secure: true,
  },
});

export const themeSessionResolver = createThemeSessionResolver(themeStorage);

/**
 * This is a custom session implementation for your Hydrogen shop.
 * Feel free to customize it to your needs, add helper methods, or
 * swap out the cookie-based implementation with something else!
 */
export class AppSession implements HydrogenSession {
  #sessionStorage;
  readonly #session;
  private static secrets: string[];

  constructor(storage: SessionStorage, session: Session) {
    this.#session = session;
    this.#sessionStorage = storage;
  }

  static get storage() {
    return createCookieSessionStorage({
      cookie: {
        name: '__session',
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secrets: ['s3cr3t'],
      },
    });
  }

  static async init(request: Request, secrets: string[]) {
    const storage = this.storage;
    const session = await storage.getSession(request.headers.get('Cookie'));

    return new this(storage, session);
  }

  get has() {
    return this.#session.has;
  }

  get get() {
    return this.#session.get;
  }

  get flash() {
    return this.#session.flash;
  }

  get unset() {
    return this.#session.unset;
  }

  get set() {
    return this.#session.set;
  }

  destroy() {
    return this.#sessionStorage.destroySession(this.#session);
  }

  commit() {
    return this.#sessionStorage.commitSession(this.#session);
  }
}
