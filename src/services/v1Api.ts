import axios from 'axios';
import type { AxiosInstance } from 'axios';

const createV1Instance = (port: number): AxiosInstance => {
  const instance = axios.create({
    baseURL: `http://localhost:${port}/v1`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Common request interceptor for auth
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Common response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.error('Session expired. Clearing token...');
        localStorage.removeItem('admin_token');
        // Dispatch a custom event so AuthContext can react and clear user state.
        // This avoids window.location.href which causes a full-page reload and
        // breaks the React Router session.
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Export instances for different services
export const divisionApi = createV1Instance(3000);
export const moduleApi = createV1Instance(3000);
export const lessonApi = createV1Instance(3000);
export const tagApi = createV1Instance(3000);
export const platformApi = createV1Instance(3000);
export const problemApi = createV1Instance(3000);

// Default export stays as divisionApi for backward compatibility if needed, 
// though refactoring existing code to use specific exports is better.
export default divisionApi;
