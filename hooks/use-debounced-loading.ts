import { useCallback, useRef } from "react";

export const useDebouncedLoading = (delay: number = 200) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);

  const setLoading = useCallback(
    (loading: boolean, callback: (loading: boolean) => void) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (loading) {
        // Show loading immediately
        isLoadingRef.current = true;
        callback(true);
      } else {
        // Delay hiding loading to prevent flickering
        timeoutRef.current = setTimeout(() => {
          if (!isLoadingRef.current) return; // Prevent race conditions
          isLoadingRef.current = false;
          callback(false);
        }, delay);
      }
    },
    [delay]
  );

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { setLoading, cleanup };
};
