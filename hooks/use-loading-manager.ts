import { useCallback, useMemo } from "react";
import { useLoading } from "@/app/context/LoadingContext";

export const useLoadingManager = () => {
  const { setIsLoading, setLoadingMessage } = useLoading();

  const startLoading = useCallback(
    (message: string = "Loading...") => {
      setLoadingMessage(message);
      setIsLoading(true);
    },
    [setIsLoading, setLoadingMessage]
  );

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  const withLoading = useCallback(
    async <T>(
      asyncFunction: () => Promise<T>,
      loadingMessage: string = "Loading..."
    ): Promise<T> => {
      try {
        startLoading(loadingMessage);
        const result = await asyncFunction();
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return useMemo(
    () => ({
      startLoading,
      stopLoading,
      withLoading,
    }),
    [startLoading, stopLoading, withLoading]
  );
};
