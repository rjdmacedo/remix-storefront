import {Image} from '@shopify/hydrogen';
import type {MediaEdge} from '@shopify/hydrogen/storefront-api-types';
import type {MediaImage} from '@shopify/hydrogen/storefront-api-types';
import clsx from 'clsx';

/**
 * A client component that defines a media gallery for hosting images, 3D models, and videos of products
 */
export function ProductGallery({
  media,
  className,
}: {
  media: (MediaEdge['node'] & MediaImage)[];
  className?: string;
}) {
  if (!media.length) {
    return null;
  }

  return (
    <div
      className={clsx(
        'swimlane hiddenScroll md:grid-flow-row md:grid-cols-2 md:overflow-x-auto md:p-0',
        className,
      )}
    >
      {media.map((med, i) => {
        const isFirst = i === 0;
        const isFourth = i === 3;
        const isFullWidth = i % 3 === 0;

        const data = {
          ...med,
          image: {
            ...med.image,
            altText: med.alt || 'Product image',
          },
        } as MediaImage;

        const style = [
          isFullWidth ? 'md:col-span-2' : 'md:col-span-1',
          isFirst || isFourth ? '' : 'md:aspect-[4/5]',
          'aspect-square snap-center card-image bg-white dark:bg-contrast/10 w-mobile-gallery md:w-full',
        ].join(' ');

        return (
          <div className={style} key={med.id || med.image?.id}>
            {(med as MediaImage).image && (
              <Image
                loading={i === 0 ? 'eager' : 'lazy'}
                data={data.image!}
                aspectRatio={!isFirst && !isFourth ? '4/5' : undefined}
                sizes={
                  isFirst || isFourth
                    ? '(min-width: 48em) 60vw, 90vw'
                    : '(min-width: 48em) 30vw, 90vw'
                }
                className="fadeIn aspect-square h-full w-full object-cover"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
