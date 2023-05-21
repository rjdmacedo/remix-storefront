import React from 'react';
import {TwSize} from '~/lib/type';
import clsx from 'clsx';
import {missingClass} from '~/lib/utils';
import {Sizes} from '~/lib/const';

type AvatarWithChildrenProps = {
  src?: never;
  children: React.ReactNode;
};

type AvatarWithSrcProps = {
  src: string;
  children?: never;
};

type AvatarWithNoProps = {
  src?: never;
  children?: never;
};

type AvatarProps = (
  | AvatarWithNoProps
  | AvatarWithSrcProps
  | AvatarWithChildrenProps
) & {
  size?: TwSize;
  className?: string;
};

const defaultSvg = (
  <svg className="h-full w-full" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export const Avatar = ({
  children,
  src,
  size = '3xs',
  className,
}: AvatarProps) => {
  const baseClasses =
    'inline-block overflow-hidden rounded-full object-cover object-center';

  const Component = src ? 'img' : 'span';

  const styles = clsx(
    baseClasses,
    missingClass(className, 'h-') && size && `h-${Sizes[size]}`,
    missingClass(className, 'w-') && size && `w-${Sizes[size]}`,
    className,
  );

  return src ? (
    <Component className={styles} src={src} />
  ) : (
    <Component className={styles}>{children || defaultSvg}</Component>
  );
};
