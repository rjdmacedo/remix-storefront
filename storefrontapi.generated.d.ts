/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

export type OrderCardFragment = Pick<
  StorefrontAPI.Order,
  'id' | 'orderNumber' | 'processedAt' | 'financialStatus' | 'fulfillmentStatus'
> & {
  currentTotalPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  lineItems: {
    edges: Array<{
      node: Pick<StorefrontAPI.OrderLineItem, 'title'> & {
        variant?: StorefrontAPI.Maybe<{
          image?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Image, 'url' | 'altText' | 'height' | 'width'>
          >;
        }>;
      };
    }>;
  };
};

type Media_ExternalVideo_Fragment = {__typename: 'ExternalVideo'} & Pick<
  StorefrontAPI.ExternalVideo,
  'id' | 'embedUrl' | 'host' | 'alt' | 'mediaContentType'
> & {previewImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>};

type Media_MediaImage_Fragment = {__typename: 'MediaImage'} & Pick<
  StorefrontAPI.MediaImage,
  'id' | 'alt' | 'mediaContentType'
> & {
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height'>
    >;
    previewImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
  };

type Media_Model3d_Fragment = {__typename: 'Model3d'} & Pick<
  StorefrontAPI.Model3d,
  'id' | 'alt' | 'mediaContentType'
> & {
    sources: Array<Pick<StorefrontAPI.Model3dSource, 'url' | 'mimeType'>>;
    previewImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
  };

type Media_Video_Fragment = {__typename: 'Video'} & Pick<
  StorefrontAPI.Video,
  'id' | 'alt' | 'mediaContentType'
> & {
    sources: Array<Pick<StorefrontAPI.VideoSource, 'url' | 'mimeType'>>;
    previewImage?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
  };

export type MediaFragment =
  | Media_ExternalVideo_Fragment
  | Media_MediaImage_Fragment
  | Media_Model3d_Fragment
  | Media_Video_Fragment;

export type ProductCardFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'title' | 'handle' | 'vendor' | 'publishedAt'
> & {
  options: Array<Pick<StorefrontAPI.ProductOption, 'name' | 'values'>>;
  variants: {
    nodes: Array<
      Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'width' | 'height' | 'altText'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        compareAtPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
        product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
      }
    >;
  };
};

export type ProductVariantFragment = Pick<
  StorefrontAPI.ProductVariant,
  'id' | 'sku' | 'title' | 'availableForSale'
> & {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height' | 'altText'>
  >;
  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
  unitPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  compareAtPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  selectedOptions: Array<Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>>;
};

export type FeaturedCollectionDetailsFragment = Pick<
  StorefrontAPI.Collection,
  'id' | 'title' | 'handle'
> & {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
  >;
};

export type LayoutQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  headerMenuHandle: StorefrontAPI.Scalars['String']['input'];
  footerMenuHandle: StorefrontAPI.Scalars['String']['input'];
}>;

export type LayoutQuery = {
  shop: Pick<StorefrontAPI.Shop, 'id' | 'name' | 'description'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
    brand?: StorefrontAPI.Maybe<{
      logo?: StorefrontAPI.Maybe<{
        image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
      }>;
    }>;
  };
  header?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            >
          >;
        }
      >;
    }
  >;
  footer?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Menu, 'id'> & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        > & {
          items: Array<
            Pick<
              StorefrontAPI.MenuItem,
              'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
            >
          >;
        }
      >;
    }
  >;
};

export type ShopFragment = Pick<
  StorefrontAPI.Shop,
  'id' | 'name' | 'description'
> & {
  primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
  brand?: StorefrontAPI.Maybe<{
    logo?: StorefrontAPI.Maybe<{
      image?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Image, 'url'>>;
    }>;
  }>;
};

export type MenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
>;

export type ChildMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
>;

export type ParentMenuItemFragment = Pick<
  StorefrontAPI.MenuItem,
  'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    >
  >;
};

export type MenuFragment = Pick<StorefrontAPI.Menu, 'id'> & {
  items: Array<
    Pick<
      StorefrontAPI.MenuItem,
      'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
    > & {
      items: Array<
        Pick<
          StorefrontAPI.MenuItem,
          'id' | 'resourceId' | 'tags' | 'title' | 'type' | 'url'
        >
      >;
    }
  >;
};

export type GetShopPrimaryDomainQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type GetShopPrimaryDomainQuery = {
  shop: {primaryDomain: Pick<StorefrontAPI.Domain, 'url'>};
};

export type CollectionContentFragment = Pick<
  StorefrontAPI.Collection,
  'id' | 'handle' | 'title' | 'descriptionHtml'
