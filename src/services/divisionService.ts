import { divisionApi } from './v1Api';
import type { Division } from '../types/curriculum';

const divisionService = {
  /**
   * Fetch all divisions
   */
  getDivisions: async (): Promise<Division[]> => {
    const response = await divisionApi.get('/divisions');
    return response.data.data;
  },

  /**
   * Create a new division
   */
  createDivision: async (data: Omit<Division, 'id' | 'modules'>): Promise<any> => {
    const response = await divisionApi.post('/divisions', data);
    return response.data.data;
  },

  /**
   * Update an existing division
   */
  updateDivision: async (id: number, data: Partial<Omit<Division, 'id' | 'modules'>>): Promise<any> => {
    const response = await divisionApi.patch(`/divisions/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a division
   */
  deleteDivision: async (id: number): Promise<void> => {
    await divisionApi.delete(`/divisions/${id}`);
  },
};

export default divisionService;
