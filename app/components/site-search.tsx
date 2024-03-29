import {
  Form,
  useParams,
  useFetcher,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import * as React from 'react';
import {Theme, useTheme} from 'remix-themes';
import {type DialogProps} from '@radix-ui/react-alert-dialog';
import {flattenConnection} from '@shopify/hydrogen';
import {
  SunIcon,
  MoonIcon,
  ExitIcon,
  HomeIcon,
  EnterIcon,
  UpdateIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import {
  UserIcon,
  UserPlusIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

import {
  Input,
  Badge,
  Button,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandDialog,
  CommandLoading,
  CommandSeparator,
} from '~/components/ui';
import type {loader} from '~/routes/($locale).search';
import {useDebounce, useIsHydrated, usePrefixPathWithLocale} from '~/hooks';
import {cn, isDiscounted, isNewArrival} from '~/lib/utils';
import {useRootLoaderData} from '~/root';

export function SiteSearch({...props}: DialogProps) {
  const isHydrated = useIsHydrated();

  const Component = isHydrated ? SearchMenu : SearchForm;

  return <Component {...props} />;
}

function SearchForm() {
  const params = useParams();
  const [searchParams] = useSearchParams();

  return (
    <Form
      method="get"
      action={params.locale ? `/${params.locale}/search` : '/search'}
    >
      <label htmlFor="desktop-search" className="sr-only">
        Search
      </label>
      <nav className="flex items-center space-x-2">
        <Input
          id="desktop-search"
          name="q"
          type="search"
          suffix={
            <Button
              type="submit"
              variant="outline"
              className="h-6 w-6 bg-accent p-0 text-foreground/60 hover:text-foreground/80"
            >
              <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          }
          autoCorrect="off"
          placeholder="Search..."
          defaultValue={searchParams.get('q') || ''}
          autoComplete="off"
          autoCapitalize="off"
        />
      </nav>
    </Form>
  );
}

function SearchMenu({...props}: DialogProps) {
  const fetcher = useFetcher<typeof loader>();
  const rootData = useRootLoaderData();
  const navigate = useNavigate();
  const [theme, setTheme] = useTheme();

  // const locale = (rootData?.selectedLocale ?? DEFAULT_LOCALE).pathPrefix;

  const homePath = usePrefixPathWithLocale('/');
  const cartPath = usePrefixPathWithLocale('/cart');
  const loginPath = usePrefixPathWithLocale('/login');
  const logoutPath = usePrefixPathWithLocale('/logout');
  const profilePath = usePrefixPathWithLocale('/account/profile');
  const registerPath = usePrefixPathWithLocale('register');

  const loading = fetcher.state !== 'idle';

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  // const menu = rootData?.layout?.header;
  const isLoggedIn: boolean = rootData?.isLoggedIn;

  const products = flattenConnection(fetcher.data?.products) || [];

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const search = useDebounce((value: HTMLInputElement['value']) => {
    fetcher.load(`/search?q=${value}`);
  }, 500);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  React.useEffect(() => {
    if (query) {
      search(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          'relative h-9 w-full justify-start rounded-md text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64',
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="inline-flex lg:hidden">Search...</span>
        <span className="hidden lg:inline-flex">Search something...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search..."
        />

        <CommandList className="relative">
          {loading && (
            <CommandLoading progress={50}>
              <div className="absolute right-4 top-2">
                <UpdateIcon className="h-4 w-4 animate-spin" />
              </div>
            </CommandLoading>
          )}

          <div className="flex items-center justify-center">
            <CommandEmpty>No results found.</CommandEmpty>
          </div>

          <CommandGroup heading="Pages" value="pages-group">
            <CommandItem
              value="home"
              onSelect={() => runCommand(() => navigate(homePath))}
            >
              <HomeIcon className="mr-2 h-4 w-4" />
              Home
            </CommandItem>
            <CommandItem
              value="cart"
              onSelect={() => runCommand(() => navigate(cartPath))}
            >
              <ShoppingBagIcon className="mr-2 h-4 w-4" />
              Cart
            </CommandItem>
            {isLoggedIn && (
              <CommandItem
                value="account"
                onSelect={() => runCommand(() => navigate(profilePath))}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span>My Account</span>
              </CommandItem>
            )}
            {/**
              (menu?.items || []).map((item) => (
              <CommandItem
                key={item.id}
                value={item.id}
                onSelect={() =>
                  runCommand(() => item.url && navigate(locale + item.to))
                }
              >
                <CursorArrowRippleIcon className="mr-2 h-4 w-4" />
                {item.title}
              </CommandItem>
            ))
             */}
          </CommandGroup>

          <CommandSeparator className="my-2" />

          <CommandGroup heading="Actions" value="actions-group">
            {isLoggedIn ? (
              <CommandItem
                value="logout"
                onSelect={() =>
                  runCommand(() =>
                    fetcher.submit(null, {
                      method: 'post',
                      action: logoutPath,
                    }),
                  )
                }
              >
                <ExitIcon className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </CommandItem>
            ) : (
              <>
                <CommandItem
                  value="login"
                  onSelect={() => runCommand(() => navigate(loginPath))}
                >
                  <EnterIcon className="mr-2 h-4 w-4" />
                  <span>Sign In</span>
                </CommandItem>
                <CommandItem
                  value="register"
                  onSelect={() => runCommand(() => navigate(registerPath))}
                >
                  <UserPlusIcon className="mr-2 h-4 w-4" />
                  <span>Register</span>
                </CommandItem>
              </>
            )}
            {theme === Theme.DARK ? (
              <CommandItem
                value="light"
                onSelect={() => runCommand(() => setTheme(Theme.LIGHT))}
              >
                <SunIcon className="mr-2 h-4 w-4" />
                <span>Light</span>
              </CommandItem>
            ) : (
              <CommandItem
                value="dark"
                onSelect={() => runCommand(() => setTheme(Theme.DARK))}
              >
                <MoonIcon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </CommandItem>
            )}
          </CommandGroup>

          <CommandSeparator
            hidden={!query || products.length === 0}
            className="my-2"
            alwaysRender
          />

          {query && products.length > 0 && (
            <CommandGroup heading="Products" value="products-group">
              {products.map((product) => {
                const variant = product.variants.nodes[0];

                let cardLabel: string | undefined;
                if (
                  isDiscounted(
                    variant.price as MoneyV2,
                    variant.compareAtPrice as MoneyV2,
                  )
                ) {
                  cardLabel = 'Sale';
                } else if (isNewArrival(product.publishedAt)) {
                  cardLabel = 'New';
                }

                return (
                  <CommandItem
                    key={product.id}
                    value={product.handle}
                    className="flex justify-between"
                    onSelect={() =>
                      runCommand(() => navigate(`/products/${product.handle}`))
                    }
                  >
                    <span>{product.title}</span>
                    {cardLabel && <Badge variant="outline">{cardLabel}</Badge>}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
