import {
  UserIcon,
  Bars3Icon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import {useWindowScroll} from 'react-use';
import {Await, Form, useMatches, useParams} from '@remix-run/react';
import React, {Suspense, useEffect, useMemo} from 'react';

import {
  Link,
  Cart,
  Text,
  Avatar,
  Drawer,
  Heading,
  useDrawer,
  CartLoading,
} from '~/components';
import {Search} from '~/routes/api+/search';
import {useCartFetchers, useIsHydrated} from '~/hooks';
import {useIsHomePath, type EnhancedMenu} from '~/lib/utils';

export function Header({title, menu}: {title: string; menu?: EnhancedMenu}) {
  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  const addToCartFetchers = useCartFetchers('ADD_TO_CART');

  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />

      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}

      <MobileHeader title={title} openCart={openCart} openMenu={openMenu} />

      <DesktopHeader title={title} menu={menu} openCart={openCart} />
    </>
  );
}

function DesktopHeader({
  menu,
  title,
  openCart,
}: {
  menu?: EnhancedMenu;
  title: string;
  openCart: () => void;
}) {
  const {y} = useWindowScroll();
  const isHome = useIsHomePath();

  return (
    <header
      role="banner"
      className={`${
        isHome
          ? 'bg-primary/70 text-contrast shadow-dark-header'
          : 'bg-contrast/70 text-primary'
      } ${
        !isHome && y > 50 ? ' shadow-light-header' : ''
      } sticky top-0 z-40 hidden h-nav w-full items-center px-8 leading-none backdrop-blur-lg transition duration-300 lg:flex`}
    >
      <nav className="mx-auto flex w-full items-center justify-between">
        <div className="flex flex-1 justify-start gap-x-6">
          {(menu?.items || []).map((item) => (
            <Link
              key={item.id}
              to={item.to}
              target={item.target}
              prefetch="intent"
              className={({isActive}) =>
                clsx(
                  isActive ? 'border-b-2' : 'border-transparent',
                  isHome ? 'hover:border-contrast' : 'hover:border-primary',
                  'p-2 transition duration-300 ease-in-out hover:border-b-2',
                )
              }
            >
              {item.title}
            </Link>
          ))}
        </div>

        <Link className="py-2 pr-2 font-bold" to="/" prefetch="intent">
          {title}
        </Link>

        <div className="flex flex-1 items-center justify-end gap-x-4">
          <Search />
          {/*<HeaderSearchForm />*/}
          <AccountLink className="relative flex h-8 w-8 items-center justify-center focus:ring-primary/5" />
          <CartCount isHome={isHome} openCart={openCart} />
        </div>
      </nav>
    </header>
  );
}

function MobileHeader({
  title,
  openCart,
  openMenu,
}: {
  title: string;
  openCart: () => void;
  openMenu: () => void;
}) {
  const isHome = useIsHomePath();

  return (
    <header
      role="banner"
      className={`${
        isHome
          ? 'bg-primary/80 text-contrast shadow-dark-header dark:bg-contrast/60 dark:text-primary'
          : 'bg-contrast/80 text-primary'
      } sticky top-0 z-40 flex h-nav w-full items-center justify-between gap-4 px-4 leading-none backdrop-blur-lg md:px-8 lg:hidden`}
    >
      <div className="flex w-full items-center justify-start gap-4">
        <button
          onClick={openMenu}
          className="relative flex h-8 w-8 items-center justify-center"
        >
          <Bars3Icon />
        </button>
        <HeaderSearchForm />
      </div>

      <Link
        className="flex h-full w-full flex-grow items-center justify-center self-stretch leading-[3rem] md:leading-[4rem]"
        to="/"
      >
        <Heading
          className="text-center font-bold leading-none"
          as={isHome ? 'h1' : 'h2'}
        >
          {title}
        </Heading>
      </Link>

      <div className="flex w-full items-center justify-end gap-4">
        <AccountLink className="relative flex h-8 w-8 items-center justify-center" />
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

function CartDrawer({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) {
  const [root] = useMatches();

  return (
    <Drawer open={isOpen} onClose={onClose} heading="Cart" openFrom="right">
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={root.data?.cart}>
            {(cart) => <Cart cart={cart} layout="drawer" onClose={onClose} />}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  );
}

function AccountLink({className}: {className?: string}) {
  const [root] = useMatches();
  const isLoggedIn = root.data?.isLoggedIn;
  return isLoggedIn ? (
    <Link to="/account" className={className}>
      <UserIcon />
    </Link>
  ) : (
    <Link to="/account/login" className={className}>
      <Avatar />
    </Link>
  );
}

function CartCount({
  isHome,
  openCart,
}: {
  isHome: boolean;
  openCart: () => void;
}) {
  const [root] = useMatches();

  return (
    <Suspense
      fallback={<CartBadge count={0} dark={isHome} openCart={openCart} />}
    >
      <Await resolve={root.data?.cart}>
        {(cart) => (
          <CartBadge
            dark={isHome}
            count={cart?.totalQuantity || 0}
            openCart={openCart}
          />
        )}
      </Await>
    </Suspense>
  );
}

function CartBadge({
  dark,
  count,
  openCart,
}: {
  dark: boolean;
  count: number;
  openCart: () => void;
}) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <>
        <ShoppingBagIcon />
        <div
          className={`${
            dark
              ? 'bg-contrast text-primary dark:bg-primary dark:text-contrast'
              : 'bg-primary text-contrast'
          } absolute bottom-1 right-1 flex h-3 w-auto min-w-[0.75rem] items-center justify-center rounded-full px-[0.125rem] pb-px text-center text-[0.625rem] font-medium leading-none subpixel-antialiased`}
        >
          <span>{count || 0}</span>
        </div>
      </>
    ),
    [count, dark],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      className="relative flex h-8 w-8 items-center justify-center focus:ring-primary/5"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="relative flex h-8 w-8 items-center justify-center focus:ring-primary/5"
    >
      {BadgeCounter}
    </Link>
  );
}

function HeaderSearchForm() {
  const params = useParams();

  return (
    <Form
      method="get"
      action={params.locale ? `/${params.locale}/search` : '/search'}
      className="isolate flex rounded-md border-0 bg-primary/10"
    >
      <label htmlFor="desktop-search" className="sr-only">
        Search
      </label>
      <input
        id="desktop-search"
        name="q"
        type="search"
        placeholder="Search"
        className="border-0 bg-transparent focus:ring-0"
      />
      <button type="submit" className="mr-3">
        <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </Form>
  );
}

export function MenuDrawer({
  isOpen,
  onClose,
  menu,
}: {
  isOpen: boolean;
  onClose: () => void;
  menu: EnhancedMenu;
}) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="Menu">
      <div className="grid">
        <MenuMobileNav menu={menu} onClose={onClose} />
      </div>
    </Drawer>
  );
}

function MenuMobileNav({
  menu,
  onClose,
}: {
  menu: EnhancedMenu;
  onClose: () => void;
}) {
  return (
    <nav className="grid gap-4 p-6 sm:gap-6 sm:px-12 sm:py-8">
      {/* Top level menu items */}
      {(menu?.items || []).map((item) => (
        <span key={item.id} className="block">
          <Link
            to={item.to}
            target={item.target}
            onClick={onClose}
            className={({isActive}) =>
              isActive ? '-mb-px border-b pb-1' : 'pb-1'
            }
          >
            <Text as="span" size="copy">
              {item.title}
            </Text>
          </Link>
        </span>
      ))}
    </nav>
  );
}
