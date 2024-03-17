import * as React from 'react';
import {UpdateIcon} from '@radix-ui/react-icons';

export function CartLoading() {
  return (
    <div className="h-screen-no-nav flex w-full items-center justify-center">
      <UpdateIcon className="h-4 w-4 animate-spin" />
    </div>
  );
}
