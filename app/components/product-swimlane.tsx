import type {HomepageFeaturedProductsQuery} from 'storefrontapi.generated';
import {ProductCard, Section} from '~/components';

const mockProducts = {
  nodes: new Array(12).fill(''),
};

type ProductSwimlaneProps = HomepageFeaturedProductsQuery & {
  title?: string;
  count?: number;
};

export function ProductSwimlane({
  count = 12,
  title = 'Featured Products',
  products = mockProducts,
  ...props
}: ProductSwimlaneProps) {
  return (
    <Section heading={title} {...props}>
      <div className="swim-lane hidden-scroll md:scroll-px-8 md:px-8 md:pb-8 lg:scroll-px-12 lg:px-12">
        {products.nodes.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quickAdd
            className="w-80 snap-start"
          />
        ))}
      </div>
    </Section>
  );
}
