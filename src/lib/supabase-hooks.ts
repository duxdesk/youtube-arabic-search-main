import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Types
export type Youtuber = {
  id: string;
  name_ar: string;
  name_en: string;
  avatar: string;
  subscriber_count: string;
  category: string;
  description: string | null;
  created_at: string;
};

export type Transcript = {
  id: string;
  youtuber_id: string;
  video_title: string;
  video_id: string;
  transcript: string;
  published_at: string;
  created_at: string;
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

// Fetch transcripts for a youtuber
export const useTranscripts = (youtuberId: string) => {
  return useQuery({
    queryKey: ["transcripts", youtuberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transcripts")
        .select("*")
        .eq("youtuber_id", youtuberId)
        .order("published_at", { ascending: false });
      
      if (error) throw error;
      return data as Transcript[];
    },
    enabled: !!youtuberId,
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
    mutationFn: async (transcript: Omit<Transcript, "id" | "created_at">) => {
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
