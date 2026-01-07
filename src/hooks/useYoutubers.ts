import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, type Youtuber, type Transcript } from "../db";

// Helper: Generate unique ID (Preserved from original logic)
const generateId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// --- HOOKS ---

/**
 * Fetch all YouTubers and calculate transcript counts for each.
 * This ensures the home page shows the number of uploaded files.
 */
export const useYoutubers = () => {
  return useQuery({
    queryKey: ["youtubers"],
    queryFn: async () => {
      // 1. Fetch all YouTubers from IndexedDB
      const youtubers = await db.youtubers.toArray();
      
      // 2. Attach the count of transcripts for each YouTuber
      const youtubersWithCounts = await Promise.all(
        youtubers.map(async (y) => {
          const count = await db.transcripts
            .where('youtuber_id')
            .equals(y.id)
            .count();
          
          return {
            ...y,
            transcript_count: count
          };
        })
      );

      // 3. Sort by rank (lower numbers first, undefined at the end)
      return youtubersWithCounts.sort((a, b) => {
        const rankA = a.rank || 999999;
        const rankB = b.rank || 999999;
        return rankA - rankB;
      });
    },
  });
};

/**
 * Fetch a single YouTuber by ID
 */
export const useYoutuber = (id: string) => {
  return useQuery({
    queryKey: ["youtuber", id],
    queryFn: async () => db.youtubers.get(id),
    enabled: !!id,
  });
};

/**
 * Fetch transcripts specifically for one YouTuber
 */
export const useTranscripts = (youtuberId: string) => {
  return useQuery({
    queryKey: ["transcripts", youtuberId],
    queryFn: async () => db.transcripts.where('youtuber_id').equals(youtuberId).toArray(),
    enabled: !!youtuberId,
  });
};

/**
 * Add a single YouTuber manually
 */
export const useAddYoutuber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (youtuber: Omit<Youtuber, "id" | "created_at">) => {
      const newYoutuber: Youtuber = {
        ...youtuber,
        id: generateId(),
        created_at: new Date().toISOString(),
      };
      await db.youtubers.add(newYoutuber);
      return newYoutuber;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["youtubers"] }),
  });
};

/**
 * Bulk add transcripts (Used for large JSON uploads)
 */
export const useBulkAddTranscripts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transcripts: Omit<Transcript, "id" | "created_at">[]) => {
      const newTranscripts = transcripts.map(t => ({
        ...t,
        id: generateId(),
        created_at: new Date().toISOString(),
      })) as Transcript[];
      
      await db.transcripts.bulkAdd(newTranscripts);
      return newTranscripts;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
      queryClient.invalidateQueries({ queryKey: ["all-transcripts"] });
      queryClient.invalidateQueries({ queryKey: ["youtubers"] }); // Refresh counts on home page
    },
  });
};

/**
 * Bulk add YouTubers
 */
export const useBulkAddYoutubers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (youtubers: Omit<Youtuber, "id" | "created_at">[]) => {
      const newYoutubers = youtubers.map(y => ({
        ...y,
        id: generateId(),
        created_at: new Date().toISOString(),
      })) as Youtuber[];
      
      await db.youtubers.bulkAdd(newYoutubers);
      return newYoutubers;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["youtubers"] }),
  });
};

/**
 * Fetch every transcript in the database
 */
export const useAllTranscripts = () => {
  return useQuery({
    queryKey: ["all-transcripts"],
    queryFn: async () => db.transcripts.toArray(),
  });
};

/**
 * Delete a YouTuber and all their associated transcripts
 */
export const useDeleteYoutuber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await db.youtubers.delete(id);
      await db.transcripts.where('youtuber_id').equals(id).delete();
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtubers"] });
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
      queryClient.invalidateQueries({ queryKey: ["all-transcripts"] });
    },
  });
};

/**
 * Delete a specific transcript by its ID
 */
export const useDeleteTranscript = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await db.transcripts.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
      queryClient.invalidateQueries({ queryKey: ["all-transcripts"] });
      queryClient.invalidateQueries({ queryKey: ["youtubers"] }); // Refresh counts
    },
  });
};

/**
 * Delete all transcripts for a specific YouTuber
 */
export const useDeleteAllTranscripts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (youtuberId: string) => {
      await db.transcripts.where('youtuber_id').equals(youtuberId).delete();
      return youtuberId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
      queryClient.invalidateQueries({ queryKey: ["all-transcripts"] });
      queryClient.invalidateQueries({ queryKey: ["youtubers"] }); // Refresh counts
    },
  });
};

/**
 * Update the display rank of a YouTuber
 */
export const useUpdateYoutuberRank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rank }: { id: string; rank: number }) => {
      await db.youtubers.update(id, { rank });
      return { id, rank };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["youtubers"] }),
  });
};
