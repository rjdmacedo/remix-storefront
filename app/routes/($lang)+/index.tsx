import React from 'react';
import {GeneralErrorBoundary} from '~/components/base';

export default function HomePage() {
  return (
    <p>
      Edit this route in <em>app/routes/index.tsx</em>.
    </p>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
