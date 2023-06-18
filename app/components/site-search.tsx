import * as React from 'react';
import {Theme, useTheme} from 'remix-themes';
import {type DialogProps} from '@radix-ui/react-alert-dialog';
import {
  Form,
  useFetcher,
  useMatches,
  useNavigate,
  useParams,
} from '@remix-run/react';

import {
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandDialog,
  CommandSeparator,
} from '~/components/ui/command';
import {cn, isDiscounted, isNewArrival} from '~/lib/utils';
import {Icons} from '~/components/icons';
import {Input} from '~/components/ui/input';
import {Button} from '~/components/ui/button';
import {useIsHydrated} from '~/hooks';
import {type LayoutData} from '~/root';
import {loader} from '~/routes/($locale)+/api+/search';
import {Product} from '@shopify/hydrogen/storefront-api-types';
import {flattenConnection, Image} from '@shopify/hydrogen';
import {MoneyV2} from '@shopify/hydrogen/dist/storefront-api-types';

export function SiteSearch({...props}: DialogProps) {
  const isHydrated = useIsHydrated();

  const Component = isHydrated ? SearchMenu : SearchForm;

  return <Component {...props} />;
}

function SearchForm() {
  const params = useParams();

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
          className="block"
          placeholder="Search"
        />
        <Button
          size="sm"
          type="submit"
          variant="ghost"
          className="flex w-9 flex-shrink-0 px-0"
        >
          <Icons.Search className="h-6 w-6" aria-hidden="true" />
        </Button>
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
  const [products, setProducts] = React.useState<Product[]>([]);

  const menu: LayoutData['headerMenu'] = root.data?.layout?.headerMenu;
  const isLoggedIn: boolean = root.data?.isLoggedIn;

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
    if (!open) {
      setProducts([]);
    }
  }, [open]);

  React.useEffect(() => {
    if (fetcher.data?.products) {
      setProducts(fetcher.data.products);
    }
  }, [fetcher.data]);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const search = (value: HTMLInputElement['value']) => {
    if (value.length < 3) {
      setProducts([]);
      return;
    }

    fetcher.load(`/api/search?q=${value}`);
  };

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
          onInput={(e) => search(e.currentTarget.value)}
          placeholder="Search..."
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

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

          <CommandGroup heading="Navigate to">
            <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
              <Icons.Home className="mr-2 h-4 w-4" />
              Home
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  navigate(isLoggedIn ? '/account' : '/account/login'),
                )
              }
            >
              <Icons.User className="mr-2 h-4 w-4" />
              {isLoggedIn ? 'My Account' : 'Sign In'}
            </CommandItem>

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

          <CommandSeparator />

          <CommandGroup heading="Theme">
            {theme === Theme.DARK ? (
              <CommandItem
                onSelect={() => runCommand(() => setTheme(Theme.LIGHT))}
              >
                <Icons.SunMedium className="mr-2 h-4 w-4" />
                Light
              </CommandItem>
            ) : (
              <CommandItem
                onSelect={() => runCommand(() => setTheme(Theme.DARK))}
              >
                <Icons.Moon className="mr-2 h-4 w-4" />
                Dark
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
