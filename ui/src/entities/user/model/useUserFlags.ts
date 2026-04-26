import { useState, useEffect } from 'react';
import { fetchUserFlags } from './api';
import type { UserFlags } from './types';

export const useUserFlags = () => {
  const [flags, setFlags] = useState<UserFlags>({ green: [], red: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFlags = async () => {
      try {
        setLoading(true);
        const data = await fetchUserFlags();
        setFlags(data);
      } catch (err: any) {
        setError(err.message);
        setFlags({ green: [], red: [] });
      } finally {
        setLoading(false);
      }
    };

    loadFlags();
  }, []);

  return { flags, loading, error, refetch: () => {/* implement refetch logic  */} };
};

