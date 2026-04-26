import http from 'shared/api/http';
import type { 
  GetMyAchievementsGatewayResponse, 
  GetLevelGatewayResponse,
  GetUserAchievementsGatewayResponse,
  MyAchievementsFilterStatus 
} from './types';

export const gamificationApi = {
  getMyAchievements: async (
    take = 20, 
    pageNum = 1, 
    status?: MyAchievementsFilterStatus
  ): Promise<GetMyAchievementsGatewayResponse> => {
    const params = { take, pageNum, ...(status && { status }) };
const { data } = await http.get<GetMyAchievementsGatewayResponse>('http://gateway.local/api/users/me/achievements', params);
    return data;
  },

  getMyLevel: async (): Promise<GetLevelGatewayResponse> => {
const { data } = await http.get<GetLevelGatewayResponse>('http://gateway.local/api/users/me/level');
    return data;
  },

  getUserLevel: async (userId: string): Promise<GetLevelGatewayResponse> => {
    const { data } = await http.get<GetLevelGatewayResponse>(`http://gateway.local/api/users/${userId}/level`);
    return data;
  },

  getUserAchievements: async (
    userId: string, 
    take = 20, 
    pageNum = 1
  ): Promise<GetUserAchievementsGatewayResponse> => {
    const params = { take, pageNum };
    const { data } = await http.get<GetUserAchievementsGatewayResponse>(`http://gateway.local/api/users/${userId}/achievements`, params);
    return data;
  },
};
