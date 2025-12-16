import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Types matching your actual database structure
export type Youtuber = {
  id: number;
  arabic_name: string | null;
  english_name: string | null;
  channel_url: string | null;
  description: string | null;
  avatar_url: string | null;
  original_id: string | null;
  created_date: string | null;
  update_date: string | null;
  created_by_id: string | null;
  created_by: string | null;
  created_at: string;
};

export type Transcript = {
  youtuber_id: number;
  video_title: string | null;
  video_url: string | null;
  video_id: string;
  publish_date: string | null;
  duration: string | null;
  timestamps: Array<{
    start_time: number;
    end_time: number;
    text: string;
  }>;
};

// Helper function to convert timestamps array to searchable text
const getFullTranscriptText = (timestamps: Transcript['timestamps']): string => {
  if (!timestamps || !Array.isArray(timestamps)) return '';
  return timestamps.map(t => t.text || '').join(' ');
};

// Fetch all youtubers
export const useYoutubers = () => {
  return useQuery({
    queryKey: ["youtubers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtubers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Youtuber[];
    },
  });
};

// Fetch single youtuber
export const useYoutuber = (id: string) => {
  return useQuery({
    queryKey: ["youtuber", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtubers")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Youtuber;
    },
    enabled: !!id,
  });
};

// Fetch transcripts - NOTE: Since transcripts don't have youtuber_id link, we fetch all
export const useTranscripts = (youtuberId?: string) => {
  return useQuery({
    queryKey: ["transcripts", youtuberId],
    queryFn: async () => {
      let query = supabase
        .from("transcripts")
        .select("*");
      
      // If youtuberId is provided and transcripts have that field, filter by it
      if (youtuberId) {
        query = query.eq("youtuber_id", youtuberId);
      }
      
      const { data, error } = await query.order("publish_date", { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include full text for searching
      return (data as Transcript[]).map(transcript => ({
        ...transcript,
        transcript: getFullTranscriptText(transcript.timestamps), // For backward compatibility
      }));
    },
  });
};

// Search transcripts by text
export const useSearchTranscripts = (searchTerm: string) => {
  return useQuery({
    queryKey: ["search-transcripts", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      
      const { data, error } = await supabase
        .from("transcripts")
        .select("*");
      
      if (error) throw error;
      
      // Client-side filtering through timestamps
      const results = (data as Transcript[]).filter(transcript => {
        const fullText = getFullTranscriptText(transcript.timestamps);
        return fullText.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (transcript.video_title?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      });
      
      // Transform to include full text
      return results.map(transcript => ({
        ...transcript,
        transcript: getFullTranscriptText(transcript.timestamps),
      }));
    },
    enabled: searchTerm.trim().length > 0,
  });
};

// Add youtuber
export const useAddYoutuber = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (youtuber: Omit<Youtuber, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("youtubers")
        .insert([youtuber])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["youtubers"] });
      toast({
        title: "تم بنجاح",
        description: "تمت إضافة اليوتيوبر بنجاح",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة اليوتيوبر",
      });
    },
  });
};

// Add transcript
export const useAddTranscript = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (transcript: Omit<Transcript, "youtuber_id">) => {
      const { data, error } = await supabase
        .from("transcripts")
        .insert([transcript])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
      toast({
        title: "تم بنجاح",
        description: "تمت إضافة النص بنجاح",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة النص",
      });
    },
  });
};
