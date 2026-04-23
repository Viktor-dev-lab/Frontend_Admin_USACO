import { problemApi } from './v1Api';
import type { StorageFile, TestcaseConfig } from '../types/studio';

const testcaseService = {
  /**
   * List files currently on Bunny Storage for a specific problem
   */
  listFiles: async (problemId: string): Promise<StorageFile[]> => {
    // Note the trailing slash to match fastify registration
    const response = await problemApi.get<{ success: boolean; files: StorageFile[] }>(`/problems/${problemId}/tests/`);
    return response.data.files || [];
  },

  /**
   * List testcase metadata from Database
   */
  listDbTestcases: async (problemId: string): Promise<TestcaseConfig[]> => {
    const response = await problemApi.get<{ success: boolean; testcases: TestcaseConfig[] }>(`/problems/${problemId}/testcases`);
    return response.data.testcases || [];
  },

  /**
   * Update testcase metadata in Database
   */
  updateDbTestcase: async (problemId: string, testcaseId: string, updates: Partial<TestcaseConfig>): Promise<void> => {
    await problemApi.patch(`/problems/${problemId}/testcases/${testcaseId}`, updates);
  },

  /**
   * Upload a file to Bunny Storage
   */
  uploadFile: async (problemId: string, fileName: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    
    await problemApi.put(`/problems/${problemId}/tests/${fileName}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Preview file content (text)
   */
  previewFile: async (problemId: string, fileName: string): Promise<string> => {
    const response = await problemApi.get<{ success: boolean; content: string }>(`/problems/${problemId}/tests/${fileName}/preview`);
    return response.data.content;
  },

  /**
   * Stream file for download
   */
  downloadFile: async (problemId: string, fileName: string): Promise<void> => {
    const response = await problemApi.get(`/problems/${problemId}/tests/${fileName}`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  /**
   * Delete a specific file or all files in the test folder
   */
  deleteFile: async (problemId: string, fileName?: string): Promise<void> => {
    // Backend changed to: /problems/:problemId/tests/:target?
    const path = fileName 
      ? `/problems/${problemId}/tests/${fileName}` 
      : `/problems/${problemId}/tests/`;
    await problemApi.delete(path);
  },
};

export default testcaseService;
