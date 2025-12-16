// Local storage utility for managing JSON data files
import youtubersData from '@/data/youtubers.json';
import transcriptsData from '@/data/transcripts.json';
import savedSearchesData from '@/data/saved-searches.json';

// Types
export type Youtuber = {
    id: string;
    arabic_name: string;
    english_name: string;
    channel_url?: string;
    description?: string;
    avatar_url?: string;
    subscriber_count?: string;
    category?: string;
    created_at: string;
    rank?: number;
};

export type Transcript = {
    id: string;
    youtuber_id: string;
    video_title: string;
    video_url?: string;
    video_id: string;
    publish_date?: string;
    duration?: string;
    transcript?: string; // Full text for backward compatibility
    timestamps: Array<{
        start_time: number;
        end_time: number;
        text: string;
    }>;
};

export type SavedSearch = {
    id: string;
    youtuber_id: string;
    search_term: string;
    created_at: string;
};

// In-memory storage (since we can't write to JSON files directly in browser)
let youtubers: Youtuber[] = [...(youtubersData as Youtuber[])];
let transcripts: Transcript[] = [...(transcriptsData as Transcript[])];
let savedSearches: SavedSearch[] = [...(savedSearchesData as SavedSearch[])];

// Helper to generate IDs
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper function to convert timestamps array to searchable text
const getFullTranscriptText = (timestamps: Transcript['timestamps']): string => {
    if (!timestamps || !Array.isArray(timestamps)) return '';
    return timestamps.map(t => t.text || '').join(' ');
};

// Youtubers
export const getAllYoutubers = (): Youtuber[] => {
    return [...youtubers].sort((a, b) => {
        // Sort by rank (ascending), then by name
        const rankA = a.rank ?? 999;
        const rankB = b.rank ?? 999;
        if (rankA !== rankB) return rankA - rankB;
        return a.arabic_name.localeCompare(b.arabic_name);
    });
};

export const getYoutuberById = (id: string): Youtuber | undefined => {
    return youtubers.find(y => y.id === id);
};

export const addYoutuber = (data: Omit<Youtuber, 'id' | 'created_at'>): Youtuber => {
    const newYoutuber: Youtuber = {
        ...data,
        id: generateId(),
        created_at: new Date().toISOString(),
    };
    youtubers.push(newYoutuber);
    saveToLocalStorage();
    return newYoutuber;
};

export const bulkAddYoutubers = (data: Array<Omit<Youtuber, 'id' | 'created_at'>>): Youtuber[] => {
    const newYoutubers = data.map(item => ({
        ...item,
        id: generateId(),
        created_at: new Date().toISOString(),
    }));
    youtubers.push(...newYoutubers);
    saveToLocalStorage();
    return newYoutubers;
};

export const deleteYoutuber = (id: string): boolean => {
    const index = youtubers.findIndex(y => y.id === id);
    if (index !== -1) {
        youtubers.splice(index, 1);
        // Also delete associated transcripts
        transcripts = transcripts.filter(t => t.youtuber_id !== id);
        saveToLocalStorage();
        return true;
    }
    return false;
};

export const updateYoutuberRank = (id: string, rank: number): boolean => {
    const youtuber = youtubers.find(y => y.id === id);
    if (youtuber) {
        youtuber.rank = rank;
        saveToLocalStorage();
        return true;
    }
    return false;
};

// Transcripts
export const getAllTranscripts = (): Transcript[] => {
    return transcripts.map(t => ({
        ...t,
        transcript: t.transcript || getFullTranscriptText(t.timestamps),
    }));
};

export const getTranscriptsByYoutuberId = (youtuberId: string): Transcript[] => {
    return transcripts
        .filter(t => t.youtuber_id === youtuberId)
        .map(t => ({
            ...t,
            transcript: t.transcript || getFullTranscriptText(t.timestamps),
        }));
};

export const addTranscript = (data: Omit<Transcript, 'id'>): Transcript => {
    const newTranscript: Transcript = {
        ...data,
        id: generateId(),
        transcript: data.transcript || getFullTranscriptText(data.timestamps),
    };
    transcripts.push(newTranscript);
    saveToLocalStorage();
    return newTranscript;
};

