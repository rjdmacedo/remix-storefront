import React from 'react';
import {GeneralErrorBoundary, Spinner} from '~/components/base';

export default function HomePage() {
  return (
    <h1 className="flex items-center gap-4 text-3xl font-bold underline">
      Hello world <Spinner show />
    </h1>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
