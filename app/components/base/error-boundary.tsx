import {useParams, useRouteError, isRouteErrorResponse} from '@remix-run/react';
import React from 'react';
import {getErrorMessage} from '~/utils/misc';
import {type ErrorResponse} from '@remix-run/router';

type StatusHandler = (info: {
  error: ErrorResponse;
  params: Record<string, string | undefined>;
}) => React.JSX.Element | null;

export function GeneralErrorBoundary({
  statusHandlers,
  defaultStatusHandler = ({error}) => (
    <p>
      {error.status} {error.data}
    </p>
  ),
  unexpectedErrorHandler = (error) => <p>{getErrorMessage(error)}</p>,
}: {
  statusHandlers?: Record<number, StatusHandler>;
  defaultStatusHandler?: StatusHandler;
  unexpectedErrorHandler?: (error: unknown) => React.JSX.Element | null;
}) {
  const error = useRouteError();
  const params = useParams();

  if (typeof document !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return (
    <div className="container mx-auto flex items-center justify-center p-20 text-h2">
      {isRouteErrorResponse(error)
        ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
            error,
            params,
          })
        : unexpectedErrorHandler(error)}
    </div>
  );
}
