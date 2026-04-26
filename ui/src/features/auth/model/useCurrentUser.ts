import { useState, useEffect } from 'react';
import { getMyInfo } from './userApi';
import type { UserInfoDto } from './userApi';

export const useCurrentUser = () => {
  const [user, setUser] = useState<UserInfoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await getMyInfo();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error, refetch: () => {/* trigger useEffect or manual */} };
};