export const bulkAddTranscripts = (data: Array<Omit<Transcript, 'id'>>): Transcript[] => {
    const newTranscripts = data.map(item => ({
        ...item,
        id: generateId(),
        transcript: item.transcript || getFullTranscriptText(item.timestamps),
    }));
    transcripts.push(...newTranscripts);
    saveToLocalStorage();
    return newTranscripts;
};

export const deleteTranscript = (id: string): boolean => {
    const index = transcripts.findIndex(t => t.id === id);
    if (index !== -1) {
        transcripts.splice(index, 1);
        saveToLocalStorage();
        return true;
    }
    return false;
};

export const deleteTranscriptsByYoutuberId = (youtuberId: string): boolean => {
    const initialLength = transcripts.length;
    transcripts = transcripts.filter(t => t.youtuber_id !== youtuberId);
    if (transcripts.length !== initialLength) {
        saveToLocalStorage();
        return true;
    }
    return false;
};

export const searchTranscripts = (searchTerm: string, youtuberId?: string): Transcript[] => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    let results = transcripts;

    if (youtuberId) {
        results = results.filter(t => t.youtuber_id === youtuberId);
    }

    return results
        .filter(transcript => {
            const fullText = getFullTranscriptText(transcript.timestamps);
            return fullText.toLowerCase().includes(term) ||
                (transcript.video_title?.toLowerCase() || '').includes(term);
        })
        .map(t => ({
            ...t,
            transcript: t.transcript || getFullTranscriptText(t.timestamps),
        }));
};

// Saved Searches
export const getSavedSearches = (youtuberId: string): SavedSearch[] => {
    return savedSearches.filter(s => s.youtuber_id === youtuberId);
};

export const addSavedSearch = (youtuberId: string, searchTerm: string): SavedSearch => {
    // Check if already exists
    const existing = savedSearches.find(
        s => s.youtuber_id === youtuberId && s.search_term === searchTerm
    );

    if (existing) return existing;

    const newSearch: SavedSearch = {
        id: generateId(),
        youtuber_id: youtuberId,
        search_term: searchTerm,
        created_at: new Date().toISOString(),
    };

    savedSearches.push(newSearch);
    saveToLocalStorage();
    return newSearch;
};

export const deleteSavedSearch = (id: string): boolean => {
    const index = savedSearches.findIndex(s => s.id === id);
    if (index !== -1) {
        savedSearches.splice(index, 1);
        saveToLocalStorage();
        return true;
    }
    return false;
};

// Persistence using localStorage
const STORAGE_KEYS = {
    YOUTUBERS: 'youtube-search-youtubers',
    TRANSCRIPTS: 'youtube-search-transcripts',
    SAVED_SEARCHES: 'youtube-search-saved-searches',
};

const saveToLocalStorage = () => {
    try {
        localStorage.setItem(STORAGE_KEYS.YOUTUBERS, JSON.stringify(youtubers));
        localStorage.setItem(STORAGE_KEYS.TRANSCRIPTS, JSON.stringify(transcripts));
        localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(savedSearches));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

const loadFromLocalStorage = () => {
    try {
        const storedYoutubers = localStorage.getItem(STORAGE_KEYS.YOUTUBERS);
        const storedTranscripts = localStorage.getItem(STORAGE_KEYS.TRANSCRIPTS);
        const storedSearches = localStorage.getItem(STORAGE_KEYS.SAVED_SEARCHES);

        if (storedYoutubers) {
            youtubers = JSON.parse(storedYoutubers);
        }
        if (storedTranscripts) {
            transcripts = JSON.parse(storedTranscripts);
        }
        if (storedSearches) {
            savedSearches = JSON.parse(storedSearches);
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
};

// Export/Import functionality
export const exportData = () => {
    const data = {
        youtubers,
        transcripts,
        savedSearches,
        exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-search-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

export const importData = (jsonData: string): boolean => {
    try {
        const data = JSON.parse(jsonData);

        if (data.youtubers) youtubers = data.youtubers;
        if (data.transcripts) transcripts = data.transcripts;
        if (data.savedSearches) savedSearches = data.savedSearches;

        saveToLocalStorage();
        return true;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
};

export const clearAllData = () => {
    youtubers = [];
    transcripts = [];
    savedSearches = [];
    saveToLocalStorage();
};

// Initialize from localStorage on module load
loadFromLocalStorage();
