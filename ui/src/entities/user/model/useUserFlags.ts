import { useState, useEffect, useCallback } from 'react';
import { fetchUserFlags } from './api';
import type { UserFlags } from './types';

export const useUserFlags = () => {
  const [flags, setFlags] = useState<UserFlags>({ green: [], red: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

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
  }, [trigger]);

  const refetch = useCallback(() => {
    setTrigger(t => t + 1);
  }, []);

  return { flags, loading, error, refetch };
};

