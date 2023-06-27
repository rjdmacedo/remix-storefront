import {
  CheckIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import {useDebounce} from 'react-use';
import type {Location} from '@remix-run/react';
import type {Filter, FilterType} from '@shopify/hydrogen/storefront-api-types';
import React, {useMemo, useState} from 'react';
import {useLocation, useNavigate, useSearchParams} from '@remix-run/react';

import {
  Badge,
  Button,
  Typography,
  Collapsible,
  DropdownMenu,
  buttonVariants,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '~/components/ui';
import {IconCaret, Link} from '~/components';
import {cn} from '~/lib/utils';

export type AppliedFilter = {
  label: string;
  urlParam: {
    key: string;
    value: string;
  };
};

export type SortParam =
  | 'newest'
  | 'featured'
  | 'best-selling'
  | 'price-low-high'
  | 'price-high-low';

type SortFilterProps = {
  filters: Filter[];
  children: React.ReactNode;
  collections?: Array<{handle: string; title: string}>;
  appliedFilters?: AppliedFilter[];
};

export function SortFilter({
  filters,
  children,
  collections = [],
  appliedFilters = [],
}: SortFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <Button
          size="icon"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          variant="ghost"
          className={
            'relative flex h-8 w-8 items-center justify-center focus:ring-primary/5'
          }
        >
          <AdjustmentsHorizontalIcon className="h-6 w-6" aria-hidden="true" />
        </Button>
        <SortMenu />
      </div>
      <div className="flex flex-col flex-wrap md:flex-row">
        <div
          className={`transition-all duration-200 ${
            isOpen
              ? 'max-h-full min-w-full opacity-100 md:w-[240px] md:min-w-[240px] md:pr-8'
              : 'max-h-0 pr-0 opacity-0 md:max-h-full md:w-[0px] md:min-w-[0px]'
          }`}
        >
          <FilterDrawer
            filters={filters}
            collections={collections}
            appliedFilters={appliedFilters}
          />
        </div>

        <div className="flex-1">{children}</div>
      </div>
    </>
  );
}

function FilterCollapsible({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="py-2">
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between">
          {label}
          <Button variant="ghost" size="xs" className="h-6 w-6 p-0">
            <IconCaret direction={open ? 'up' : 'down'} />
          </Button>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function FilterDrawer({
  filters = [],
  collections = [],
  appliedFilters = [],
}: Omit<SortFilterProps, 'children'>) {
  const [params] = useSearchParams();
  const location = useLocation();

  const filterMarkup = (filter: Filter, option: Filter['values'][number]) => {
    switch (filter.type) {
      case 'PRICE_RANGE':
        const min =
          params.has('minPrice') && !isNaN(Number(params.get('minPrice')))
            ? Number(params.get('minPrice'))
            : undefined;

        const max =
          params.has('maxPrice') && !isNaN(Number(params.get('maxPrice')))
            ? Number(params.get('maxPrice'))
            : undefined;

        return <PriceRangeFilter min={min} max={max} />;

      default:
        const to = getFilterLink(
          filter,
          option.input as string,
          params,
          location,
        );

        return (
          <Link
            to={to}
            prefetch="intent"
            className={cn(buttonVariants({variant: 'link'}))}
          >
            {option.label}
          </Link>
        );
    }
  };

  const filtersMarkup = useMemo(
    () =>
      filters.map(
        (filter: Filter) =>
          filter.values.length > 1 && (
            <FilterCollapsible key={filter.label} label={filter.label}>
              <ul key={filter.id} className="py-2">
                {filter.values?.map((option) => (
                  <li key={option.id}>{filterMarkup(filter, option)}</li>
                ))}
              </ul>
            </FilterCollapsible>
          ),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters],
  );

  const collectionsMarkup = useMemo(
    () =>
      collections.map((collection) => (
        <ul key={collection.handle} className="py-2">
          <li key={collection.handle}>
            <Link
              to={`/collections/${collection.handle}`}
              key={collection.handle}
              prefetch="intent"
              className={({isActive}) =>
                cn(
                  buttonVariants({variant: 'link'}),
                  isActive ? 'text-foreground' : 'text-foreground/60',
                  'flex items-center justify-between p-0',
                )
              }
            >
              {collection.title}
              {location.pathname.includes(collection.handle) && (
                <CheckIcon className="h-4 w-4" />
              )}
            </Link>
          </li>
        </ul>
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collections],
  );

  return (
    <>
      <nav className="space-y-8">
        {appliedFilters.length > 0 ? (
          <div className="pb-8">
            <AppliedFilters filters={appliedFilters} />
          </div>
        ) : null}

        <div>
          <Typography.Title as="h4" size="lg" spacing="wider" className="mb-2">
            Filter By
          </Typography.Title>

          {filtersMarkup.length > 0 ? (
            <div className="divide-y">{filtersMarkup}</div>
          ) : (
            <Typography.Title>No filters available</Typography.Title>
          )}
        </div>

        <div>
          <Typography.Title as="h4" size="lg" spacing="wider" className="mb-2">
            Collections
          </Typography.Title>

          {collectionsMarkup.length > 0 ? (
            <div className="divide-y">{collectionsMarkup}</div>
          ) : (
            <Typography.Title>No collections available</Typography.Title>
          )}
        </div>
      </nav>
    </>
  );
}

function AppliedFilters({filters = []}: {filters: AppliedFilter[]}) {
  const location = useLocation();
  const [params] = useSearchParams();

  return (
    <>
      <Typography.Title as="h4" size="lg" className="pb-4">
        Applied filters
      </Typography.Title>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter: AppliedFilter) => {
          return (
            <Badge
              key={`${filter.label}-${filter.urlParam}`}
              variant="secondary"
              className="flex space-x-2"
            >
              <span>{filter.label}</span>
              <Link to={getAppliedFilterLink(filter, params, location)}>
                <XMarkIcon className="h-4 w-4" />
              </Link>
            </Badge>
          );
        })}
      </div>
    </>
  );
}

function getAppliedFilterLink(
  filter: AppliedFilter,
  params: URLSearchParams,
  location: Location,
) {
  const paramsClone = new URLSearchParams(params);
  if (filter.urlParam.key === 'variantOption') {
    const variantOptions = paramsClone.getAll('variantOption');
    const filteredVariantOptions = variantOptions.filter(
      (options) => !options.includes(filter.urlParam.value),
    );
    paramsClone.delete(filter.urlParam.key);
    for (const filteredVariantOption of filteredVariantOptions) {
      paramsClone.append(filter.urlParam.key, filteredVariantOption);
    }
  } else {
    paramsClone.delete(filter.urlParam.key);
  }
  return `${location.pathname}?${paramsClone.toString()}`;
}

function getSortLink(
  sort: SortParam,
  params: URLSearchParams,
  location: Location,
) {
  params.set('sort', sort);
  return `${location.pathname}?${params.toString()}`;
}

function getFilterLink(
  filter: Filter,
  rawInput: string | Record<string, any>,
  params: URLSearchParams,
  location: ReturnType<typeof useLocation>,
) {
  const paramsClone = new URLSearchParams(params);
  const newParams = filterInputToParams(filter.type, rawInput, paramsClone);
  return `${location.pathname}?${newParams.toString()}`;
}

const PRICE_RANGE_FILTER_DEBOUNCE_IN_MS = 500;

function PriceRangeFilter({max, min}: {max?: number; min?: number}) {
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const navigate = useNavigate();

  const [minPrice, setMinPrice] = useState(min ? String(min) : '');
  const [maxPrice, setMaxPrice] = useState(max ? String(max) : '');

  useDebounce(
    () => {
      if (
        (minPrice === '' || minPrice === String(min)) &&
        (maxPrice === '' || maxPrice === String(max))
      )
        return;

      const price: {min?: string; max?: string} = {};
      if (minPrice !== '') price.min = minPrice;
      if (maxPrice !== '') price.max = maxPrice;

      const newParams = filterInputToParams('PRICE_RANGE', {price}, params);
      navigate(`${location.pathname}?${newParams.toString()}`);
    },
    PRICE_RANGE_FILTER_DEBOUNCE_IN_MS,
    [minPrice, maxPrice],
  );

  const onChangeMax = (event: React.SyntheticEvent) => {
    const newMaxPrice = (event.target as HTMLInputElement).value;
    setMaxPrice(newMaxPrice);
  };

  const onChangeMin = (event: React.SyntheticEvent) => {
    const newMinPrice = (event.target as HTMLInputElement).value;
    setMinPrice(newMinPrice);
  };

  return (
    <div className="flex flex-col">
      <label className="mb-4">
        <span>from</span>
        <input
          name="maxPrice"
          className="text-black"
          type="text"
          defaultValue={min}
          placeholder={'$'}
          onChange={onChangeMin}
        />
      </label>
      <label>
        <span>to</span>
        <input
          name="minPrice"
          className="text-black"
          type="number"
          defaultValue={max}
          placeholder={'$'}
          onChange={onChangeMax}
        />
      </label>
    </div>
  );
}

function filterInputToParams(
  type: FilterType,
  rawInput: string | Record<string, any>,
  params: URLSearchParams,
) {
  const input = typeof rawInput === 'string' ? JSON.parse(rawInput) : rawInput;
  switch (type) {
    case 'PRICE_RANGE':
      if (input.price.min) params.set('minPrice', input.price.min);
      if (input.price.max) params.set('maxPrice', input.price.max);
      break;
    case 'LIST':
      Object.entries(input).forEach(([key, value]) => {
        if (typeof value === 'string') {
          params.set(key, value);
        } else if (typeof value === 'boolean') {
          params.set(key, value.toString());
        } else {
          const {name, value: val} = value as {name: string; value: string};
          const allVariants = params.getAll(`variantOption`);
          const newVariant = `${name}:${val}`;
          if (!allVariants.includes(newVariant)) {
            params.append('variantOption', newVariant);
          }
        }
      });
      break;
  }

  return params;
}

function SortMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const items: {label: string; key: SortParam}[] = React.useMemo(
    () => [
      {label: 'Featured', key: 'featured'},
      {
        label: 'Price: Low - High',
        key: 'price-low-high',
      },
      {
        label: 'Price: High - Low',
        key: 'price-high-low',
      },
      {
        label: 'Best Selling',
        key: 'best-selling',
      },
      {
        label: 'Newest',
        key: 'newest',
      },
    ],
    [],
  );

  const activeItem = items.find((item) => item.key === params.get('sort'));

  const setSort = (sort: SortParam) => {
    navigate(getSortLink(sort, params, location));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center">
        <Typography.Text size="sm">
          Sort by: {(activeItem || items[0]).label}
        </Typography.Text>
        <IconCaret />
      </DropdownMenuTrigger>

      <DropdownMenuContent loop>
        {items.map((item) => (
          <DropdownMenuCheckboxItem
            key={item.key}
            checked={activeItem?.key === item.key}
            onCheckedChange={() => setSort(item.key)}
          >
            <Typography.Text spacing="wide" size="sm">
              {item.label}
            </Typography.Text>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
