import {
  Await,
  useFetcher,
  useNavigate,
  useLocation,
  type LinkProps,
} from '@remix-run/react';
import React from 'react';
import {Disclosure} from '@headlessui/react';
import {HamburgerMenuIcon} from '@radix-ui/react-icons';
import {ShoppingBagIcon, UserIcon} from '@heroicons/react/24/outline';

import {
  Link,
  Section,
  Heading,
  IconCaret,
  useDrawer,
  SiteSearch,
  CountrySelector,
} from '~/components';
import {
  Icons,
  Sheet,
  Badge,
  Button,
  Avatar,
  ScrollArea,
  SheetContent,
  SheetTrigger,
  AvatarFallback,
  buttonVariants,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '~/components/ui';
import {cn, type EnhancedMenu, type ChildEnhancedMenuItem} from '~/lib/utils';
import {
  useIsHydrated,
  useCartFetchers,
  useIsHomePath,
  usePrefixPathWithLocale,
} from '~/hooks';
import {type LayoutQuery} from 'storefrontapi.generated';
import {useRootLoaderData} from '~/root';

type LayoutProps = {
  children: React.ReactNode;
  layout: LayoutQuery & {
    header?: EnhancedMenu | null;
    footer?: EnhancedMenu | null;
  };
};

export function Layout({children, layout}: LayoutProps) {
  const {shop, header, footer} = layout;

  return (
    <>
      <div className="relative flex min-h-screen flex-col">
        <a href="#main-content" className="sr-only">
          Skip to content
        </a>

        {header && <Header title={shop.name} menu={header} />}

        <div role="main" id="main-content">
          {children}
        </div>
      </div>

      {footer && <Footer menu={footer} />}
    </>
  );
}

function Header({title, menu}: {title: string; menu?: EnhancedMenu}) {
  const {isOpen: isCartDrawerOpen, openDrawer: openCartDrawer} = useDrawer();

  const addToCartFetchers = useCartFetchers('ADD_TO_CART');

  // toggle cart drawer when adding to cart
  React.useEffect(() => {
    if (isCartDrawerOpen || !addToCartFetchers.length) return;
    openCartDrawer();
  }, [addToCartFetchers, isCartDrawerOpen, openCartDrawer]);

  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-nav items-center">
        <MainNav title={title} menu={menu} />
        <MobileNav title={title} menu={menu} />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <SiteSearch />
          </div>
          <nav className="flex items-center space-x-2">
            <AccountLink />
            <CartCount openCartDrawer={openCartDrawer} />
          </nav>
        </div>
      </div>
    </header>
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
                isActive
                  ? 'text-foreground'
                  : 'text-foreground/60 hover:text-foreground/80',
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
          size="icon"
          variant="ghost"
          className={cn(
            'mr-2 flex text-foreground/60 hover:text-foreground/80 md:hidden',
          )}
        >
          <HamburgerMenuIcon className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="pr-0" side="left">
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
  children: React.ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
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
      className={({isActive}) =>
        cn(
          isActive
            ? 'text-foreground'
            : 'text-foreground/60 hover:text-foreground/80',
          className,
        )
      }
      {...props}
    >
      {children}
    </Link>
  );
}

function AvatarMenu() {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const getAccountPath = (
    path: 'profile' | 'security' | 'addresses' | 'orders',
  ) => usePrefixPathWithLocale(`/account/${path}`);

  const logoutPath = usePrefixPathWithLocale('/logout');
  const [profilePath, securityPath, addressesPath, ordersPath] = (
    ['profile', 'security', 'addresses', 'orders'] as const
  ).map(getAccountPath);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <Avatar className="h-8 w-8">
            <AvatarFallback>RM</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent loop>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => navigate(profilePath)}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate(ordersPath)}>
            Orders
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate(securityPath)}>
            Security
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate(addressesPath)}>
            Addresses
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() =>
            fetcher.submit(null, {
              method: 'post',
              action: logoutPath,
            })
          }
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AccountLink({className}: {className?: string}) {
  const rootData = useRootLoaderData();
  const isLoggedIn = rootData?.isLoggedIn;

  return isLoggedIn ? (
    <AvatarMenu />
  ) : (
    <Link
      to="/login"
      prefetch="intent"
      className={({isActive}) =>
        cn(
          buttonVariants({variant: 'ghost', size: 'icon'}),
          isActive
            ? 'text-foreground'
            : 'text-foreground/60 hover:text-foreground/80',
          className,
        )
      }
    >
      <UserIcon className="h-6 w-6" />
    </Link>
  );
}

