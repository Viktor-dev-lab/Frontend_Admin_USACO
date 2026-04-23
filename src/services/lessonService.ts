import { lessonApi } from './v1Api';
import type { Lesson } from '../types/curriculum';

const lessonService = {
  /**
   * Create a new lesson
   */
  createLesson: async (data: Omit<Lesson, 'id' | 'modules'>): Promise<any> => {
    const response = await lessonApi.post('/lessons', data);
    return response.data.data;
  },

  /**
   * Update an existing lesson
   */
  updateLesson: async (id: number, data: Partial<Lesson>): Promise<any> => {
    // Sanitize payload to only include fields allowed by LessonUpdateSchema
    const sanitizedData = {
      module_id: data.module_id,
      title: data.title,
      slug: data.slug,
      short_desc: data.short_desc,
      frequency: data.frequency,
      frequency_level: data.frequency_level,
      order_index: data.order_index,
      content_json: data.content_json,
      has_premium_blocks: data.has_premium_blocks
    };

    // Remove undefined fields
    Object.keys(sanitizedData).forEach(
      key => (sanitizedData as any)[key] === undefined && delete (sanitizedData as any)[key]
    );

    const response = await lessonApi.patch(`/lessons/${id}`, sanitizedData);
    return response.data.data;
  },

  /**
   * Delete a lesson
   */
  deleteLesson: async (id: number): Promise<void> => {
    await lessonApi.delete(`/lessons/${id}`);
  },

  /**
   * Fetch a single lesson by ID or slug
   */
  getLesson: async (slug: string): Promise<Lesson> => {
    const response = await lessonApi.get(`/lessons/${slug}`);
    return response.data.data;
  },

  /**
   * Fetch all lessons for a specific module
   */
  getLessonsByModuleId: async (moduleId: number): Promise<Lesson[]> => {
    const response = await lessonApi.get(`/modules/${moduleId}/lessons`);
    return response.data.data;
  }
};

export default lessonService;
