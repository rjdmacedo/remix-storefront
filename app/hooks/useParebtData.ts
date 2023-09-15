import {useMatches} from '@remix-run/react';

export function useParentData(pathname: string): unknown {
  const matches = useMatches();
  const parentMatch = matches.find((match) => match.pathname === pathname);

  return parentMatch ? parentMatch.data : null;
}
