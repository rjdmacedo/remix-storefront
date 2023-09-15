import {useDataFromMatches} from '~/hooks/useDataFromMatches';

export function useFlashMessages() {
  return useDataFromMatches('flash') as Record<
    'info' | 'error' | 'success',
    string
  >;
}
