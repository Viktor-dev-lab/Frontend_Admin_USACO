import { tagApi } from './v1Api';
import type { Tag, TagResponse, CreateTagInput, UpdateTagInput } from '../types/tag';

const tagService = {
  getTags: async (page: number = 1, limit: number = 45): Promise<TagResponse> => {
    const response = await tagApi.get<TagResponse>(`/tags?page=${page}&limit=${limit}`);
    return response.data;
  },

  createTag: async (data: CreateTagInput): Promise<Tag> => {
    const response = await tagApi.post<Tag>('/tags', data);
    return response.data;
  },

  updateTag: async (id: number, data: UpdateTagInput): Promise<Tag> => {
    const response = await tagApi.patch<Tag>(`/tags/${id}`, data);
    return response.data;
  },

  deleteTag: async (id: number): Promise<void> => {
    await tagApi.delete(`/tags/${id}`);
  }
};

export default tagService;
