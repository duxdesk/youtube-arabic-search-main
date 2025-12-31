import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedSearch {
  id: string;
  username: string;
  youtuberId: string;
  youtuberName: string;
  searchTerm: string;
  savedAt: string;
}

interface SavedSearchesState {
  searches: SavedSearch[];
  saveSearch: (username: string, youtuberId: string, youtuberName: string, searchTerm: string) => void;
  deleteSearch: (id: string) => void;
  getUserSearches: (username: string, youtuberId?: string) => SavedSearch[];
  clearUserSearches: (username: string) => void;
}

export const useSavedSearches = create<SavedSearchesState>()(
  persist(
    (set, get) => ({
      searches: [],
      
      saveSearch: (username, youtuberId, youtuberName, searchTerm) => {
        const { searches } = get();
        
        const exists = searches.find(
          s => s.username === username && 
               s.youtuberId === youtuberId && 
               s.searchTerm.toLowerCase() === searchTerm.toLowerCase()
        );
        
        if (exists) return;
        
        const newSearch: SavedSearch = {
          id: Date.now().toString(),
          username,
          youtuberId,
          youtuberName,
          searchTerm,
          savedAt: new Date().toISOString(),
        };
        
        set({ searches: [...searches, newSearch] });
      },
      
      deleteSearch: (id) => {
        const { searches } = get();
        set({ searches: searches.filter(s => s.id !== id) });
      },
      
      getUserSearches: (username, youtuberId) => {
        const { searches } = get();
        return searches.filter(s => 
          s.username === username && 
          (!youtuberId || s.youtuberId === youtuberId)
        ).sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
      },
      
      clearUserSearches: (username) => {
        const { searches } = get();
        set({ searches: searches.filter(s => s.username !== username) });
      },
    }),
    {
      name: 'saved-searches-storage',
    }
  )
);
