import axios from 'axios';
import { UserRoles } from '../types/user';
import type { User } from '../types/user';

const API_BASE_URL = 'http://localhost:3000/v1';

export const authService = {
  async login(email: string, password: string): Promise<string> {
    const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
    const token = response.data.data;
    if (token) {
      localStorage.setItem('admin_token', token);
    }
    return token;
  },

  async getProfile(): Promise<User> {
    const token = localStorage.getItem('admin_token');
    if (!token) throw new Error('No token found');

    const response = await axios.get(`${API_BASE_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  },

  logout() {
    localStorage.removeItem('admin_token');
    // Do NOT use window.location.href here — it bypasses React Router and resets all state.
    // Navigation after logout is handled by AuthContext + ProtectedRoute via React Router.
  },

  getToken() {
    return localStorage.getItem('admin_token');
  }
};
