import type {TwSize} from '~/lib/type';
import {Sizes} from '~/lib/const';

export function Spacer({size}: {size: TwSize}) {
  const className = Sizes[size];

  return <div className={className} />;
}
