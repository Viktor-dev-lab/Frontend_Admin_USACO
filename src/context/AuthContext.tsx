import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRoles } from '../types/user';
import type { User } from '../types/user';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Just clear the token and user state — let ProtectedRoute handle the redirect
      localStorage.removeItem('admin_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  // Listen for 401s from API interceptors — clear auth state so ProtectedRoute redirects to /login
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setLoading(false);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting login for:', email);
      await authService.login(email, password);
      console.log('Login request successful, fetching profile...');
      const userData = await authService.getProfile();
      console.log('Profile fetched:', userData);
      
      if (userData.role !== UserRoles.ADMIN) {
        console.warn('Access denied: User is not an admin', userData.role);
        // Clear the token but don't call authService.logout() which causes window.location.href redirect
        localStorage.removeItem('admin_token');
        throw new Error('Access denied: You must be an administrator.');
      }
      
      setUser(userData);
      console.log('Admin authenticated successfully');
    } catch (error: any) {
      console.error('Login flow error:', error);
      // Ensure user state is cleared on any error
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage token
    localStorage.removeItem('admin_token');
    // Clearing user triggers isAuthenticated = false → ProtectedRoute redirects to /login
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === UserRoles.ADMIN,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
