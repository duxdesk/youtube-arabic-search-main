import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import * as LocalStorage from "./local-storage";

export type Youtuber = LocalStorage.Youtuber;
export type Transcript = LocalStorage.Transcript;
export type SavedSearch = LocalStorage.SavedSearch;

// Fetch all youtubers
export const useYoutubers = () => {
    return useQuery({
        queryKey: ["youtubers"],
        queryFn: async () => {
            // Simulate async operation
            await new Promise(resolve => setTimeout(resolve, 100));
            return LocalStorage.getAllYoutubers();
        },
    });
};

// Fetch single youtuber
export const useYoutuber = (id: string) => {
    return useQuery({
        queryKey: ["youtuber", id],
        queryFn: async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            const youtuber = LocalStorage.getYoutuberById(id);
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
            await new Promise(resolve => setTimeout(resolve, 100));
            if (youtuberId) {
                return LocalStorage.getTranscriptsByYoutuberId(youtuberId);
            }
            return LocalStorage.getAllTranscripts();
        },
    });
};

// Search transcripts by text
export const useSearchTranscripts = (searchTerm: string, youtuberId?: string) => {
    return useQuery({
        queryKey: ["search-transcripts", searchTerm, youtuberId],
        queryFn: async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            return LocalStorage.searchTranscripts(searchTerm, youtuberId);
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
            await new Promise(resolve => setTimeout(resolve, 100));
            return LocalStorage.addYoutuber(youtuber);
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
            await new Promise(resolve => setTimeout(resolve, 200));
            return LocalStorage.bulkAddYoutubers(youtubers);
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
            await new Promise(resolve => setTimeout(resolve, 100));
            const success = LocalStorage.deleteYoutuber(id);
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

// Update youtuber rank
export const useUpdateYoutuberRank = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ id, rank }: { id: string; rank: number }) => {
            await new Promise(resolve => setTimeout(resolve, 100));
            const success = LocalStorage.updateYoutuberRank(id, rank);
            if (!success) throw new Error("Failed to update rank");
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
            await new Promise(resolve => setTimeout(resolve, 100));
            const success = LocalStorage.deleteTranscript(id);
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
            await new Promise(resolve => setTimeout(resolve, 100));
            const success = LocalStorage.deleteTranscriptsByYoutuberId(youtuberId);
            if (!success) throw new Error("Failed to delete");
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
            await new Promise(resolve => setTimeout(resolve, 100));
            return LocalStorage.addTranscript(transcript);
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
            await new Promise(resolve => setTimeout(resolve, 200));
            return LocalStorage.bulkAddTranscripts(transcripts);
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
        queryFn: async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            return LocalStorage.getSavedSearches(youtuberId);
        },
        enabled: !!youtuberId,
    });
};

export const useAddSavedSearch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ youtuberId, searchTerm }: { youtuberId: string; searchTerm: string }) => {
            await new Promise(resolve => setTimeout(resolve, 50));
            return LocalStorage.addSavedSearch(youtuberId, searchTerm);
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
            await new Promise(resolve => setTimeout(resolve, 50));
            const success = LocalStorage.deleteSavedSearch(id);
            if (!success) throw new Error("Failed to delete");
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["saved-searches"] });
        },
    });
};