> & {
  heading?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  byline?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  cta?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  spread?: StorefrontAPI.Maybe<{
    reference?: StorefrontAPI.Maybe<
      | ({__typename: 'MediaImage'} & Pick<
          StorefrontAPI.MediaImage,
          'id' | 'alt' | 'mediaContentType'
        > & {
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height'>
            >;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
      | ({__typename: 'Video'} & Pick<
          StorefrontAPI.Video,
          'id' | 'alt' | 'mediaContentType'
        > & {
            sources: Array<Pick<StorefrontAPI.VideoSource, 'url' | 'mimeType'>>;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
    >;
  }>;
  spreadSecondary?: StorefrontAPI.Maybe<{
    reference?: StorefrontAPI.Maybe<
      | ({__typename: 'MediaImage'} & Pick<
          StorefrontAPI.MediaImage,
          'id' | 'alt' | 'mediaContentType'
        > & {
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height'>
            >;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
      | ({__typename: 'Video'} & Pick<
          StorefrontAPI.Video,
          'id' | 'alt' | 'mediaContentType'
        > & {
            sources: Array<Pick<StorefrontAPI.VideoSource, 'url' | 'mimeType'>>;
            previewImage?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url'>
            >;
          })
    >;
  }>;
};

export type SeoCollectionContentQueryVariables = StorefrontAPI.Exact<{
  handle?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type SeoCollectionContentQuery = {
  hero?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'descriptionHtml'
    > & {
      heading?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      byline?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      cta?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      spread?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          | ({__typename: 'MediaImage'} & Pick<
              StorefrontAPI.MediaImage,
              'id' | 'alt' | 'mediaContentType'
            > & {
                image?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Video'} & Pick<
              StorefrontAPI.Video,
              'id' | 'alt' | 'mediaContentType'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.VideoSource, 'url' | 'mimeType'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
        >;
      }>;
      spreadSecondary?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          | ({__typename: 'MediaImage'} & Pick<
              StorefrontAPI.MediaImage,
              'id' | 'alt' | 'mediaContentType'
            > & {
                image?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Video'} & Pick<
              StorefrontAPI.Video,
              'id' | 'alt' | 'mediaContentType'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.VideoSource, 'url' | 'mimeType'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
        >;
      }>;
    }
  >;
  shop: Pick<StorefrontAPI.Shop, 'name' | 'description'>;
};

export type HeroCollectionContentQueryVariables = StorefrontAPI.Exact<{
  handle?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HeroCollectionContentQuery = {
  hero?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'descriptionHtml'
    > & {
      heading?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      byline?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      cta?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      spread?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          | ({__typename: 'MediaImage'} & Pick<
              StorefrontAPI.MediaImage,
              'id' | 'alt' | 'mediaContentType'
            > & {
                image?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Video'} & Pick<
              StorefrontAPI.Video,
              'id' | 'alt' | 'mediaContentType'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.VideoSource, 'url' | 'mimeType'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
        >;
      }>;
      spreadSecondary?: StorefrontAPI.Maybe<{
        reference?: StorefrontAPI.Maybe<
          | ({__typename: 'MediaImage'} & Pick<
              StorefrontAPI.MediaImage,
              'id' | 'alt' | 'mediaContentType'
            > & {
                image?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Video'} & Pick<
              StorefrontAPI.Video,
              'id' | 'alt' | 'mediaContentType'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.VideoSource, 'url' | 'mimeType'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
        >;
      }>;
    }
  >;
};

export type HomepageFeaturedProductsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomepageFeaturedProductsQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'vendor' | 'publishedAt'
      > & {
        options: Array<Pick<StorefrontAPI.ProductOption, 'name' | 'values'>>;
        variants: {
          nodes: Array<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'width' | 'height' | 'altText'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            }
          >;
        };
      }
    >;
  };
};

export type HomepageFeaturedCollectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomepageFeaturedCollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
        >;
      }
    >;
  };
};

export type CustomerAddressUpdateMutationVariables = StorefrontAPI.Exact<{
  id: StorefrontAPI.Scalars['ID']['input'];
  token: StorefrontAPI.Scalars['String']['input'];
  address: StorefrontAPI.MailingAddressInput;
}>;

export type CustomerAddressUpdateMutation = {
  customerAddressUpdate?: StorefrontAPI.Maybe<{
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type CustomerAddressCreateMutationVariables = StorefrontAPI.Exact<{
  token: StorefrontAPI.Scalars['String']['input'];
  address: StorefrontAPI.MailingAddressInput;
}>;

export type CustomerAddressCreateMutation = {
  customerAddressCreate?: StorefrontAPI.Maybe<{
    customerAddress?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MailingAddress, 'id'>
    >;
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type CustomerAddressDeleteMutationVariables = StorefrontAPI.Exact<{
  id: StorefrontAPI.Scalars['ID']['input'];
  token: StorefrontAPI.Scalars['String']['input'];
}>;

export type CustomerAddressDeleteMutation = {
  customerAddressDelete?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.CustomerAddressDeletePayload,
      'deletedCustomerAddressId'
    > & {
      customerUserErrors: Array<
        Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
      >;
    }
  >;
};

export type CustomerDefaultAddressUpdateMutationVariables =
  StorefrontAPI.Exact<{
    token: StorefrontAPI.Scalars['String']['input'];
    addressId: StorefrontAPI.Scalars['ID']['input'];
  }>;

export type CustomerDefaultAddressUpdateMutation = {
  customerDefaultAddressUpdate?: StorefrontAPI.Maybe<{
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type MoneyFragment = Pick<
  StorefrontAPI.MoneyV2,
  'amount' | 'currencyCode'
>;

export type AddressFullFragment = Pick<
  StorefrontAPI.MailingAddress,
  | 'address1'
  | 'address2'
  | 'city'
  | 'company'
  | 'country'
  | 'countryCodeV2'
  | 'firstName'
  | 'formatted'
  | 'id'
  | 'lastName'
  | 'name'
  | 'phone'
  | 'province'
  | 'provinceCode'
  | 'zip'
>;

export type DiscountApplicationFragment = {
  value:
    | ({__typename: 'MoneyV2'} & Pick<
        StorefrontAPI.MoneyV2,
        'amount' | 'currencyCode'
      >)
    | ({__typename: 'PricingPercentageValue'} & Pick<
        StorefrontAPI.PricingPercentageValue,
        'percentage'
      >);
};

export type LineItemFullFragment = Pick<
  StorefrontAPI.OrderLineItem,
  'title' | 'quantity'
> & {
  discountAllocations: Array<{
    allocatedAmount: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    discountApplication: {
      value:
        | ({__typename: 'MoneyV2'} & Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >)
        | ({__typename: 'PricingPercentageValue'} & Pick<
            StorefrontAPI.PricingPercentageValue,
            'percentage'
          >);
    };
  }>;
  originalTotalPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  discountedTotalPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  variant?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.ProductVariant,
      'id' | 'sku' | 'title' | 'availableForSale'
    > & {
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height' | 'altText'>
      >;
      price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
      unitPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      selectedOptions: Array<
        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
      >;
    }
  >;
};

export type CustomerOrderQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  orderId: StorefrontAPI.Scalars['ID']['input'];
}>;

export type CustomerOrderQuery = {
  node?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Order,
      'id' | 'name' | 'orderNumber' | 'processedAt' | 'fulfillmentStatus'
    > & {
      totalTaxV2?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      totalPriceV2: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      subtotalPriceV2?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      shippingAddress?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.MailingAddress,
          | 'address1'
          | 'address2'
          | 'city'
          | 'company'
          | 'country'
          | 'countryCodeV2'
          | 'firstName'
          | 'formatted'
          | 'id'
          | 'lastName'
          | 'name'
          | 'phone'
          | 'province'
          | 'provinceCode'
          | 'zip'
        >
      >;
      discountApplications: {
        nodes: Array<{
          value:
            | ({__typename: 'MoneyV2'} & Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >)
            | ({__typename: 'PricingPercentageValue'} & Pick<
                StorefrontAPI.PricingPercentageValue,
                'percentage'
              >);
        }>;
      };
      lineItems: {
        nodes: Array<
          Pick<StorefrontAPI.OrderLineItem, 'title' | 'quantity'> & {
            discountAllocations: Array<{
              allocatedAmount: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
              discountApplication: {
                value:
                  | ({__typename: 'MoneyV2'} & Pick<
                      StorefrontAPI.MoneyV2,
                      'amount' | 'currencyCode'
                    >)
                  | ({__typename: 'PricingPercentageValue'} & Pick<
                      StorefrontAPI.PricingPercentageValue,
                      'percentage'
                    >);
              };
            }>;
            originalTotalPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
            discountedTotalPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
            variant?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.ProductVariant,
                'id' | 'sku' | 'title' | 'availableForSale'
              > & {
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'width' | 'height' | 'altText'
                  >
                >;
                price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                unitPrice?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                >;
                compareAtPrice?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                >;
                selectedOptions: Array<
                  Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                >;
              }
            >;
          }
        >;
      };
    }
  >;
};

export type CustomerDetailsQueryVariables = StorefrontAPI.Exact<{
  customerAccessToken: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type CustomerDetailsQuery = {
  customer?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Customer,
      'email' | 'phone' | 'lastName' | 'firstName'
    > & {
      orders: {
        edges: Array<{
          node: Pick<
            StorefrontAPI.Order,
            | 'id'
            | 'orderNumber'
            | 'processedAt'
            | 'financialStatus'
            | 'fulfillmentStatus'
          > & {
            currentTotalPrice: Pick<
              StorefrontAPI.MoneyV2,
              'amount' | 'currencyCode'
            >;
            lineItems: {
              edges: Array<{
                node: Pick<StorefrontAPI.OrderLineItem, 'title'> & {
                  variant?: StorefrontAPI.Maybe<{
                    image?: StorefrontAPI.Maybe<
                      Pick<
                        StorefrontAPI.Image,
                        'url' | 'altText' | 'height' | 'width'
                      >
                    >;
                  }>;
                };
              }>;
            };
          };
        }>;
      };
      addresses: {
        edges: Array<{
          node: Pick<
            StorefrontAPI.MailingAddress,
            | 'id'
            | 'zip'
            | 'city'
            | 'phone'
            | 'company'
            | 'country'
            | 'province'
            | 'address1'
            | 'address2'
            | 'lastName'
            | 'firstName'
            | 'formatted'
          >;
        }>;
      };
      defaultAddress?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.MailingAddress,
          | 'id'
          | 'zip'
          | 'city'
          | 'phone'
          | 'company'
          | 'country'
          | 'province'
          | 'address1'
          | 'address2'
          | 'lastName'
          | 'firstName'
          | 'formatted'
        >
      >;
    }
  >;
};

export type AddressPartialFragment = Pick<
  StorefrontAPI.MailingAddress,
  | 'id'
  | 'zip'
  | 'city'
  | 'phone'
  | 'company'
  | 'country'
  | 'province'
  | 'address1'
  | 'address2'
  | 'lastName'
  | 'firstName'
  | 'formatted'
>;

export type CustomerDetailsFragment = Pick<
  StorefrontAPI.Customer,
  'email' | 'phone' | 'lastName' | 'firstName'
> & {
  orders: {
    edges: Array<{
      node: Pick<
        StorefrontAPI.Order,
        | 'id'
        | 'orderNumber'
        | 'processedAt'
        | 'financialStatus'
        | 'fulfillmentStatus'
      > & {
        currentTotalPrice: Pick<
          StorefrontAPI.MoneyV2,
          'amount' | 'currencyCode'
        >;
        lineItems: {
          edges: Array<{
            node: Pick<StorefrontAPI.OrderLineItem, 'title'> & {
              variant?: StorefrontAPI.Maybe<{
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'height' | 'width'
                  >
                >;
              }>;
            };
          }>;
        };
      };
    }>;
  };
  addresses: {
    edges: Array<{
      node: Pick<
        StorefrontAPI.MailingAddress,
        | 'id'
        | 'zip'
        | 'city'
        | 'phone'
        | 'company'
        | 'country'
        | 'province'
        | 'address1'
        | 'address2'
        | 'lastName'
        | 'firstName'
        | 'formatted'
      >;
    }>;
  };
  defaultAddress?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.MailingAddress,
      | 'id'
      | 'zip'
      | 'city'
      | 'phone'
      | 'company'
      | 'country'
      | 'province'
      | 'address1'
      | 'address2'
      | 'lastName'
      | 'firstName'
      | 'formatted'
    >
  >;
};

export type CustomerUpdateMutationVariables = StorefrontAPI.Exact<{
  customerAccessToken: StorefrontAPI.Scalars['String']['input'];
  customer: StorefrontAPI.CustomerUpdateInput;
}>;

export type CustomerUpdateMutation = {
  customerUpdate?: StorefrontAPI.Maybe<{
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type CustomerActivateMutationVariables = StorefrontAPI.Exact<{
  id: StorefrontAPI.Scalars['ID']['input'];
  input: StorefrontAPI.CustomerActivateInput;
}>;

export type CustomerActivateMutation = {
  customerActivate?: StorefrontAPI.Maybe<{
    customerAccessToken?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.CustomerAccessToken, 'accessToken' | 'expiresAt'>
    >;
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type ApiAllProductsQueryVariables = StorefrontAPI.Exact<{
  query?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  count?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  reverse?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Boolean']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  sortKey?: StorefrontAPI.InputMaybe<StorefrontAPI.ProductSortKeys>;
}>;

export type ApiAllProductsQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'vendor' | 'publishedAt'
      > & {
        options: Array<Pick<StorefrontAPI.ProductOption, 'name' | 'values'>>;
        variants: {
          nodes: Array<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'width' | 'height' | 'altText'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            }
          >;
        };
      }
    >;
  };
};

export type ApiSelectedVariantQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  selectedOptions:
    | Array<StorefrontAPI.SelectedOptionInput>
    | StorefrontAPI.SelectedOptionInput;
}>;

export type ApiSelectedVariantQuery = {
  product?: StorefrontAPI.Maybe<{
    selectedVariant?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.ProductVariant,
        'id' | 'sku' | 'title' | 'availableForSale'
      > & {
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'width' | 'height' | 'altText'
          >
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
        product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
        unitPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        compareAtPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
        >;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
      }
    >;
  }>;
};

export type CollectionDetailsQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  filters?: StorefrontAPI.InputMaybe<
    Array<StorefrontAPI.ProductFilter> | StorefrontAPI.ProductFilter
  >;
  sortKey: StorefrontAPI.ProductCollectionSortKeys;
  reverse?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Boolean']['input']>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type CollectionDetailsQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Collection,
      'id' | 'handle' | 'title' | 'description'
    > & {
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
      image?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height' | 'altText'>
      >;
      products: {
        filters: Array<
          Pick<StorefrontAPI.Filter, 'id' | 'label' | 'type'> & {
            values: Array<
              Pick<
                StorefrontAPI.FilterValue,
                'id' | 'label' | 'count' | 'input'
              >
            >;
          }
        >;
        nodes: Array<
          Pick<
            StorefrontAPI.Product,
            'id' | 'title' | 'handle' | 'vendor' | 'publishedAt'
          > & {
            options: Array<
              Pick<StorefrontAPI.ProductOption, 'name' | 'values'>
            >;
            variants: {
              nodes: Array<
                Pick<
                  StorefrontAPI.ProductVariant,
                  'id' | 'availableForSale'
                > & {
                  image?: StorefrontAPI.Maybe<
                    Pick<
                      StorefrontAPI.Image,
                      'url' | 'width' | 'height' | 'altText'
                    >
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                }
              >;
            };
          }
        >;
        pageInfo: Pick<
          StorefrontAPI.PageInfo,
          'hasPreviousPage' | 'hasNextPage' | 'endCursor' | 'startCursor'
        >;
      };
    }
  >;
  collections: {
    edges: Array<{node: Pick<StorefrontAPI.Collection, 'title' | 'handle'>}>;
  };
};

export type CollectionsQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type CollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<
        StorefrontAPI.Collection,
        'id' | 'title' | 'handle' | 'description'
      > & {
        seo: Pick<StorefrontAPI.Seo, 'title' | 'description'>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'width' | 'height' | 'altText'
          >
        >;
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'endCursor' | 'startCursor' | 'hasNextPage' | 'hasPreviousPage'
    >;
  };
};

export type FeaturedItemsQueryVariables = StorefrontAPI.Exact<{
  pageBy?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type FeaturedItemsQuery = {
  featuredCollections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'id' | 'title' | 'handle'> & {
        image?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'altText' | 'width' | 'height' | 'url'>
        >;
      }
    >;
  };
  featuredProducts: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'vendor' | 'publishedAt'
      > & {
        options: Array<Pick<StorefrontAPI.ProductOption, 'name' | 'values'>>;
        variants: {
          nodes: Array<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'width' | 'height' | 'altText'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            }
          >;
        };
      }
    >;
  };
};

export type ArticleDetailsQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  blogHandle: StorefrontAPI.Scalars['String']['input'];
  articleHandle: StorefrontAPI.Scalars['String']['input'];
}>;

export type ArticleDetailsQuery = {
  blog?: StorefrontAPI.Maybe<{
    articleByHandle?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Article, 'title' | 'contentHtml' | 'publishedAt'> & {
        author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'altText' | 'url' | 'width' | 'height'
          >
        >;
        seo?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Seo, 'description' | 'title'>
        >;
      }
    >;
  }>;
};

export type BlogQueryVariables = StorefrontAPI.Exact<{
  pageBy: StorefrontAPI.Scalars['Int']['input'];
  cursor?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['String']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  blogHandle: StorefrontAPI.Scalars['String']['input'];
}>;

export type BlogQuery = {
  blog?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Blog, 'title'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'title' | 'description'>
      >;
      articles: {
        edges: Array<{
          node: Pick<
            StorefrontAPI.Article,
            'id' | 'title' | 'handle' | 'contentHtml' | 'publishedAt'
          > & {
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'width' | 'height' | 'altText'
              >
            >;
            author?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.ArticleAuthor, 'name'>
            >;
          };
        }>;
      };
    }
  >;
};

export type ArticleFragment = Pick<
  StorefrontAPI.Article,
  'id' | 'title' | 'handle' | 'contentHtml' | 'publishedAt'
> & {
  image?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height' | 'altText'>
  >;
  author?: StorefrontAPI.Maybe<Pick<StorefrontAPI.ArticleAuthor, 'name'>>;
};

export type ShopNameQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ShopNameQuery = {shop: Pick<StorefrontAPI.Shop, 'name'>};

export type CustomerAccessTokenCreateMutationVariables = StorefrontAPI.Exact<{
  input: StorefrontAPI.CustomerAccessTokenCreateInput;
}>;

export type CustomerAccessTokenCreateMutation = {
  customerAccessTokenCreate?: StorefrontAPI.Maybe<{
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
    customerAccessToken?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.CustomerAccessToken, 'expiresAt' | 'accessToken'>
    >;
  }>;
};

export type PageDetailsQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type PageDetailsQuery = {
  page?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Page, 'id' | 'title' | 'body'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'description' | 'title'>
      >;
    }
  >;
};

export type PolicyHandleFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'id' | 'url' | 'body' | 'title' | 'handle'
>;

export type PoliciesHandleQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  privacyPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  shippingPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  termsOfService: StorefrontAPI.Scalars['Boolean']['input'];
  refundPolicy: StorefrontAPI.Scalars['Boolean']['input'];
}>;

export type PoliciesHandleQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'url' | 'body' | 'title' | 'handle'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'url' | 'body' | 'title' | 'handle'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'url' | 'body' | 'title' | 'handle'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'url' | 'body' | 'title' | 'handle'>
    >;
  };
};

export type PolicyIndexFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'id' | 'title' | 'handle'
>;

export type PoliciesIndexQueryVariables = StorefrontAPI.Exact<{
  [key: string]: never;
}>;

export type PoliciesIndexQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    subscriptionPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicyWithDefault, 'id' | 'title' | 'handle'>
    >;
  };
};

export type ProductQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  selectedOptions:
    | Array<StorefrontAPI.SelectedOptionInput>
    | StorefrontAPI.SelectedOptionInput;
}>;

