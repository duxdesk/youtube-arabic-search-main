import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export type Youtuber = {
  id: string;
  arabic_name: string;
  english_name: string;
  avatar_url: string;
  subscriber_count: string;
  category: string;
  description: string;
  created_at: string;
  rank?: number;
};

export type Transcript = {
  id: string;
  youtuber_id: string;
  video_title: string;
  video_id: string;
  transcript: string;
  published_at: string;
  created_at: string;
  timestamps?: Array<{
    start_time: number;
    end_time: number;
    text: string;
  }>;
};

// Local storage keys
const YOUTUBERS_KEY = 'youtubers_data';
const TRANSCRIPTS_KEY = 'transcripts_data';

// Helper functions for local storage
const getYoutubersFromStorage = (): Youtuber[] => {
  const data = localStorage.getItem(YOUTUBERS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveYoutubersToStorage = (youtubers: Youtuber[]) => {
  localStorage.setItem(YOUTUBERS_KEY, JSON.stringify(youtubers));
};

const getTranscriptsFromStorage = (): Transcript[] => {
  const data = localStorage.getItem(TRANSCRIPTS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveTranscriptsToStorage = (transcripts: Transcript[]) => {
  localStorage.setItem(TRANSCRIPTS_KEY, JSON.stringify(transcripts));
};

// Generate unique ID
const generateId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Fetch all youtubers
export const useYoutubers = () => {
  return useQuery({
    queryKey: ["youtubers"],
    queryFn: async () => {
      const youtubers = getYoutubersFromStorage();
      // Sort by rank (lower numbers first, undefined/0 at the end)
      return youtubers.sort((a, b) => {
        const rankA = a.rank || 999999;
        const rankB = b.rank || 999999;
        return rankA - rankB;
      });
    },
  });
};

// Fetch single youtuber
export const useYoutuber = (id: string) => {
  return useQuery({
    queryKey: ["youtuber", id],
    queryFn: async () => {
      const youtubers = getYoutubersFromStorage();
      return youtubers.find(y => y.id === id);
    },
    enabled: !!id,
  });
};

// Fetch transcripts for a youtuber
export const useTranscripts = (youtuberId: string) => {
  return useQuery({
    queryKey: ["transcripts", youtuberId],
    queryFn: async () => {
      const transcripts = getTranscriptsFromStorage();
      return transcripts.filter(t => t.youtuber_id === youtuberId);
    },
    enabled: !!youtuberId,
  });
};

// Add youtuber - Old version (deprecated, kept for compatibility)
export const addYoutuber = (queryClient: any) => {
  return useMutation({
    mutationFn: async (youtuber: Omit<Youtuber, "id" | "created_at">) => {
      const youtubers = getYoutubersFromStorage();
      const newYoutuber: Youtuber = {
        ...youtuber,
        id: generateId(),
        created_at: new Date().toISOString(),
      };
      youtubers.push(newYoutuber);
      saveYoutubersToStorage(youtubers);
      return newYoutuber;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtubers"] });
    },
  });
};

// Add youtuber - New version (hook style)
export const useAddYoutuber = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (youtuber: Omit<Youtuber, "id" | "created_at">) => {
      const youtubers = getYoutubersFromStorage();
      const newYoutuber: Youtuber = {
        ...youtuber,
        id: generateId(),
        created_at: new Date().toISOString(),
      };
      youtubers.push(newYoutuber);
      saveYoutubersToStorage(youtubers);
      return newYoutuber;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtubers"] });
    },
  });
};

// Add transcript
export const addTranscript = (queryClient: any) => {
  return useMutation({
    mutationFn: async (transcript: Omit<Transcript, "id" | "created_at">) => {
      const transcripts = getTranscriptsFromStorage();
      const newTranscript: Transcript = {
        ...transcript,
        id: generateId(),
        created_at: new Date().toISOString(),
      };
      transcripts.push(newTranscript);
      saveTranscriptsToStorage(transcripts);
      return newTranscript;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
    },
  });
};

// Bulk add transcripts - Async function
export const bulkAddTranscripts = async (transcripts: Omit<Transcript, "id" | "created_at">[]) => {
  const existingTranscripts = getTranscriptsFromStorage();
  const newTranscripts = transcripts.map(t => ({
    ...t,
    id: generateId(),
    created_at: new Date().toISOString(),
  }));
  saveTranscriptsToStorage([...existingTranscripts, ...newTranscripts]);
  return newTranscripts;
};

// Bulk add transcripts - Hook version
// Bulk add transcripts - Hook version
export const useBulkAddTranscripts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transcripts: Omit<Transcript, "id" | "created_at">[]) => {
      const existingTranscripts = getTranscriptsFromStorage();
      const newTranscripts = transcripts.map(t => ({
        ...t,  // This spreads ALL properties including timestamps!
        id: generateId(),
        created_at: new Date().toISOString(),
      }));
      saveTranscriptsToStorage([...existingTranscripts, ...newTranscripts]);
      return newTranscripts;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
      queryClient.invalidateQueries({ queryKey: ["all-transcripts"] });
    },
  });
};

