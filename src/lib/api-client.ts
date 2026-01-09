// API client for backend communication
const API_URL = import.meta.env.VITE_API_URL || 'http://164.90.226.1:5000';

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
    transcript?: string;
    timestamps: Array<{
        start_time: number;
        end_time: number;
        text: string;
    }>;
};

export type SavedSearch = {
    id: string;
    user_id: number;
    search_text: string;
    saved_at: string;
};

// Helper to get auth token
const getAuthToken = () => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
        try {
            const parsed = JSON.parse(authStorage);
            return parsed.state?.token || null;
        } catch (e) {
            return null;
        }
    }
    return null;
};

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

// Youtubers API
export const getAllYoutubers = async (): Promise<Youtuber[]> => {
    try {
        const response = await fetch(`${API_URL}/api/youtubers`);
        if (!response.ok) throw new Error('Failed to fetch youtubers');
        const data = await response.json();
        return data.youtubers || [];
    } catch (error) {
        console.error('Error fetching youtubers:', error);
        return [];
    }
};

export const getYoutuberById = async (id: string): Promise<Youtuber | undefined> => {
    try {
        const response = await fetch(`${API_URL}/api/youtubers/${id}`);
        if (!response.ok) return undefined;
        const data = await response.json();
        return data.youtuber;
    } catch (error) {
        console.error('Error fetching youtuber:', error);
        return undefined;
    }
};

// Transcripts API
export const getAllTranscripts = async (): Promise<Transcript[]> => {
    try {
        const response = await fetch(`${API_URL}/api/transcripts`);
        if (!response.ok) throw new Error('Failed to fetch transcripts');
        const data = await response.json();
        return data.transcripts.map((t: any) => ({
            ...t,
            timestamps: typeof t.timestamps === 'string' ? JSON.parse(t.timestamps) : t.timestamps,
        }));
    } catch (error) {
        console.error('Error fetching transcripts:', error);
        return [];
    }
};

export const getTranscriptsByYoutuberId = async (youtuberId: string): Promise<Transcript[]> => {
    try {
        const response = await fetch(`${API_URL}/api/transcripts?youtuber_id=${youtuberId}`);
        if (!response.ok) throw new Error('Failed to fetch transcripts');
        const data = await response.json();
        return data.transcripts.map((t: any) => ({
            ...t,
            timestamps: typeof t.timestamps === 'string' ? JSON.parse(t.timestamps) : t.timestamps,
        }));
    } catch (error) {
        console.error('Error fetching transcripts:', error);
        return [];
    }
};

export const searchTranscripts = async (searchTerm: string, youtuberId?: string): Promise<Transcript[]> => {
    try {
        const params = new URLSearchParams({ q: searchTerm });
        if (youtuberId) params.append('youtuber_id', youtuberId);
        
        const response = await fetch(`${API_URL}/api/search?${params}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        return data.results.map((t: any) => ({
            ...t,
            timestamps: typeof t.timestamps === 'string' ? JSON.parse(t.timestamps) : t.timestamps,
        }));
    } catch (error) {
        console.error('Error searching transcripts:', error);
        return [];
    }
};

// Saved Searches API (requires authentication)
export const getSavedSearches = async (): Promise<SavedSearch[]> => {
    try {
        const response = await fetch(`${API_URL}/api/searches`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.searches || [];
    } catch (error) {
        console.error('Error fetching saved searches:', error);
        return [];
    }
};

export const addSavedSearch = async (searchText: string): Promise<SavedSearch | null> => {
    try {
        const response = await fetch(`${API_URL}/api/searches`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ searchText }),
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.search;
    } catch (error) {
        console.error('Error saving search:', error);
        return null;
    }
};

export const deleteSavedSearch = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/api/searches/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return response.ok;
    } catch (error) {
        console.error('Error deleting search:', error);
        return false;
    }
};

// Admin functions (requires admin auth)
export const addYoutuber = async (data: Omit<Youtuber, 'id' | 'created_at'>): Promise<Youtuber | null> => {
    try {
        const response = await fetch(`${API_URL}/api/youtubers`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) return null;
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding youtuber:', error);
        return null;
    }
};

export const bulkAddYoutubers = async (data: Youtuber[]): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/api/youtubers/bulk`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ youtubers: data }),
        });
        return response.ok;
    } catch (error) {
        console.error('Error bulk adding youtubers:', error);
        return false;
    }
};

export const deleteYoutuber = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/api/youtubers/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return response.ok;
    } catch (error) {
        console.error('Error deleting youtuber:', error);
        return false;
    }
};

export const addTranscript = async (data: Omit<Transcript, 'id'>): Promise<Transcript | null> => {
    try {
        const response = await fetch(`${API_URL}/api/transcripts`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) return null;
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding transcript:', error);
        return null;
    }
};

export const bulkAddTranscripts = async (data: Transcript[]): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/api/transcripts/bulk`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ transcripts: data }),
        });
        return response.ok;
    } catch (error) {
        console.error('Error bulk adding transcripts:', error);
        return false;
    }
};

export const deleteTranscript = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/api/transcripts/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return response.ok;
    } catch (error) {
        console.error('Error deleting transcript:', error);
        return false;
    }
};
