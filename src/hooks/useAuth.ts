import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  username: string;
  password: string;
  createdAt: string;
}

interface AuthState {
  currentUser: string | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => boolean;
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      
      register: (username: string, password: string) => {
        const { users } = get();
        
        if (users.find(u => u.username === username)) {
          return false;
        }
        
        const newUser: User = {
          username,
          password,
          createdAt: new Date().toISOString(),
        };
        
        set({ users: [...users, newUser] });
        return true;
      },
      
      login: (username: string, password: string) => {
        const { users } = get();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
          set({ currentUser: username });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({ currentUser: null });
      },
      
      isLoggedIn: () => {
        return get().currentUser !== null;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
