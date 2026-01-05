import { useState, useCallback } from 'react';
import { ApiError } from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T, P extends unknown[]> extends UseApiState<T> {
  execute: (...args: P) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

export function useApi<T, P extends unknown[] = []>(
  apiFunction: (...args: P) => Promise<{ data: T }>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
    initialData?: T | null;
  }
): UseApiReturn<T, P> {
  const [state, setState] = useState<UseApiState<T>>({
    data: options?.initialData ?? null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiFunction(...args);
        setState({ data: response.data, loading: false, error: null });
        options?.onSuccess?.(response.data);
        return response.data;
      } catch (error) {
        const apiError = error as ApiError;
        setState((prev) => ({ ...prev, loading: false, error: apiError }));
        options?.onError?.(apiError);
        return null;
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setState({ data: options?.initialData ?? null, loading: false, error: null });
  }, [options?.initialData]);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

// Hook for immediate execution on mount
export function useApiOnMount<T>(
  apiFunction: () => Promise<{ data: T }>,
  dependencies: React.DependencyList = []
) {
  const api = useApi(apiFunction);

  // Execute on mount and when dependencies change
  useState(() => {
    api.execute();
  });

  return api;
}
