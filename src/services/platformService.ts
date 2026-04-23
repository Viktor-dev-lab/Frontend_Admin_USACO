import { platformApi } from './v1Api';
import type { Platform, PlatformResponse, CreatePlatformInput, UpdatePlatformInput } from '../types/platform';

const platformService = {
  getPlatforms: async (): Promise<PlatformResponse> => {
    const response = await platformApi.get<PlatformResponse>('/platforms');
    return response.data;
  },

  createPlatform: async (data: CreatePlatformInput): Promise<Platform> => {
    const response = await platformApi.post<{ data: Platform }>('/platforms', data);
    return response.data.data;
  },

  updatePlatform: async (id: number, data: UpdatePlatformInput): Promise<Platform> => {
    const response = await platformApi.patch<{ data: Platform }>(`/platforms/${id}`, data);
    return response.data.data;
  },

  deletePlatform: async (id: number): Promise<void> => {
    await platformApi.delete(`/platforms/${id}`);
  }
};

export default platformService;
