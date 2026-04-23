import { problemApi } from './v1Api';
import type { 
  Problem, 
  CreateProblemInput, 
  UpdateProblemInput,
  ProblemResponse,
  ProblemFilterDTO
} from '../types/problem';

const problemService = {
  /**
   * Fetch all problems (paginated & filtered)
   */
  getProblems: async (page: number = 1, limit: number = 45, filters?: ProblemFilterDTO): Promise<ProblemResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await problemApi.get<ProblemResponse>(`/problems?${params.toString()}`);
    return response.data;
  },

  /**
   * Fetch a single problem by ID
   */
  getProblemById: async (id: string): Promise<Problem> => {
    const response = await problemApi.get<{ data: Problem }>(`/problems/${id}`);
    return response.data.data;
  },

  /**
   * Create a new problem
   */
  createProblem: async (data: CreateProblemInput): Promise<Problem> => {
    const response = await problemApi.post<{ data: Problem }>('/problems', data);
    return response.data.data;
  },

  /**
   * Update an existing problem (PATCH)
   */
  updateProblem: async (id: string, data: UpdateProblemInput): Promise<Problem> => {
    const response = await problemApi.patch<{ data: Problem }>(`/problems/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a problem
   */
  deleteProblem: async (id: string): Promise<void> => {
    await problemApi.delete(`/problems/${id}`);
  },

  /**
   * Fetch scripts for a problem (checker, validator, etc.)
   */
  getScripts: async (id: string): Promise<Problem['scripts']> => {
    const response = await problemApi.get<{ data: Problem['scripts'] }>(`/problems/${id}/scripts`);
    return response.data.data;
  },

  /**
   * Update scripts for a problem
   */
  updateScripts: async (id: string, data: Partial<import('../types/problem').ProblemScripts>): Promise<void> => {
    await problemApi.patch(`/problems/${id}/scripts`, data);
  },
};

export default problemService;
