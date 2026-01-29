import { useRef, useCallback, useEffect } from 'react';

export function useScrollPreservation(deps: unknown[]) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  const saveScrollPosition = useCallback(() => {
    if (scrollRef.current) {
      scrollPositionRef.current = scrollRef.current.scrollTop;
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollPositionRef.current;
    }
  }, []);

  useEffect(() => {
    // Restore scroll position after data updates
    requestAnimationFrame(() => {
      restoreScrollPosition();
    });
  }, deps);

  return {
    scrollRef,
    saveScrollPosition,
    restoreScrollPosition,
  };
}
