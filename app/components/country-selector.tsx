import {CartForm} from '@shopify/hydrogen';
import {useInView} from 'react-intersection-observer';
import React, {useEffect, useRef} from 'react';
import type {CartBuyerIdentityInput} from '@shopify/hydrogen/storefront-api-types';
import {useFetcher, useLocation} from '@remix-run/react';

import {
  Icons,
  Label,
  Button,
  Popover,
  Command,
  CommandItem,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  PopoverTrigger,
  PopoverContent,
  CommandList,
} from '~/components/ui';
import {cn, DEFAULT_LOCALE} from '~/lib/utils';
import type {Localizations, Locale} from '~/lib/type';
import {Heading} from '~/components/Text';
import {useRootLoaderData} from '~/root';
import {CaretSortIcon} from '@radix-ui/react-icons';

export function CountrySelector() {
  const fetcher = useFetcher();
  const rootData = useRootLoaderData();
  const [open, setOpen] = React.useState(false);
  const {search, pathname} = useLocation();

  const selectedLocale = rootData.selectedLocale ?? DEFAULT_LOCALE;

  const pathWithoutLocale = `${pathname.replace(
    selectedLocale.pathPrefix,
    '',
  )}${search}`;

  const countries = (fetcher.data ?? {}) as Localizations;
  const defaultLocale = countries?.['default'];
  const defaultLocalePrefix = defaultLocale
    ? `${defaultLocale?.language}-${defaultLocale?.country}`
    : '';

  const {ref, inView} = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  const observerRef = useRef(null);
  useEffect(() => {
    ref(observerRef.current);
  }, [ref, observerRef]);

  // Get available countries list when in view
  useEffect(() => {
    if (!inView || fetcher.data || fetcher.state === 'loading') return;
    fetcher.load('/api/countries');
  }, [inView, fetcher]);

  return (
    <section ref={observerRef} className="grid w-full gap-4">
      <Label htmlFor="countries-select">
        <Heading size="lead" className="cursor-default" as="h3">
          Country
        </Heading>
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger id="countries-select" asChild>
          <Button
            role="combobox"
            variant="outline"
            className="w-[200px] justify-between"
            aria-expanded={open}
          >
            {selectedLocale.label}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="max-h-48 overflow-auto w-[200px] p-0"
          defaultValue={selectedLocale.label}
        >
          <Command>
            <CommandInput placeholder="Search country..." className="h-9" />
            <CommandList>
              <CommandEmpty>No countries found.</CommandEmpty>
              <CommandGroup>
                {countries &&
                  Object.keys(countries).map((countryPath) => {
                    const countryLocale = countries[countryPath];
                    const isSelected =
                      countryLocale.language === selectedLocale.language &&
                      countryLocale.country === selectedLocale.country;

                    const countryUrlPath = getCountryUrlPath({
                      countryLocale,
                      defaultLocalePrefix,
                      pathWithoutLocale,
                    });

                    return (
                      <CommandItem
                        key={countryLocale.country}
                        value={countryLocale.label}
                        className={cn({
                          'bg-primary': isSelected,
                        })}
                      >
                        <Country
                          countryLocale={countryLocale}
                          countryUrlPath={countryUrlPath}
                        />
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </section>
  );
}

function Country({
  countryLocale,
  countryUrlPath,
}: {
  countryLocale: Locale;
  countryUrlPath: string;
}) {
  return (
    <ChangeLocaleForm
      key={countryLocale.country}
      redirectTo={countryUrlPath}
      buyerIdentity={{countryCode: countryLocale.country}}
    >
      <button type="submit" className="flex w-full justify-between p-0">
        {countryLocale.label}
      </button>
    </ChangeLocaleForm>
  );
}

function ChangeLocaleForm({
  children,
  redirectTo,
  buyerIdentity,
}: {
  children: React.ReactNode;
  redirectTo: string;
  buyerIdentity: CartBuyerIdentityInput;
}) {
  return (
    <CartForm
      route="/cart"
      inputs={{buyerIdentity}}
      action={CartForm.ACTIONS.BuyerIdentityUpdate}
    >
      <>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        {children}
      </>
    </CartForm>
  );
}

function getCountryUrlPath({
  countryLocale,
  defaultLocalePrefix,
  pathWithoutLocale,
}: {
  countryLocale: Locale;
  pathWithoutLocale: string;
  defaultLocalePrefix: string;
}) {
  let countryPrefixPath = '';
  const countryLocalePrefix = `${countryLocale.language}-${countryLocale.country}`;

  if (countryLocalePrefix !== defaultLocalePrefix) {
    countryPrefixPath = `/${countryLocalePrefix.toLowerCase()}`;
  }
  return `${countryPrefixPath}${pathWithoutLocale}`;
}
