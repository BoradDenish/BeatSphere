import { create } from 'zustand';
import type { Media } from './musicStore';

interface PlayerState {
  currentMedia: Media | null;
  isPlaying: boolean;
  isOpen: boolean;
  setMedia: (media: Media) => void;
  togglePlay: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  close: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentMedia: null,
  isPlaying: false,
  isOpen: false,
  setMedia: (media) => set({ currentMedia: media, isOpen: true, isPlaying: true }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  close: () => set({ isOpen: false, isPlaying: false, currentMedia: null }),
}));
