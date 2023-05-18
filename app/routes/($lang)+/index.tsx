import {isRouteErrorResponse, useRouteError} from '@remix-run/react';

export default function HomePage() {
  return (
    <p>
      Edit this route in <em>app/routes/index.tsx</em>.
    </p>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    console.error(error.status, error.statusText, error.data);
    return <div>Route Error</div>;
  } else {
    console.error((error as Error).message);
    return <div>Thrown Error</div>;
  }
}
