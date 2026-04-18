import { useGamificationAuth } from 'features/gamificationAuth/model/GamificationAuthProvider';
import type { 
  GetMyAchievementsGatewayResponse, 
  GetLevelGatewayResponse,
  MyAchievementsFilterStatus 
} from './types';

const GAMIFICATION_API_BASE = 'http://gamification.local/api';

export const gamificationApi = {
  getMyAchievements: async (
    take = 20, 
    pageNum = 1, 
    status?: MyAchievementsFilterStatus
  ): Promise<GetMyAchievementsGatewayResponse> => {
    const { state } = useGamificationAuth();
    if (!state.token) throw new Error('No gamification token available');

    const params = new URLSearchParams({ take: take.toString(), pageNum: pageNum.toString() });
    if (status) params.append('status', status);

    const response = await fetch(`${GAMIFICATION_API_BASE}/users/me/achievements?${params}`, {
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch achievements: ${response.status}`);
    }

    return response.json();
  },

  getMyLevel: async (): Promise<GetLevelGatewayResponse> => {
    const { state } = useGamificationAuth();
    if (!state.token) throw new Error('No gamification token available');

    const response = await fetch(`${GAMIFICATION_API_BASE}/users/me/level`, {
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch level: ${response.status}`);
    }

    return response.json();
  },

  getUserLevel: async (userId: string): Promise<GetLevelGatewayResponse> => {
    const { state } = useGamificationAuth();
    if (!state.token) throw new Error('No gamification token available');

    const response = await fetch(`${GAMIFICATION_API_BASE}/users/${userId}/level`, {
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user level: ${response.status}`);
    }

    return response.json();
  },
};
