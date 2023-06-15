import React from 'react';
import {VariantProps} from 'class-variance-authority';

import {cn} from '~/lib/utils';
import {BaseButton, buttonVariants} from './base-button';

const RootButton = React.forwardRef<
  React.ElementRef<typeof BaseButton>,
  React.ComponentPropsWithoutRef<typeof BaseButton> &
    VariantProps<typeof buttonVariants>
>(({className, variant, ...props}, ref) => (
  <BaseButton
    className={cn(buttonVariants({variant, className}))}
    {...props}
    ref={ref}
  />
));

RootButton.displayName = 'Button';

const IconButton = React.forwardRef<
  React.ElementRef<typeof RootButton>,
  Omit<
    React.ComponentPropsWithoutRef<typeof RootButton>,
    'leftIcon' | 'rightIcon'
  >
>(({className, children, ...props}, ref) => (
  <RootButton {...props} ref={ref} className={cn('p-0', className)}>
    {props.loading ? null : children}
  </RootButton>
));

IconButton.displayName = 'IconButton';

export const Button = Object.assign(RootButton, {
  Icon: IconButton,
});
