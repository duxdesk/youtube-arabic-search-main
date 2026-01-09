import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import * as API from "./api-client";

export type Youtuber = API.Youtuber;
export type Transcript = API.Transcript;
export type SavedSearch = API.SavedSearch;

// Fetch all youtubers
export const useYoutubers = () => {
    return useQuery({
        queryKey: ["youtubers"],
        queryFn: API.getAllYoutubers,
    });
};

// Fetch single youtuber
export const useYoutuber = (id: string) => {
    return useQuery({
        queryKey: ["youtuber", id],
        queryFn: async () => {
            const youtuber = await API.getYoutuberById(id);
            if (!youtuber) throw new Error("Youtuber not found");
            return youtuber;
        },
        enabled: !!id,
    });
};

// Fetch transcripts
export const useTranscripts = (youtuberId?: string) => {
    return useQuery({
        queryKey: ["transcripts", youtuberId],
        queryFn: async () => {
            if (youtuberId) {
                return API.getTranscriptsByYoutuberId(youtuberId);
            }
            return API.getAllTranscripts();
        },
    });
};

// Search transcripts by text
export const useSearchTranscripts = (searchTerm: string, youtuberId?: string) => {
    return useQuery({
        queryKey: ["search-transcripts", searchTerm, youtuberId],
        queryFn: () => API.searchTranscripts(searchTerm, youtuberId),
        enabled: searchTerm.trim().length > 0,
    });
};

// Add youtuber
export const useAddYoutuber = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (youtuber: Omit<Youtuber, "id" | "created_at">) => {
            const result = await API.addYoutuber(youtuber);
            if (!result) throw new Error("Failed to add youtuber");
            return result;
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

// Bulk add youtubers
export const useBulkAddYoutubers = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (youtubers: Array<Omit<Youtuber, "id" | "created_at">>) => {
            const success = await API.bulkAddYoutubers(youtubers as any);
            if (!success) throw new Error("Failed to bulk add youtubers");
            return youtubers;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["youtubers"] });
            toast({
                title: "تم بنجاح",
                description: `تمت إضافة ${data.length} يوتيوبر بنجاح`,
            });
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "حدث خطأ أثناء إضافة اليوتيوبرز",
            });
        },
    });
};

// Delete youtuber
export const useDeleteYoutuber = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: string) => {
            const success = await API.deleteYoutuber(id);
            if (!success) throw new Error("Failed to delete");
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["youtubers"] });
            queryClient.invalidateQueries({ queryKey: ["transcripts"] });
            toast({
                title: "تم بنجاح",
                description: "تم حذف اليوتيوبر بنجاح",
            });
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "حدث خطأ أثناء حذف اليوتيوبر",
            });
        },
    });
};

// Update youtuber rank - Note: This endpoint doesn't exist in backend yet
export const useUpdateYoutuberRank = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ id, rank }: { id: string; rank: number }) => {
            // TODO: Add backend endpoint for updating rank
            console.warn("Update rank endpoint not implemented yet");
            return { id, rank };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["youtubers"] });
            toast({
                title: "تم بنجاح",
                description: "تم تحديث الترتيب بنجاح",
            });
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "حدث خطأ أثناء تحديث الترتيب",
            });
        },
    });
};

// Delete transcript
export const useDeleteTranscript = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: string) => {
            const success = await API.deleteTranscript(id);
            if (!success) throw new Error("Failed to delete");
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transcripts"] });
            toast({
                title: "تم بنجاح",
                description: "تم حذف النص بنجاح",
            });
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "حدث خطأ أثناء حذف النص",
            });
        },
    });
};

// Delete all transcripts for youtuber
export const useDeleteAllTranscripts = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (youtuberId: string) => {
            // Delete all transcripts for this youtuber
            const transcripts = await API.getTranscriptsByYoutuberId(youtuberId);
            const deletePromises = transcripts.map(t => API.deleteTranscript(t.id));
            await Promise.all(deletePromises);
            return youtuberId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transcripts"] });
            toast({
                title: "تم بنجاح",
                description: "تم حذف جميع النصوص بنجاح",
            });
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "حدث خطأ أثناء حذف النصوص",
            });
        },
    });
};

// Add transcript
export const useAddTranscript = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (transcript: Omit<Transcript, "id">) => {
            const result = await API.addTranscript(transcript);
            if (!result) throw new Error("Failed to add transcript");
            return result;
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

// Bulk add transcripts
export const useBulkAddTranscripts = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (transcripts: Array<Omit<Transcript, "id">>) => {
            const success = await API.bulkAddTranscripts(transcripts as any);
            if (!success) throw new Error("Failed to bulk add transcripts");
            return transcripts;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["transcripts"] });
            toast({
                title: "تم بنجاح",
                description: `تمت إضافة ${data.length} نص بنجاح`,
            });
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "حدث خطأ أثناء إضافة النصوص",
            });
        },
    });
};

// Saved searches
export const useSavedSearches = (youtuberId: string) => {
    return useQuery({
        queryKey: ["saved-searches", youtuberId],
        queryFn: API.getSavedSearches,
        enabled: !!youtuberId,
    });
};

export const useAddSavedSearch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ youtuberId, searchTerm }: { youtuberId: string; searchTerm: string }) => {
            const result = await API.addSavedSearch(searchTerm);
            if (!result) throw new Error("Failed to save search");
            return result;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["saved-searches", variables.youtuberId] });
        },
    });
};

export const useDeleteSavedSearch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const success = await API.deleteSavedSearch(id);
            if (!success) throw new Error("Failed to delete");
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["saved-searches"] });
        },
    });
};
