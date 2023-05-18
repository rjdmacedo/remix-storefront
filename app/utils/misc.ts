export function getErrorMessage(error: unknown) {
  if (typeof error === 'string') return error;

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  // eslint-disable-next-line no-console
  console.error('Unable to get error message for error', error);
  return 'Unknown Error';
}
