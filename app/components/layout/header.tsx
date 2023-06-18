import React, {Suspense, useEffect, useMemo} from 'react';
import {Await, useMatches, useNavigate, type LinkProps} from '@remix-run/react';

import {cn, type EnhancedMenu} from '~/lib/utils';
import {Badge} from '~/components/ui/badge';
import {Avatar} from '~/components/ui/avatar';
import {ScrollArea} from '~/components/ui/scroll-area';
import {SiteSearch} from '~/components/site-search';
import {Button, buttonVariants} from '~/components/ui/button';
import {useCartFetchers, useIsHydrated} from '~/hooks';
import {Sheet, SheetContent, SheetTrigger} from '~/components/ui/sheet';
import {Cart, Link, Icons, Drawer, useDrawer, CartLoading} from '~/components';

export function Header({title, menu}: {title: string; menu?: EnhancedMenu}) {
  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
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

      <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <MainNav title={title} menu={menu} />
          <MobileNav title={title} menu={menu} />
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <SiteSearch />
            </div>
            <nav className="flex items-center space-x-2">
              <AccountLink />
              <CartCount openCart={openCart} />
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}

function MainNav({menu, title}: {menu?: EnhancedMenu; title: string}) {
  return (
    <div className="mr-4 hidden md:flex">
      <Link
        to="/"
        prefetch="intent"
        className="mr-6 flex items-center space-x-2"
      >
        <Icons.Tailwind className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">{title}</span>
      </Link>

      <nav className="flex items-center space-x-6 text-sm font-medium">
        {(menu?.items || []).map((item) => (
          <Link
            key={item.id}
            to={item.to}
            target={item.target}
            prefetch="intent"
            className={({isActive}) =>
              cn(
                isActive ? 'text-foreground' : 'text-foreground/60',
                'transition-colors hover:text-foreground/80',
              )
            }
          >
            {item.title}
          </Link>
        ))}

        {/*<div className="flex flex-1 items-center justify-end gap-x-4">*/}
        {/*  <Search />*/}
        {/*  <Button*/}
        {/*    type="button"*/}
        {/*    size="sm"*/}
        {/*    variant="ghost"*/}
        {/*    className="rounded-full p-2"*/}
        {/*    onClick={() =>*/}
        {/*      setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK)*/}
        {/*    }*/}
        {/*  >*/}
        {/*    {theme === Theme.DARK ? (*/}
        {/*      <SunIcon className="h-6 w-6" />*/}
        {/*    ) : (*/}
        {/*      <MoonIcon className="h-6 w-6" />*/}
        {/*    )}*/}
        {/*  </Button>*/}
        {/*  <AccountLink className="relative flex h-8 w-8 items-center justify-center focus:ring-primary/5" />*/}
        {/*  <CartCount isHome={isHome} openCart={openCart} />*/}
        {/*</div>*/}
      </nav>
    </div>
  );
}

function MobileNav({menu, title}: {menu?: EnhancedMenu; title: string}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Icons.SidebarOpen className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent size="lg" position="left" className="pr-0">
        <MobileLink to="/" className="flex items-center" onOpenChange={setOpen}>
          <Icons.Tailwind className="mr-2 h-4 w-4" />
          <span className="font-bold">{title}</span>
        </MobileLink>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {(menu?.items || []).map((item) => (
              <MobileLink to={item.to} key={item.to} onOpenChange={setOpen}>
                {item.title}
              </MobileLink>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  to,
  children,
  className,
  onOpenChange,
  ...props
}: MobileLinkProps) {
  const navigate = useNavigate();
  return (
    <Link
      to={to}
      onClick={() => {
        navigate(to.toString());
        onOpenChange?.(false);
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
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

  return (
    <Link
      to={isLoggedIn ? '/account' : '/account/login'}
      prefetch="intent"
      className={({isActive}) =>
        cn(
          isActive ? 'text-foreground' : 'text-foreground/60',
          'transition-colors hover:text-foreground/80',
          className,
        )
      }
    >
      {isLoggedIn ? (
        <Avatar className="h-8 w-8">
          <Avatar.Image src="https://github.com/rjdmacedo.png" alt="@shadcn" />
          <Avatar.Fallback>RM</Avatar.Fallback>
        </Avatar>
      ) : (
        <Icons.User />
      )}
    </Link>
  );
}

function CartCount({openCart}: {openCart: () => void}) {
  const [root] = useMatches();

  return (
    <Suspense fallback={<CartBadge count={0} openCart={openCart} />}>
      <Await resolve={root.data?.cart}>
        {(cart) => (
          <CartBadge count={cart?.totalQuantity || 0} openCart={openCart} />
        )}
      </Await>
    </Suspense>
  );
}

function CartBadge({count, openCart}: {count: number; openCart: () => void}) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <>
        <Icons.ShoppingBag className="h-6 w-6" />
        <Badge className="absolute right-0 top-0 flex h-3 w-auto min-w-[0.75rem] items-center justify-center rounded-full px-[0.125rem] pb-px text-center text-[0.625rem] font-medium leading-none subpixel-antialiased">
          <span>{count || 0}</span>
        </Badge>
      </>
    ),
    [count],
  );

  return isHydrated ? (
    <Button
      size="sm"
      variant="ghost"
      onClick={openCart}
      className="relative flex w-9 px-0"
    >
      {BadgeCounter}
    </Button>
  ) : (
    <Link
      to="/cart"
      className={cn(
        buttonVariants({
          size: 'sm',
          variant: 'ghost',
        }),
        'relative flex w-9 px-0',
      )}
    >
      {BadgeCounter}
    </Link>
  );
}
