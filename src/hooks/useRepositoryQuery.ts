import { useCallback, useEffect, useState } from 'react';

export type QueryState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  refresh(): Promise<void>;
};

/** Loads a domain service with uniform async UI states. */
export function useRepositoryQuery<T>(loader: () => Promise<T>): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loader());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Impossible de charger les donnees.');
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, error, loading, refresh };
}
