import {CartForm} from '@shopify/hydrogen';
import {useInView} from 'react-intersection-observer';
import React, {useEffect, useRef} from 'react';
import type {CartBuyerIdentityInput} from '@shopify/hydrogen/storefront-api-types';
import {useFetcher, useLocation, useMatches} from '@remix-run/react';

import {
  Icons,
  Label,
  Button,
  Select,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from '~/components/ui';
import {cn, DEFAULT_LOCALE} from '~/lib/utils';
import type {Localizations, Locale, I18nLocale} from '~/lib/type';
import {Heading} from '~/components/Text';

export function CountrySelector() {
  const [root] = useMatches();
  const fetcher = useFetcher();
  const {pathname, search} = useLocation();

  const selectedLocale =
    (root.data?.selectedLocale as I18nLocale) ?? DEFAULT_LOCALE;

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

      <Select>
        <SelectTrigger id="countries-select">
          <SelectValue placeholder={selectedLocale?.label} />
        </SelectTrigger>
        <SelectContent className="max-h-48" position="popper" sideOffset={5}>
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
                <Country
                  key={countryLocale.country}
                  isSelected={isSelected}
                  countryLocale={countryLocale}
                  countryUrlPath={countryUrlPath}
                />
              );
            })}
        </SelectContent>
      </Select>
    </section>
  );
}

function Country({
  isSelected,
  countryLocale,
  countryUrlPath,
}: {
  isSelected: boolean;
  countryLocale: Locale;
  countryUrlPath: string;
}) {
  return (
    <ChangeLocaleForm
      key={countryLocale.country}
      redirectTo={countryUrlPath}
      buyerIdentity={{countryCode: countryLocale.country}}
    >
      <Button
        type="submit"
        variant="ghost"
        className={cn(
          'flex w-full justify-between',
          isSelected && 'bg-primary-foreground',
        )}
      >
        {countryLocale.label}
        {isSelected && <Icons.Check className="h-4 w-4 text-blue-500" />}
      </Button>
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