// Bulk add youtubers - Async function
export const bulkAddYoutubers = async (youtubers: Omit<Youtuber, "id" | "created_at">[]) => {
  const existingYoutubers = getYoutubersFromStorage();
  const newYoutubers = youtubers.map(y => ({
    ...y,
    id: generateId(),
    created_at: new Date().toISOString(),
  }));
  saveYoutubersToStorage([...existingYoutubers, ...newYoutubers]);
  return newYoutubers;
};

// Bulk add youtubers - Hook version
export const useBulkAddYoutubers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (youtubers: Omit<Youtuber, "id" | "created_at">[]) => {
      const existingYoutubers = getYoutubersFromStorage();
      const newYoutubers = youtubers.map(y => ({
        ...y,
        id: generateId(),
        created_at: new Date().toISOString(),
      }));
      saveYoutubersToStorage([...existingYoutubers, ...newYoutubers]);
      return newYoutubers;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtubers"] });
    },
  });
};

// Get all transcripts
export const useAllTranscripts = () => {
  return useQuery({
    queryKey: ["all-transcripts"],
    queryFn: async () => {
      return getTranscriptsFromStorage();
    },
  });
};

// Delete youtuber
export const useDeleteYoutuber = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const youtubers = getYoutubersFromStorage();
      const updated = youtubers.filter(y => y.id !== id);
      saveYoutubersToStorage(updated);
      
      // Also delete associated transcripts
      const transcripts = getTranscriptsFromStorage();
      const updatedTranscripts = transcripts.filter(t => t.youtuber_id !== id);
      saveTranscriptsToStorage(updatedTranscripts);
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtubers"] });
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
      queryClient.invalidateQueries({ queryKey: ["all-transcripts"] });
    },
  });
};



// Delete transcript
export const useDeleteTranscript = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const transcripts = getTranscriptsFromStorage();
      const updated = transcripts.filter(t => t.id !== id);
      saveTranscriptsToStorage(updated);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
      queryClient.invalidateQueries({ queryKey: ["all-transcripts"] });
    },
  });
};

// Delete all transcripts for a youtuber
export const useDeleteAllTranscripts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (youtuberId: string) => {
      const transcripts = getTranscriptsFromStorage();
      const updated = transcripts.filter(t => t.youtuber_id !== youtuberId);
      saveTranscriptsToStorage(updated);
      return youtuberId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
      queryClient.invalidateQueries({ queryKey: ["all-transcripts"] });
    },
  });
};
// update rank
export const useUpdateYoutuberRank = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, rank }: { id: string; rank: number }) => {
      console.log('🔥 useUpdateYoutuberRank called:', { id, rank });
      
      const youtubers = getYoutubersFromStorage();
      console.log('📦 Current youtubers:', youtubers.length);
      
      const updated = youtubers.map(y => 
        y.id === id ? { ...y, rank: rank } : y
      );
      
      saveYoutubersToStorage(updated);
      console.log('✅ Saved to storage');
      
      // Immediately update the cache
      queryClient.setQueryData(["youtubers"], updated);
      
      return { id, rank };
    },
    onSuccess: () => {
      console.log('✅ Mutation success');
      queryClient.invalidateQueries({ queryKey: ["youtubers"] });
    },
    onError: (error) => {
      console.error('❌ Mutation error:', error);
    },
  });
};