function CartCount({openCartDrawer}: {openCartDrawer: () => void}) {
  const rootData = useRootLoaderData();

  return (
    <React.Suspense
      fallback={<CartBadge count={0} openCartDrawer={openCartDrawer} />}
    >
      <Await resolve={rootData?.cart}>
        {(cart) => (
          <CartBadge
            count={cart?.totalQuantity || 0}
            openCartDrawer={openCartDrawer}
          />
        )}
      </Await>
    </React.Suspense>
  );
}

function CartBadge({
  count,
  openCartDrawer,
}: {
  count: number;
  openCartDrawer: () => void;
}) {
  const location = useLocation();
  const isHydrated = useIsHydrated();

  const BadgeCounter = React.useMemo(
    () => (
      <>
        <ShoppingBagIcon className="h-6 w-6" />
        {count > 0 && (
          <Badge
            className={cn(
              'absolute -top-1 h-4 w-4 justify-center rounded-full border text-xs',
              count > 9 ? '-right-2.5 px-3' : '-right-1 p-0',
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
      size="icon"
      variant="ghost"
      onClick={openCartDrawer}
      className={cn(
        location.pathname === '/cart'
          ? 'text-foreground'
          : 'text-foreground/60 hover:text-foreground/80',
        'relative flex',
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
          buttonVariants({variant: 'ghost', size: 'icon'}),
          'relative flex',
          isActive
            ? 'text-foreground'
            : 'text-foreground/60 hover:text-foreground/80',
        )
      }
    >
      {BadgeCounter}
    </Link>
  );
}

function Footer({menu}: {menu?: EnhancedMenu}) {
  const isHome = useIsHomePath();

  const itemsCount = menu
    ? menu?.items?.length + 1 > 4
      ? 4
      : menu?.items?.length + 1
    : [];

  return (
    <Section
      divider={isHome ? 'none' : 'top'}
      as="footer"
      role="contentinfo"
      className={`grid min-h-[25rem] w-full grid-flow-row grid-cols-1 items-start gap-6 px-6 py-8 md:grid-cols-2 md:gap-8 md:px-8 lg:gap-12 lg:px-12 lg:grid-cols-${itemsCount}`}
    >
      <FooterMenu menu={menu} />
      <CountrySelector />
      <div
        className={`self-end pt-8 opacity-50 md:col-span-2 lg:col-span-${itemsCount}`}
      >
        &copy; {new Date().getFullYear()} / Shopify, Inc. Hydrogen is an MIT
        Licensed Open Source project.
      </div>
    </Section>
  );
}

function FooterLink({item}: {item: ChildEnhancedMenuItem}) {
  if (item.to.startsWith('http')) {
    return (
      <a href={item.to} target={item.target} rel="noopener noreferrer">
        {item.title}
      </a>
    );
  }

  return (
    <Link to={item.to} target={item.target} prefetch="intent">
      {item.title}
    </Link>
  );
}

function FooterMenu({menu}: {menu?: EnhancedMenu}) {
  const styles = {
    nav: 'grid gap-2 pb-6',
    section: 'grid gap-4',
  };

  return (
    <>
      {(menu?.items || []).map((item) => (
        <section key={item.id} className={styles.section}>
          <Disclosure>
            {({open}) => (
              <>
                <Disclosure.Button className="text-left md:cursor-default">
                  <Heading className="flex justify-between" size="lead" as="h3">
                    {item.title}
                    {item?.items?.length > 0 && (
                      <span className="md:hidden">
                        <IconCaret direction={open ? 'up' : 'down'} />
                      </span>
                    )}
                  </Heading>
                </Disclosure.Button>
                {item?.items?.length > 0 ? (
                  <div
                    className={`${
                      open ? `h-fit max-h-48` : `max-h-0 md:max-h-fit`
                    } overflow-hidden transition-all duration-300`}
                  >
                    <React.Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop">
                      <Disclosure.Panel static>
                        <nav className={styles.nav}>
                          {item.items.map((subItem: ChildEnhancedMenuItem) => (
                            <FooterLink key={subItem.id} item={subItem} />
                          ))}
                        </nav>
                      </Disclosure.Panel>
                    </React.Suspense>
                  </div>
                ) : null}
              </>
            )}
          </Disclosure>
        </section>
      ))}
    </>
  );
}
