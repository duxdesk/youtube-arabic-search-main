import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || 'http://164.90.226.1:5000';

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface AuthState {
  currentUser: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      token: null,
      
      register: async (username: string, password: string) => {
        try {
          const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          if (response.ok) {
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Register error:', error);
          return false;
        }
      },
      
      login: async (username: string, password: string) => {
        try {
          const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          if (response.ok) {
            const data = await response.json();
            set({ 
              currentUser: data.user,
              token: data.token 
            });
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },
      
      logout: () => {
        set({ currentUser: null, token: null });
      },
      
      isLoggedIn: () => {
        return get().currentUser !== null && get().token !== null;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Helper function to get auth headers for API calls
export const getAuthHeaders = () => {
  const token = useAuth.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};
