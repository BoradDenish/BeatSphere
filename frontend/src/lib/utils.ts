import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatPlays(plays: number): string {
  if (!plays) return '0';
  if (plays >= 1000000) {
    return `${(plays / 1000000).toFixed(1)}M`;
  }
  if (plays >= 1000) {
    return `${(plays / 1000).toFixed(1)}K`;
  }
  return plays.toString();
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return '0 bytes';
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(2)} GB`;
  }
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(2)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${bytes} bytes`;
}

/**
 * Resolves a full URL for a media file
 */
export function getMediaUrl(path: string | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
