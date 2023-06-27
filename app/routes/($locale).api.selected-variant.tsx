import * as z from 'zod';
import invariant from 'tiny-invariant';
import {type DataFunctionArgs, json} from '@shopify/remix-oxygen';
import type {SelectedOptionInput} from '@shopify/hydrogen/storefront-api-types';

import {PRODUCT_VARIANT_FRAGMENT} from '~/data/fragments';

const OptionsSchema = z.object({
  name: z.string(),
  value: z.string(),
});

const SelectedVariantFormSchema = z.object({
  handle: z.string({
    required_error: 'product handle is required',
  }),
  selectedOptions: OptionsSchema.or(z.array(OptionsSchema)),
});

type FormData = z.infer<typeof SelectedVariantFormSchema>;

export async function loader({
  request,
  context: {storefront},
}: DataFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const handle = searchParams.get('handle') ?? '';
  const selectedOptions = searchParams.get('selectedOptions') ?? '';

  if (!handle) {
    return badRequest({
      formErrors: [],
      fieldErrors: {
        handle: ['Product handle is required'],
      },
    });
  }
  if (!selectedOptions) {
    return badRequest({
      formErrors: [],
      fieldErrors: {
        selectedOptions: ['Product options are required'],
      },
    });
  }

  try {
    const {product} = await storefront.query(API_SELECTED_VARIANT, {
      variables: {
        handle,
        selectedOptions: Object.entries(
          JSON.parse(selectedOptions) as SelectedOptionInput,
        ).map(([name, value]) => ({name, value})),
      },
    });

    invariant(product, 'No product found');

    return json({
      status: 'success',
      data: {
        variant: product.selectedVariant,
      },
    });
  } catch (error: any) {
    if (storefront.isApiError(error)) {
      return badRequest({
        formErrors: ['Something went wrong. Please try again later.'],
        fieldErrors: {},
      });
    }
  }
}

const badRequest = (data: z.typeToFlattenedError<FormData>) =>
  json(
    {
      status: 'error',
      errors: {
        formErrors: data.formErrors,
        fieldErrors: data.fieldErrors,
      },
    } as const,
    {status: 400},
  );

const API_SELECTED_VARIANT = `#graphql
  query ApiSelectedVariant(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        ...ProductVariant
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

// no-op
export default function VariantApiRoute() {
  return null;
}
