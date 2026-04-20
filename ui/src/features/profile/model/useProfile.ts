import { userApi } from 'entities/user';
import { useState, useEffect, useCallback } from 'react';
import type { UserProfileData, User, UserFlags, Achievement, UserReview, ActivityItem, Subscription } from 'entities/user';

interface UseProfileReturn {
  profile: UserProfileData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: Partial<UserProfileData['user']>) => Promise<void>;
}

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.fetchProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfileData['user']>) => {
    try {
      setLoading(true);
      setError(null);
      await userApi.updateProfile(data);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          user: {
            ...prev.user,
            ...data,
          },
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
};

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await userApi.fetchUser();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return { user, loading, error };
};

export const useUserFlags = () => {
  const [flags, setFlags] = useState<UserFlags | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        setLoading(true);
        const data = await userApi.fetchUserFlags();
        setFlags(data);
      } finally {
        setLoading(false);
      }
    };
    fetchFlags();
  }, []);

  return { flags, loading };
};

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const data = await userApi.fetchAchievements();
        setAchievements(data);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  return { achievements, loading };
};

export const useUserReviews = () => {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const deleteReview = useCallback(async (reviewId: string) => {
    try {
      await userApi.deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    }
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await userApi.fetchUserReviews();
        setReviews(data);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return { reviews, loading, error, deleteReview };
};

export const useActivity = () => {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const data = await userApi.fetchActivity();
        setActivity(data);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  return { activity, loading };
};

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const unsubscribe = useCallback(async (subscriptionId: string) => {
    try {
      await userApi.unsubscribe(subscriptionId);
      setSubscriptions(prev => prev.filter(s => s.id !== subscriptionId));
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
    }
  }, []);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const data = await userApi.fetchSubscriptions();
        setSubscriptions(data);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  return { subscriptions, loading, unsubscribe };
};