export type ProductQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      'id' | 'title' | 'handle' | 'vendor' | 'description' | 'descriptionHtml'
    > & {
      seo: Pick<StorefrontAPI.Seo, 'title' | 'description'>;
      media: {
        nodes: Array<
          | ({__typename: 'ExternalVideo'} & Pick<
              StorefrontAPI.ExternalVideo,
              'id' | 'embedUrl' | 'host' | 'alt' | 'mediaContentType'
            > & {
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'MediaImage'} & Pick<
              StorefrontAPI.MediaImage,
              'id' | 'alt' | 'mediaContentType'
            > & {
                image?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'id' | 'url' | 'width' | 'height'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Model3d'} & Pick<
              StorefrontAPI.Model3d,
              'id' | 'alt' | 'mediaContentType'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.Model3dSource, 'url' | 'mimeType'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
          | ({__typename: 'Video'} & Pick<
              StorefrontAPI.Video,
              'id' | 'alt' | 'mediaContentType'
            > & {
                sources: Array<
                  Pick<StorefrontAPI.VideoSource, 'url' | 'mimeType'>
                >;
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              })
        >;
      };
      options: Array<Pick<StorefrontAPI.ProductOption, 'name' | 'values'>>;
      variants: {
        nodes: Array<
          Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'sku' | 'title' | 'availableForSale'
          > & {
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'width' | 'height' | 'altText'
              >
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
            product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            unitPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          }
        >;
      };
      selectedVariant?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.ProductVariant,
          'id' | 'sku' | 'title' | 'availableForSale'
        > & {
          image?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'width' | 'height' | 'altText'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
        }
      >;
    }
  >;
  shop: Pick<StorefrontAPI.Shop, 'name'> & {
    primaryDomain: Pick<StorefrontAPI.Domain, 'url'>;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle'>
    >;
  };
};

export type ProductRecommendationsQueryVariables = StorefrontAPI.Exact<{
  count?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  productId: StorefrontAPI.Scalars['ID']['input'];
}>;

export type ProductRecommendationsQuery = {
  additional: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'vendor' | 'publishedAt'
      > & {
        options: Array<Pick<StorefrontAPI.ProductOption, 'name' | 'values'>>;
        variants: {
          nodes: Array<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'width' | 'height' | 'altText'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            }
          >;
        };
      }
    >;
  };
  recommended?: StorefrontAPI.Maybe<
    Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'vendor' | 'publishedAt'
      > & {
        options: Array<Pick<StorefrontAPI.ProductOption, 'name' | 'values'>>;
        variants: {
          nodes: Array<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'width' | 'height' | 'altText'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            }
          >;
        };
      }
    >
  >;
};

