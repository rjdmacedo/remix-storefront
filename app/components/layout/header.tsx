import React, {Suspense, useEffect, useMemo} from 'react';
import {
  Await,
  useMatches,
  useNavigate,
  type LinkProps,
  useLocation,
} from '@remix-run/react';

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
        className={cn(
          buttonVariants({variant: 'link'}),
          'mr-6 flex items-center space-x-2',
        )}
      >
        <Icons.Tailwind className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">{title}</span>
      </Link>

      <nav className="flex items-center space-x-2 text-sm font-medium">
        {(menu?.items || []).map((item) => (
          <Link
            key={item.id}
            to={item.to}
            target={item.target}
            prefetch="intent"
            className={({isActive}) =>
              cn(
                buttonVariants({variant: 'link'}),
                isActive ? 'bg-accent text-foreground' : 'text-foreground/60',
                'transition-colors hover:text-foreground/80',
              )
            }
          >
            {item.title}
          </Link>
        ))}
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
          size="sm"
          variant="outline"
          className={cn(
            'mr-2 flex h-9 w-9 px-0 text-foreground/60 hover:text-foreground/80 md:hidden',
          )}
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
          buttonVariants({variant: 'outline'}),
          isActive ? 'bg-accent text-foreground' : 'text-foreground/60',
          'flex h-9 w-9 px-0 hover:text-foreground/80',
          className,
        )
      }
    >
      {isLoggedIn ? (
        <Avatar className="h-6 w-6">
          <Avatar.Image
            src="https://github.com/rjdmacedo.png"
            alt="@rjdmacedo"
          />
          <Avatar.Fallback>RM</Avatar.Fallback>
        </Avatar>
      ) : (
        <Icons.User className="h-6 w-6" />
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
  const {pathname} = useLocation();

  const BadgeCounter = useMemo(
    () => (
      <>
        <Icons.ShoppingBag className="h-6 w-6" />
        {count > 0 && (
          <Badge
            className={cn(
              'absolute -top-2 h-4 w-4 text-xs',
              count > 9 ? '-right-3.5 px-3' : '-right-2 p-0',
            )}
          >
            {count > 9 ? '9+' : count}
          </Badge>
        )}
      </>
    ),
    [count],
  );

  return isHydrated ? (
    <Button
      size="sm"
      variant="outline"
      onClick={openCart}
      className={cn(
        pathname === '/cart'
          ? 'bg-accent text-foreground'
          : 'text-foreground/60',
        'relative flex h-9 w-9 px-0 hover:text-foreground/80',
      )}
    >
      {BadgeCounter}
    </Button>
  ) : (
    <Link
      to="/cart"
      prefetch="intent"
      className={({isActive}) =>
        cn(
          buttonVariants({variant: 'outline'}),
          isActive ? 'bg-accent text-foreground' : 'text-foreground/60',
          'relative flex h-9 w-9 px-0 hover:text-foreground/80',
        )
      }
    >
      {BadgeCounter}
    </Link>
  );
}
