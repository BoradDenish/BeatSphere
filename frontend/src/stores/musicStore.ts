import { create } from 'zustand';
import { mediaAPI } from '@/lib/api';

export interface Media {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
  mediaType: 'audio' | 'video';
  userId: number;
  isPremium: boolean;
  plays: number;
  duration: number | null;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: string;
  uploader?: {
    id: number;
    username: string;
  };
  hasAccess?: boolean;
  canPlay?: boolean;
}

interface MediaState {
  media: Media[];
  currentMedia: Media | null;
  isLoading: boolean;
  error: string | null;
  categories: string[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  } | null;
  freePlaysRemaining: number | null;
  fetchMedia: (params?: any) => Promise<void>;
  fetchMediaById: (id: number) => Promise<void>;
  createMedia: (data: FormData) => Promise<void>;
  importMedia: (data: any) => Promise<void>;
  updateMedia: (id: number, data: any) => Promise<void>;
  deleteMedia: (id: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setCurrentMedia: (media: Media | null) => void;
}

export const useMusicStore = create<MediaState>((set) => ({
  media: [],
  currentMedia: null,
  isLoading: false,
  error: null,
  categories: [],
  pagination: null,
  freePlaysRemaining: null,

  fetchMedia: async (params?: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mediaAPI.getAll(params);
      set({
        media: response.data.media,
        pagination: response.data.pagination,
        freePlaysRemaining: response.data.freePlaysRemaining,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch media',
        isLoading: false,
      });
    }
  },

  fetchMediaById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mediaAPI.getById(id);
      set({
        currentMedia: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch media',
        isLoading: false,
      });
    }
  },

  createMedia: async (data: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mediaAPI.create(data);
      const newMedia = response.data.media;
      set((state) => ({
        media: [newMedia, ...state.media],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create media',
        isLoading: false,
      });
      throw error;
    }
  },

  importMedia: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mediaAPI.import(data);
      const newMedia = response.data.media;
      set((state) => ({
        media: [newMedia, ...state.media],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to import media',
        isLoading: false,
      });
      throw error;
    }
  },

  updateMedia: async (id: number, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mediaAPI.update(id, data);
      const updatedMedia = response.data.media;
      set((state) => ({
        media: state.media.map((m) => (m.id === id ? updatedMedia : m)),
        currentMedia: state.currentMedia?.id === id ? updatedMedia : state.currentMedia,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to update media',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteMedia: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await mediaAPI.delete(id);
      set((state) => ({
        media: state.media.filter((m) => m.id !== id),
        currentMedia: state.currentMedia?.id === id ? null : state.currentMedia,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to delete media',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchCategories: async () => {
    try {
      const response = await mediaAPI.getCategories();
      set({ categories: response.data.categories });
    } catch {
      // silently fail
    }
  },

  setCurrentMedia: (media: Media | null) => {
    set({ currentMedia: media });
  },
}));
