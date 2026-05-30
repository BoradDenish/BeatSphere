import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
}

interface Subscription {
  plan: string;
  expiresAt: string;
}

interface AuthState {
  user: User | null;
  subscription: Subscription | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      subscription: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login({ username, password });
          const { user, token } = response.data;
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          localStorage.setItem('token', token);
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register({ username, email, password });
          const { user, token } = response.data;
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          localStorage.setItem('token', token);
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch {
          // Ignore logout errors
        }
        set({
          user: null,
          subscription: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('token');
      },

      fetchUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }
        set({ isLoading: true });
        try {
          const response = await authAPI.getMe();
          set({
            user: response.data.user,
            subscription: response.data.subscription,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          localStorage.removeItem('token');
          set({
            user: null,
            subscription: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        subscription: state.subscription,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
