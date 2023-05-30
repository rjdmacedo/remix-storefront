import {useFetcher, useLocation, useMatches} from '@remix-run/react';
import {Heading} from '~/components';
import React, {Fragment, useEffect, useRef, useState} from 'react';
import {useInView} from 'react-intersection-observer';
import {Localizations, Locale, CartAction} from '~/lib/type';
import {DEFAULT_LOCALE} from '~/lib/utils';
import clsx from 'clsx';
import {Listbox, Transition} from '@headlessui/react';
import {CheckIcon, ChevronUpDownIcon} from '@heroicons/react/24/outline';

export function CountrySelector() {
  const [root] = useMatches();
  const fetcher = useFetcher();
  const selectedLocale = root.data?.selectedLocale ?? DEFAULT_LOCALE;
  const {pathname, search} = useLocation();
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

  // Get the available countries list when in view
  useEffect(() => {
    if (!inView || fetcher.data || fetcher.state === 'loading') return;
    fetcher.load('/api/countries');
  }, [inView, fetcher]);

  const updateLocale = (locale: Locale) => {
    const countryUrlPath = getCountryUrlPath({
      locale,
      pathWithoutLocale,
      defaultLocalePrefix,
    });

    fetcher.submit(
      {
        cartAction: CartAction.UPDATE_BUYER_IDENTITY,
        buyerIdentity: JSON.stringify({
          countryCode: locale.country,
        }),
        redirectTo: countryUrlPath,
      },
      {
        method: 'post',
        action: '/cart',
      },
    );
  };

  return (
    <section ref={observerRef} className="grid w-full gap-4">
      <Listbox value={selectedLocale} onChange={updateLocale} by="label">
        <Listbox.Label as={Fragment}>
          <Heading size="lead" className="cursor-default" as="h3">
            Country
          </Heading>
        </Listbox.Label>

        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-md py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-primary focus:outline-none focus:ring-2 sm:text-sm sm:leading-6">
            <span className="block truncate">{selectedLocale.label}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-md py-1 shadow-lg ring-1 ring-primary focus:outline-none sm:text-sm">
              {countries &&
                Object.keys(countries).map((countryPath) => {
                  const locale: Locale = countries[countryPath];

                  return (
                    <Listbox.Option
                      key={countryPath}
                      value={locale}
                      className={({active}) =>
                        clsx(
                          active ? 'bg-primary text-contrast' : 'text-primary',
                          'relative cursor-default select-none py-2 pl-3 pr-9',
                        )
                      }
                    >
                      {({selected, active}) => (
                        <>
                          <span
                            className={clsx(
                              selected ? 'font-semibold' : 'font-normal',
                              'block truncate',
                            )}
                          >
                            {locale.label}
                          </span>

                          {selected ? (
                            <span
                              className={clsx(
                                active ? 'text-contrast' : 'text-success',
                                'absolute inset-y-0 right-0 flex items-center pr-4',
                              )}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  );
                })}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </section>
  );
}

function getCountryUrlPath({
  locale,
  pathWithoutLocale,
  defaultLocalePrefix,
}: {
  locale: Locale;
  pathWithoutLocale: string;
  defaultLocalePrefix: string;
}) {
  let countryPrefixPath = '';
  const countryLocalePrefix = `${locale.language}-${locale.country}`;

  if (countryLocalePrefix !== defaultLocalePrefix) {
    countryPrefixPath = `/${countryLocalePrefix.toLowerCase()}`;
  }
  return `${countryPrefixPath}${pathWithoutLocale}`;
}
