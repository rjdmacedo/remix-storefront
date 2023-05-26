import React from 'react';

export function useDebounce<
  Callback extends (...args: Parameters<Callback>) => ReturnType<Callback>,
>(callback: Callback, delay: number) {
  const callbackRef = React.useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  });

  return React.useMemo(
    () =>
      debounce(
        (...args: Parameters<Callback>) => callbackRef.current(...args),
        delay,
      ),
    [delay],
  );
}

function debounce<Callback extends (...args: Parameters<Callback>) => void>(
  fn: Callback,
  delay: number,
) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<Callback>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
