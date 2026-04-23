import { moduleApi } from './v1Api';
import type { Module } from '../types/curriculum';

const moduleService = {
  /**
   * Fetch all modules for a specific division
   */
  getModulesByDivisionId: async (divisionId: number): Promise<Module[]> => {
    const response = await moduleApi.get(`/divisions/${divisionId}/modules`);
    return response.data.data;
  },

  /**
   * Create a new module
   */
  createModule: async (data: Omit<Module, 'id' | 'lessons'>): Promise<any> => {
    const response = await moduleApi.post('/modules', data);
    return response.data.data;
  },

  /**
   * Update an existing module
   */
  updateModule: async (id: number, data: Partial<Module>): Promise<any> => {
    // Sanitize payload to only include fields allowed by Backend (additionalProperties: false)
    const sanitizedData = {
      division_id: data.division_id,
      title: data.title,
      order_index: data.order_index
    };
    
    // Remove undefined fields so they don't get sent as null
    Object.keys(sanitizedData).forEach(
      key => (sanitizedData as any)[key] === undefined && delete (sanitizedData as any)[key]
    );

    const response = await moduleApi.patch(`/modules/${id}`, sanitizedData);
    return response.data.data;
  },

  /**
   * Delete a module
   */
  deleteModule: async (id: number): Promise<void> => {
    await moduleApi.delete(`/modules/${id}`);
  },
};

export default moduleService;
