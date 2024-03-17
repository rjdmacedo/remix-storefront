export const MEDIA_FRAGMENT = `#graphql
  fragment Media on Media {
    __typename
    alt
    mediaContentType

    previewImage {
      url
    }

    ... on Video {
      id
      sources {
        url
        mimeType
      }
    }
    ... on Model3d {
      id
      sources {
        url
        mimeType
      }
    }
    ... on MediaImage {
      id
      image {
        id
        url
        width
        height
      }
    }
    ... on ExternalVideo {
      id
      embedUrl
      host
    }
  }
`;

export const CART_QUERY_FRAGMENT = `#graphql
fragment Money on MoneyV2 {
  amount
  currencyCode
}
fragment CartLine on CartLine {
  id
  quantity
  attributes {
    key
    value
  }
  cost {
    totalAmount {
      ...Money
    }
    amountPerQuantity {
      ...Money
    }
    compareAtAmountPerQuantity {
      ...Money
    }
  }
  merchandise {
    ... on ProductVariant {
      id
      availableForSale
      compareAtPrice {
        ...Money
      }
      price {
        ...Money
      }
      requiresShipping
      title
      image {
        id
        url
        altText
        width
        height

      }
      product {
        handle
        title
        id
      }
      selectedOptions {
        name
        value
      }
    }
  }
}
fragment CartApiQuery on Cart {
  id
  checkoutUrl
  totalQuantity
  buyerIdentity {
    countryCode
    customer {
      id
      email
      firstName
      lastName
      displayName
    }
    email
    phone
  }
  lines(first: $numCartLines) {
    nodes {
      ...CartLine
    }
  }
  cost {
    subtotalAmount {
      ...Money
    }
    totalAmount {
      ...Money
    }
    totalDutyAmount {
      ...Money
    }
    totalTaxAmount {
      ...Money
    }
  }
  note
  attributes {
    key
    value
  }
  discountCodes {
    code
    applicable
  }
}
` as const;

export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    title
    handle
    vendor
    publishedAt
    options {
      name
      values
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
        image {
          url
          width
          height
          altText
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
        product {
          title
          handle
        }
      }
    }
  }
`;

export const PRODUCT_VARIANT_FRAGMENT = `#graphql
fragment ProductVariant on ProductVariant {
  id
  sku
  title
  availableForSale

  image {
    id
    url
    width
    height
    altText
  }
  price {
    amount
    currencyCode
  }
  product {
    title
    handle
  }
  unitPrice {
    amount
    currencyCode
  }
  compareAtPrice {
    amount
    currencyCode
  }
  selectedOptions {
    name
    value
  }
}
`;

export const FEATURED_COLLECTION_FRAGMENT = `#graphql
  fragment FeaturedCollectionDetails on Collection {
    id
    title
    handle
    image {
      altText
      width
      height
      url
    }
  }
`;
