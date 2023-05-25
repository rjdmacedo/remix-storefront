import type {Product} from '@shopify/hydrogen/storefront-api-types';
import {ProductCard, Section} from '~/components';

const mockProducts = new Array(12).fill('');

export function ProductSwimlane({
  count = 12,
  title = 'Featured Products',
  products = mockProducts,
  ...props
}: {
  count?: number;
  title?: string;
  products?: Product[];
  [key: string]: unknown;
}) {
  return (
    <Section heading={title} padding="y" {...props}>
      <div className="swimlane hiddenScroll md:scroll-px-8 md:px-8 md:pb-8 lg:scroll-px-12 lg:px-12">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className="w-80 snap-start"
          />
        ))}
      </div>
    </Section>
  );
}