export type AllProductsQueryVariables = StorefrontAPI.Exact<{
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type AllProductsQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'vendor' | 'publishedAt'
      > & {
        options: Array<Pick<StorefrontAPI.ProductOption, 'name' | 'values'>>;
        variants: {
          nodes: Array<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'width' | 'height' | 'altText'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            }
          >;
        };
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'endCursor' | 'startCursor' | 'hasNextPage' | 'hasPreviousPage'
    >;
  };
};

export type CustomerRecoverMutationVariables = StorefrontAPI.Exact<{
  email: StorefrontAPI.Scalars['String']['input'];
}>;

export type CustomerRecoverMutation = {
  customerRecover?: StorefrontAPI.Maybe<{
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type CustomerCreateMutationVariables = StorefrontAPI.Exact<{
  input: StorefrontAPI.CustomerCreateInput;
}>;

export type CustomerCreateMutation = {
  customerCreate?: StorefrontAPI.Maybe<{
    customer?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Customer, 'id'>>;
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type CustomerResetMutationVariables = StorefrontAPI.Exact<{
  id: StorefrontAPI.Scalars['ID']['input'];
  input: StorefrontAPI.CustomerResetInput;
}>;

export type CustomerResetMutation = {
  customerReset?: StorefrontAPI.Maybe<{
    customerAccessToken?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.CustomerAccessToken, 'accessToken' | 'expiresAt'>
    >;
    customerUserErrors: Array<
      Pick<StorefrontAPI.CustomerUserError, 'code' | 'field' | 'message'>
    >;
  }>;
};

export type PaginatedProductsSearchQueryVariables = StorefrontAPI.Exact<{
  last?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  first?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  endCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  searchTerm?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
  startCursor?: StorefrontAPI.InputMaybe<
    StorefrontAPI.Scalars['String']['input']
  >;
}>;

export type PaginatedProductsSearchQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'id' | 'title' | 'handle' | 'vendor' | 'publishedAt'
      > & {
        options: Array<Pick<StorefrontAPI.ProductOption, 'name' | 'values'>>;
        variants: {
          nodes: Array<
            Pick<StorefrontAPI.ProductVariant, 'id' | 'availableForSale'> & {
              image?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'width' | 'height' | 'altText'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
            }
          >;
        };
      }
    >;
    pageInfo: Pick<
      StorefrontAPI.PageInfo,
      'startCursor' | 'endCursor' | 'hasNextPage' | 'hasPreviousPage'
    >;
  };
};

export type SitemapsQueryVariables = StorefrontAPI.Exact<{
  urlLimits?: StorefrontAPI.InputMaybe<StorefrontAPI.Scalars['Int']['input']>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type SitemapsQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        'updatedAt' | 'handle' | 'onlineStoreUrl' | 'title'
      > & {
        featuredImage?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.Image, 'url' | 'altText'>
        >;
      }
    >;
  };
  collections: {
    nodes: Array<
      Pick<StorefrontAPI.Collection, 'updatedAt' | 'handle' | 'onlineStoreUrl'>
    >;
  };
  pages: {
    nodes: Array<
      Pick<StorefrontAPI.Page, 'updatedAt' | 'handle' | 'onlineStoreUrl'>
    >;
  };
};

interface GeneratedQueryTypes {
  '#graphql\nquery layout(\n  $language: LanguageCode\n  $headerMenuHandle: String!\n  $footerMenuHandle: String!\n) @inContext(language: $language) {\n  shop {\n    ...Shop\n  }\n  header: menu(handle: $headerMenuHandle) {\n    ...Menu\n  }\n  footer: menu(handle: $footerMenuHandle) {\n    ...Menu\n  }\n}\nfragment Shop on Shop {\n  id\n  name\n  description\n  primaryDomain {\n    url\n  }\n  brand {\n    logo {\n      image {\n        url\n      }\n    }\n  }\n}\nfragment MenuItem on MenuItem {\n  id\n  resourceId\n  tags\n  title\n  type\n  url\n}\nfragment ChildMenuItem on MenuItem {\n  ...MenuItem\n}\nfragment ParentMenuItem on MenuItem {\n  ...MenuItem\n  items {\n    ...ChildMenuItem\n  }\n}\nfragment Menu on Menu {\n  id\n  items {\n    ...ParentMenuItem\n  }\n}\n': {
    return: LayoutQuery;
    variables: LayoutQueryVariables;
  };
  '#graphql\n      query getShopPrimaryDomain { shop { primaryDomain { url } } }\n    ': {
    return: GetShopPrimaryDomainQuery;
    variables: GetShopPrimaryDomainQueryVariables;
  };
  '#graphql\n  query seoCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    hero: collection(handle: $handle) {\n      ...CollectionContent\n    }\n    shop {\n      name\n      description\n    }\n  }\n  #graphql\n  fragment CollectionContent on Collection {\n    id\n    handle\n    title\n    descriptionHtml\n    heading: metafield(namespace: "hero", key: "title") {\n      value\n    }\n    byline: metafield(namespace: "hero", key: "byline") {\n      value\n    }\n    cta: metafield(namespace: "hero", key: "cta") {\n      value\n    }\n    spread: metafield(namespace: "hero", key: "spread") {\n      reference {\n        ...Media\n      }\n    }\n    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {\n      reference {\n        ...Media\n      }\n    }\n  }\n  #graphql\n  fragment Media on Media {\n    __typename\n    alt\n    mediaContentType\n\n    previewImage {\n      url\n    }\n\n    ... on Video {\n      id\n      sources {\n        url\n        mimeType\n      }\n    }\n    ... on Model3d {\n      id\n      sources {\n        url\n        mimeType\n      }\n    }\n    ... on MediaImage {\n      id\n      image {\n        id\n        url\n        width\n        height\n      }\n    }\n    ... on ExternalVideo {\n      id\n      embedUrl\n      host\n    }\n  }\n\n\n': {
    return: SeoCollectionContentQuery;
    variables: SeoCollectionContentQueryVariables;
  };
  '#graphql\n  query heroCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    hero: collection(handle: $handle) {\n      ...CollectionContent\n    }\n  }\n  #graphql\n  fragment CollectionContent on Collection {\n    id\n    handle\n    title\n    descriptionHtml\n    heading: metafield(namespace: "hero", key: "title") {\n      value\n    }\n    byline: metafield(namespace: "hero", key: "byline") {\n      value\n    }\n    cta: metafield(namespace: "hero", key: "cta") {\n      value\n    }\n    spread: metafield(namespace: "hero", key: "spread") {\n      reference {\n        ...Media\n      }\n    }\n    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {\n      reference {\n        ...Media\n      }\n    }\n  }\n  #graphql\n  fragment Media on Media {\n    __typename\n    alt\n    mediaContentType\n\n    previewImage {\n      url\n    }\n\n    ... on Video {\n      id\n      sources {\n        url\n        mimeType\n      }\n    }\n    ... on Model3d {\n      id\n      sources {\n        url\n        mimeType\n      }\n    }\n    ... on MediaImage {\n      id\n      image {\n        id\n        url\n        width\n        height\n      }\n    }\n    ... on ExternalVideo {\n      id\n      embedUrl\n      host\n    }\n  }\n\n\n': {
    return: HeroCollectionContentQuery;
    variables: HeroCollectionContentQueryVariables;
  };
  '#graphql\n  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    products(first: 8) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    handle\n    vendor\n    publishedAt\n    options {\n      name\n      values\n    }\n    variants(first: 1) {\n      nodes {\n        id\n        availableForSale\n        image {\n          url\n          width\n          height\n          altText\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          title\n          handle\n        }\n      }\n    }\n  }\n\n': {
    return: HomepageFeaturedProductsQuery;
    variables: HomepageFeaturedProductsQueryVariables;
  };
  '#graphql\n  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    collections(\n      first: 4,\n      sortKey: UPDATED_AT\n    ) {\n      nodes {\n        id\n        title\n        handle\n        image {\n          altText\n          width\n          height\n          url\n        }\n      }\n    }\n  }\n': {
    return: HomepageFeaturedCollectionsQuery;
    variables: HomepageFeaturedCollectionsQueryVariables;
  };
  '#graphql\n  #graphql\nfragment ProductVariant on ProductVariant {\n  id\n  sku\n  title\n  availableForSale\n\n  image {\n    id\n    url\n    width\n    height\n    altText\n  }\n  price {\n    amount\n    currencyCode\n  }\n  product {\n    title\n    handle\n  }\n  unitPrice {\n    amount\n    currencyCode\n  }\n  compareAtPrice {\n    amount\n    currencyCode\n  }\n  selectedOptions {\n    name\n    value\n  }\n}\n\n  fragment Money on MoneyV2 {\n    amount\n    currencyCode\n  }\n  fragment AddressFull on MailingAddress {\n    address1\n    address2\n    city\n    company\n    country\n    countryCodeV2\n    firstName\n    formatted\n    id\n    lastName\n    name\n    phone\n    province\n    provinceCode\n    zip\n  }\n  fragment DiscountApplication on DiscountApplication {\n    value {\n      __typename\n      ... on MoneyV2 {\n        amount\n        currencyCode\n      }\n      ... on PricingPercentageValue {\n        percentage\n      }\n    }\n  }\n  fragment LineItemFull on OrderLineItem {\n    title\n    quantity\n    discountAllocations {\n      allocatedAmount {\n        ...Money\n      }\n      discountApplication {\n        ...DiscountApplication\n      }\n    }\n    originalTotalPrice {\n      ...Money\n    }\n    discountedTotalPrice {\n      ...Money\n    }\n    variant {\n      ...ProductVariant\n    }\n  }\n\n  query CustomerOrder(\n    $country: CountryCode\n    $language: LanguageCode\n    $orderId: ID!\n  ) @inContext(country: $country, language: $language) {\n    node(id: $orderId) {\n      ... on Order {\n        id\n        name\n        orderNumber\n        processedAt\n        fulfillmentStatus\n        totalTaxV2 {\n          ...Money\n        }\n        totalPriceV2 {\n          ...Money\n        }\n        subtotalPriceV2 {\n          ...Money\n        }\n        shippingAddress {\n          ...AddressFull\n        }\n        discountApplications(first: 100) {\n          nodes {\n            ...DiscountApplication\n          }\n        }\n        lineItems(first: 100) {\n          nodes {\n            ...LineItemFull\n          }\n        }\n      }\n    }\n  }\n': {
    return: CustomerOrderQuery;
    variables: CustomerOrderQueryVariables;
  };
  '#graphql\n  query CustomerDetails(\n    $customerAccessToken: String!\n    $country: CountryCode\n    $language: LanguageCode\n  ) @inContext(country: $country, language: $language) {\n    customer(customerAccessToken: $customerAccessToken) {\n      ...CustomerDetails\n    }\n  }\n\n  fragment AddressPartial on MailingAddress {\n    id\n    zip\n    city\n    phone\n    company\n    country\n    province\n    address1\n    address2\n    lastName\n    firstName\n    formatted\n  }\n\n  fragment CustomerDetails on Customer {\n    email\n    phone\n    lastName\n    firstName\n    orders(first: 250, sortKey: PROCESSED_AT, reverse: true) {\n      edges {\n        node {\n          ...OrderCard\n        }\n      }\n    }\n    addresses(first: 6) {\n      edges {\n        node {\n          ...AddressPartial\n        }\n      }\n    }\n    defaultAddress {\n      ...AddressPartial\n    }\n  }\n\n  #graphql\n  fragment OrderCard on Order {\n    id\n    orderNumber\n    processedAt\n    financialStatus\n    fulfillmentStatus\n    currentTotalPrice {\n      amount\n      currencyCode\n    }\n    lineItems(first: 2) {\n      edges {\n        node {\n          variant {\n            image {\n              url\n              altText\n              height\n              width\n            }\n          }\n          title\n        }\n      }\n    }\n  }\n\n': {
    return: CustomerDetailsQuery;
    variables: CustomerDetailsQueryVariables;
  };
  '#graphql\n  query ApiAllProducts(\n    $query: String\n    $count: Int\n    $reverse: Boolean\n    $country: CountryCode\n    $language: LanguageCode\n    $sortKey: ProductSortKeys\n  ) @inContext(country: $country, language: $language) {\n    products(first: $count, sortKey: $sortKey, reverse: $reverse, query: $query) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    handle\n    vendor\n    publishedAt\n    options {\n      name\n      values\n    }\n    variants(first: 1) {\n      nodes {\n        id\n        availableForSale\n        image {\n          url\n          width\n          height\n          altText\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          title\n          handle\n        }\n      }\n    }\n  }\n\n': {
    return: ApiAllProductsQuery;
    variables: ApiAllProductsQueryVariables;
  };
  '#graphql\n  query ApiSelectedVariant(\n    $handle: String!\n    $country: CountryCode\n    $language: LanguageCode\n    $selectedOptions: [SelectedOptionInput!]!\n  ) @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {\n        ...ProductVariant\n      }\n    }\n  }\n  #graphql\nfragment ProductVariant on ProductVariant {\n  id\n  sku\n  title\n  availableForSale\n\n  image {\n    id\n    url\n    width\n    height\n    altText\n  }\n  price {\n    amount\n    currencyCode\n  }\n  product {\n    title\n    handle\n  }\n  unitPrice {\n    amount\n    currencyCode\n  }\n  compareAtPrice {\n    amount\n    currencyCode\n  }\n  selectedOptions {\n    name\n    value\n  }\n}\n\n': {
    return: ApiSelectedVariantQuery;
    variables: ApiSelectedVariantQueryVariables;
  };
  '#graphql\nquery CollectionDetails(\n  $handle: String!\n  $country: CountryCode\n  $language: LanguageCode\n  $filters: [ProductFilter!]\n  $sortKey: ProductCollectionSortKeys!\n  $reverse: Boolean\n  $first: Int\n  $last: Int\n  $startCursor: String\n  $endCursor: String\n) @inContext(country: $country, language: $language) {\n  collection(handle: $handle) {\n    id\n    handle\n    title\n    description\n    seo {\n      description\n      title\n    }\n    image {\n      id\n      url\n      width\n      height\n      altText\n    }\n    products(\n      first: $first,\n      last: $last,\n      before: $startCursor,\n      after: $endCursor,\n      filters: $filters,\n      sortKey: $sortKey,\n      reverse: $reverse\n    ) {\n      filters {\n        id\n        label\n        type\n        values {\n          id\n          label\n          count\n          input\n        }\n      }\n      nodes {\n        ...ProductCard\n      }\n      pageInfo {\n        hasPreviousPage\n        hasNextPage\n        endCursor\n        startCursor\n      }\n    }\n  }\n  collections(first: 100) {\n    edges {\n      node {\n        title\n        handle\n      }\n    }\n  }\n}\n#graphql\n  fragment ProductCard on Product {\n    id\n    title\n    handle\n    vendor\n    publishedAt\n    options {\n      name\n      values\n    }\n    variants(first: 1) {\n      nodes {\n        id\n        availableForSale\n        image {\n          url\n          width\n          height\n          altText\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          title\n          handle\n        }\n      }\n    }\n  }\n\n': {
    return: CollectionDetailsQuery;
    variables: CollectionDetailsQueryVariables;
  };
  '#graphql\n  query Collections(\n    $country: CountryCode\n    $language: LanguageCode\n    $first: Int\n    $last: Int\n    $startCursor: String\n    $endCursor: String\n  ) @inContext(country: $country, language: $language) {\n    collections(first: $first, last: $last, before: $startCursor, after: $endCursor) {\n      nodes {\n        id\n        title\n        handle\n        description\n        seo {\n          title\n          description\n        }\n        image {\n          id\n          url\n          width\n          height\n          altText\n        }\n      }\n      pageInfo {\n        endCursor\n        startCursor\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n': {
    return: CollectionsQuery;
    variables: CollectionsQueryVariables;
  };
  '#graphql\nquery FeaturedItems(\n  $pageBy: Int = 12\n  $country: CountryCode\n  $language: LanguageCode\n) @inContext(country: $country, language: $language) {\n  featuredCollections: collections(first: 3, sortKey: UPDATED_AT) {\n    nodes {\n      ...FeaturedCollectionDetails\n    }\n  }\n  featuredProducts: products(first: $pageBy) {\n    nodes {\n      ...ProductCard\n    }\n  }\n}\n\n#graphql\n  fragment ProductCard on Product {\n    id\n    title\n    handle\n    vendor\n    publishedAt\n    options {\n      name\n      values\n    }\n    variants(first: 1) {\n      nodes {\n        id\n        availableForSale\n        image {\n          url\n          width\n          height\n          altText\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          title\n          handle\n        }\n      }\n    }\n  }\n\n#graphql\n  fragment FeaturedCollectionDetails on Collection {\n    id\n    title\n    handle\n    image {\n      altText\n      width\n      height\n      url\n    }\n  }\n\n': {
    return: FeaturedItemsQuery;
    variables: FeaturedItemsQueryVariables;
  };
  '#graphql\nquery ArticleDetails(\n  $language: LanguageCode\n  $blogHandle: String!\n  $articleHandle: String!\n) @inContext(language: $language) {\n  blog(handle: $blogHandle) {\n    articleByHandle(handle: $articleHandle) {\n      title\n      contentHtml\n      publishedAt\n      author: authorV2 {\n        name\n      }\n      image {\n        id\n        altText\n        url\n        width\n        height\n      }\n      seo {\n        description\n        title\n      }\n    }\n  }\n}\n': {
    return: ArticleDetailsQuery;
    variables: ArticleDetailsQueryVariables;
  };
  '#graphql\nquery Blog(\n  $pageBy: Int!\n  $cursor: String\n  $language: LanguageCode\n  $blogHandle: String!\n) @inContext(language: $language) {\n  blog(handle: $blogHandle) {\n    title\n    seo {\n      title\n      description\n    }\n    articles(first: $pageBy, after: $cursor) {\n      edges {\n        node {\n          ...Article\n        }\n      }\n    }\n  }\n}\n\nfragment Article on Article {\n  id\n  title\n  handle\n  contentHtml\n  publishedAt\n  image {\n    id\n    url\n    width\n    height\n    altText\n  }\n  author: authorV2 {\n    name\n  }\n}\n': {
    return: BlogQuery;
    variables: BlogQueryVariables;
  };
  '#graphql\n  query ShopName($language: LanguageCode) @inContext(language: $language) {\n    shop {\n      name\n    }\n  }\n': {
    return: ShopNameQuery;
    variables: ShopNameQueryVariables;
  };
  '#graphql\n  query PageDetails($language: LanguageCode, $handle: String!)\n  @inContext(language: $language) {\n    page(handle: $handle) {\n      id\n      title\n      body\n      seo {\n        description\n        title\n      }\n    }\n  }\n': {
    return: PageDetailsQuery;
    variables: PageDetailsQueryVariables;
  };
  '#graphql\n  fragment PolicyHandle on ShopPolicy {\n    id\n    url\n    body\n    title\n    handle\n  }\n\n  query PoliciesHandle(\n    $language: LanguageCode\n    $privacyPolicy: Boolean!\n    $shippingPolicy: Boolean!\n    $termsOfService: Boolean!\n    $refundPolicy: Boolean!\n  ) @inContext(language: $language) {\n    shop {\n      privacyPolicy @include(if: $privacyPolicy) {\n        ...PolicyHandle\n      }\n      shippingPolicy @include(if: $shippingPolicy) {\n        ...PolicyHandle\n      }\n      termsOfService @include(if: $termsOfService) {\n        ...PolicyHandle\n      }\n      refundPolicy @include(if: $refundPolicy) {\n        ...PolicyHandle\n      }\n    }\n  }\n': {
    return: PoliciesHandleQuery;
    variables: PoliciesHandleQueryVariables;
  };
  '#graphql\n  fragment PolicyIndex on ShopPolicy {\n    id\n    title\n    handle\n  }\n\n  query PoliciesIndex {\n    shop {\n      privacyPolicy {\n        ...PolicyIndex\n      }\n      shippingPolicy {\n        ...PolicyIndex\n      }\n      termsOfService {\n        ...PolicyIndex\n      }\n      refundPolicy {\n        ...PolicyIndex\n      }\n      subscriptionPolicy {\n        id\n        title\n        handle\n      }\n    }\n  }\n': {
    return: PoliciesIndexQuery;
    variables: PoliciesIndexQueryVariables;
  };
  '#graphql\n  query Product(\n    $handle: String!\n    $country: CountryCode\n    $language: LanguageCode\n    $selectedOptions: [SelectedOptionInput!]!\n  ) @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      id\n      title\n      handle\n      vendor\n      description\n      descriptionHtml\n      seo {\n        title\n        description\n      }\n      media(first: 7) {\n        nodes {\n          ...Media\n        }\n      }\n      options {\n        name\n        values\n      }\n      variants(first: 1) {\n        nodes {\n          ...ProductVariant\n        }\n      }\n      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {\n        ...ProductVariant\n      }\n    }\n    shop {\n      name\n      primaryDomain {\n        url\n      }\n      refundPolicy {\n        body\n        handle\n      }\n      shippingPolicy {\n        body\n        handle\n      }\n    }\n  }\n  #graphql\n  fragment Media on Media {\n    __typename\n    alt\n    mediaContentType\n\n    previewImage {\n      url\n    }\n\n    ... on Video {\n      id\n      sources {\n        url\n        mimeType\n      }\n    }\n    ... on Model3d {\n      id\n      sources {\n        url\n        mimeType\n      }\n    }\n    ... on MediaImage {\n      id\n      image {\n        id\n        url\n        width\n        height\n      }\n    }\n    ... on ExternalVideo {\n      id\n      embedUrl\n      host\n    }\n  }\n\n  #graphql\nfragment ProductVariant on ProductVariant {\n  id\n  sku\n  title\n  availableForSale\n\n  image {\n    id\n    url\n    width\n    height\n    altText\n  }\n  price {\n    amount\n    currencyCode\n  }\n  product {\n    title\n    handle\n  }\n  unitPrice {\n    amount\n    currencyCode\n  }\n  compareAtPrice {\n    amount\n    currencyCode\n  }\n  selectedOptions {\n    name\n    value\n  }\n}\n\n': {
    return: ProductQuery;
    variables: ProductQueryVariables;
  };
  '#graphql\n  query productRecommendations(\n    $count: Int\n    $country: CountryCode\n    $language: LanguageCode\n    $productId: ID!\n  ) @inContext(country: $country, language: $language) {\n    additional: products(first: $count, sortKey: BEST_SELLING) {\n      nodes {\n        ...ProductCard\n      }\n    }\n    recommended: productRecommendations(productId: $productId) {\n      ...ProductCard\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    handle\n    vendor\n    publishedAt\n    options {\n      name\n      values\n    }\n    variants(first: 1) {\n      nodes {\n        id\n        availableForSale\n        image {\n          url\n          width\n          height\n          altText\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          title\n          handle\n        }\n      }\n    }\n  }\n\n': {
    return: ProductRecommendationsQuery;
    variables: ProductRecommendationsQueryVariables;
  };
  '#graphql\n  query AllProducts(\n    $last: Int\n    $first: Int\n    $country: CountryCode\n    $language: LanguageCode\n    $endCursor: String\n    $startCursor: String\n  ) @inContext(country: $country, language: $language) {\n    products(last: $last, first: $first, after: $endCursor, before: $startCursor) {\n      nodes {\n        ...ProductCard\n      }\n      pageInfo {\n        endCursor\n        startCursor\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    handle\n    vendor\n    publishedAt\n    options {\n      name\n      values\n    }\n    variants(first: 1) {\n      nodes {\n        id\n        availableForSale\n        image {\n          url\n          width\n          height\n          altText\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          title\n          handle\n        }\n      }\n    }\n  }\n\n': {
    return: AllProductsQuery;
    variables: AllProductsQueryVariables;
  };
  '#graphql\n  query PaginatedProductsSearch(\n    $last: Int\n    $first: Int\n    $country: CountryCode\n    $language: LanguageCode\n    $endCursor: String\n    $searchTerm: String\n    $startCursor: String\n  ) @inContext(country: $country, language: $language) {\n    products(\n      last: $last,\n      first: $first,\n      query: $searchTerm\n      after: $endCursor,\n      before: $startCursor,\n      sortKey: RELEVANCE,\n    ) {\n      nodes {\n        ...ProductCard\n      }\n      pageInfo {\n        startCursor\n        endCursor\n        hasNextPage\n        hasPreviousPage\n      }\n    }\n  }\n\n  #graphql\n  fragment ProductCard on Product {\n    id\n    title\n    handle\n    vendor\n    publishedAt\n    options {\n      name\n      values\n    }\n    variants(first: 1) {\n      nodes {\n        id\n        availableForSale\n        image {\n          url\n          width\n          height\n          altText\n        }\n        price {\n          amount\n          currencyCode\n        }\n        compareAtPrice {\n          amount\n          currencyCode\n        }\n        selectedOptions {\n          name\n          value\n        }\n        product {\n          title\n          handle\n        }\n      }\n    }\n  }\n\n': {
    return: PaginatedProductsSearchQuery;
    variables: PaginatedProductsSearchQueryVariables;
  };
  '#graphql\n  query sitemaps($urlLimits: Int, $language: LanguageCode)\n  @inContext(language: $language) {\n    products(\n      first: $urlLimits\n      query: "published_status:\'online_store:visible\'"\n    ) {\n      nodes {\n        updatedAt\n        handle\n        onlineStoreUrl\n        title\n        featuredImage {\n          url\n          altText\n        }\n      }\n    }\n    collections(\n      first: $urlLimits\n      query: "published_status:\'online_store:visible\'"\n    ) {\n      nodes {\n        updatedAt\n        handle\n        onlineStoreUrl\n      }\n    }\n    pages(first: $urlLimits, query: "published_status:\'published\'") {\n      nodes {\n        updatedAt\n        handle\n        onlineStoreUrl\n      }\n    }\n  }\n': {
    return: SitemapsQuery;
    variables: SitemapsQueryVariables;
  };
}

interface GeneratedMutationTypes {
  '#graphql\n  mutation customerAddressUpdate(\n    $id: ID!\n    $token: String!\n    $address: MailingAddressInput!\n  ) {\n    customerAddressUpdate(\n      id: $id\n      address: $address\n      customerAccessToken: $token\n    ) {\n      customerUserErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerAddressUpdateMutation;
    variables: CustomerAddressUpdateMutationVariables;
  };
  '#graphql\nmutation customerAddressCreate(\n  $token: String!\n  $address: MailingAddressInput!\n) {\n  customerAddressCreate(\n    address: $address\n    customerAccessToken: $token\n  ) {\n    customerAddress {\n      id\n    }\n    customerUserErrors {\n      code\n      field\n      message\n    }\n  }\n}\n': {
    return: CustomerAddressCreateMutation;
    variables: CustomerAddressCreateMutationVariables;
  };
  '#graphql\n  mutation customerAddressDelete($id: ID!, $token: String!) {\n    customerAddressDelete(customerAccessToken: $token, id: $id) {\n      customerUserErrors {\n        code\n        field\n        message\n      }\n      deletedCustomerAddressId\n    }\n  }\n': {
    return: CustomerAddressDeleteMutation;
    variables: CustomerAddressDeleteMutationVariables;
  };
  '#graphql\n  mutation customerDefaultAddressUpdate(\n    $token: String!\n    $addressId: ID!\n  ) {\n    customerDefaultAddressUpdate(\n      addressId: $addressId\n      customerAccessToken: $token\n    ) {\n      customerUserErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerDefaultAddressUpdateMutation;
    variables: CustomerDefaultAddressUpdateMutationVariables;
  };
  '#graphql\nmutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {\n  customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {\n    customerUserErrors {\n      code\n      field\n      message\n    }\n  }\n}\n': {
    return: CustomerUpdateMutation;
    variables: CustomerUpdateMutationVariables;
  };
  '#graphql\n  mutation customerActivate($id: ID!, $input: CustomerActivateInput!) {\n    customerActivate(id: $id, input: $input) {\n      customerAccessToken {\n        accessToken\n        expiresAt\n      }\n      customerUserErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerActivateMutation;
    variables: CustomerActivateMutationVariables;
  };
  '#graphql\n  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {\n    customerAccessTokenCreate(input: $input) {\n      customerUserErrors {\n        code\n        field\n        message\n      }\n      customerAccessToken {\n        expiresAt\n        accessToken\n      }\n    }\n  }\n': {
    return: CustomerAccessTokenCreateMutation;
    variables: CustomerAccessTokenCreateMutationVariables;
  };
  '#graphql\n  mutation customerRecover($email: String!) {\n    customerRecover(email: $email) {\n      customerUserErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerRecoverMutation;
    variables: CustomerRecoverMutationVariables;
  };
  '#graphql\n  mutation customerCreate($input: CustomerCreateInput!) {\n    customerCreate(input: $input) {\n      customer {\n        id\n      }\n      customerUserErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerCreateMutation;
    variables: CustomerCreateMutationVariables;
  };
  '#graphql\n  mutation customerReset($id: ID!, $input: CustomerResetInput!) {\n    customerReset(id: $id, input: $input) {\n      customerAccessToken {\n        accessToken\n        expiresAt\n      }\n      customerUserErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerResetMutation;
    variables: CustomerResetMutationVariables;
  };
}

declare module '@shopify/hydrogen' {
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
