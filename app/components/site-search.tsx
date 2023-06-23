import * as React from 'react';
import {Theme, useTheme} from 'remix-themes';
import {type DialogProps} from '@radix-ui/react-alert-dialog';
import {
  Form,
  useParams,
  useFetcher,
  useMatches,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import {flattenConnection} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/dist/storefront-api-types';

import {
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandDialog,
  CommandSeparator,
  CommandLoading,
} from '~/components/ui/command';
import {cn, isDiscounted, isNewArrival} from '~/lib/utils';
import {Icons} from '~/components/icons';
import {Input} from '~/components/ui/input';
import {Button} from '~/components/ui/button';
import {type loader} from '~/routes/($locale)+/api+/search';
import {type LayoutData} from '~/root';
import {useDebounce, useIsHydrated} from '~/hooks';

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
              <Icons.Search className="h-4 w-4" aria-hidden="true" />
            </Button>
          }
          className="block"
          autoCorrect="off"
          placeholder="Search"
          defaultValue={searchParams.get('q') || ''}
          autoComplete="off"
          autoCapitalize="off"
        />
      </nav>
    </Form>
  );
}

function SearchMenu({...props}: DialogProps) {
  const [root] = useMatches();
  const fetcher = useFetcher<typeof loader>();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [theme, setTheme] = useTheme();
  const menu: LayoutData['headerMenu'] = root.data?.layout?.headerMenu;
  const isLoggedIn: boolean = root.data?.isLoggedIn;

  const products = fetcher.data?.products || [];

  const loading = fetcher.state !== 'idle';

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

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const search = useDebounce(
    (value: HTMLInputElement['value']) =>
      fetcher.load(`/api/search?q=${value}`),
    500,
  );

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          'relative h-9 w-full justify-start rounded-[0.5rem] text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64',
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden lg:inline-flex">Search something...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          onValueChange={(value) => search(value)}
          placeholder="Search..."
        />
        <CommandList>
          {loading && (
            <CommandLoading progress={50}>
              <div className="flex items-center justify-center py-5">
                <span>Loading products…</span>
                <Icons.Loader className="ml-2 h-4 w-4 animate-spin" />
              </div>
            </CommandLoading>
          )}

          <CommandEmpty hidden={loading}>No results found.</CommandEmpty>

          {products.length > 0 && (
            <CommandGroup heading="Products">
              {products.map((product) => {
                const variant = flattenConnection(product.variants)[0];

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
                    value={product.title}
                    onSelect={() =>
                      runCommand(() => navigate(`/product/${product.handle}`))
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span>{product.title}</span>
                      <span>{cardLabel}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          <CommandSeparator />

          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
              <Icons.Home className="mr-2 h-4 w-4" />
              Home
            </CommandItem>
            {isLoggedIn && (
              <CommandItem
                onSelect={() => runCommand(() => navigate('/account'))}
              >
                <Icons.User className="mr-2 h-4 w-4" />
                <span>My Account</span>
              </CommandItem>
            )}
            {(menu.items || []).map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => runCommand(() => navigate(item.to))}
              >
                <Icons.AppWindow className="mr-2 h-4 w-4" />
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Actions">
            {isLoggedIn ? (
              <CommandItem onSelect={() => runCommand(() => alert('tbd'))}>
                <Icons.LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </CommandItem>
            ) : (
              <>
                <CommandItem
                  onSelect={() => runCommand(() => navigate('/account/login'))}
                >
                  <Icons.LogIn className="mr-2 h-4 w-4" />
                  <span>Sign In</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runCommand(() => navigate('/account/register'))
                  }
                >
                  <Icons.UserPlus className="mr-2 h-4 w-4" />
                  <span>Register</span>
                </CommandItem>
              </>
            )}
            {theme === Theme.DARK ? (
              <CommandItem
                onSelect={() => runCommand(() => setTheme(Theme.LIGHT))}
              >
                <Icons.SunMedium className="mr-2 h-4 w-4" />
                <span>Light</span>
              </CommandItem>
            ) : (
              <CommandItem
                onSelect={() => runCommand(() => setTheme(Theme.DARK))}
              >
                <Icons.Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
