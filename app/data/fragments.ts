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
