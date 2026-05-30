import { Play, Video, Music, Crown, Eye } from 'lucide-react';
import { cn, formatDuration, formatPlays } from '@/lib/utils';
import type { Media } from '@/stores/musicStore';

interface MediaCardProps {
  media: Media;
  onPlay: (media: Media) => void;
}

export function MediaCard({ media, onPlay }: MediaCardProps) {
  const isVideo = media.mediaType === 'video';

  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-purple-500/50 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 cursor-pointer"
      onClick={() => onPlay(media)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Thumbnail Container */}
      <div className="relative aspect-video sm:aspect-square overflow-hidden">
        {media.thumbnailUrl ? (
          <img
            src={media.thumbnailUrl}
            alt={media.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
            {isVideo ? (
              <Video className="h-12 w-12 text-muted-foreground/30" />
            ) : (
              <Music className="h-12 w-12 text-muted-foreground/30" />
            )}
          </div>
        )}

        {/* Improved Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500 shadow-2xl">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Play className="h-5 w-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className={cn(
            "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 shadow-lg",
            isVideo 
              ? "bg-red-500/80 text-white" 
              : "bg-purple-500/80 text-white"
          )}>
            <span className="flex items-center gap-1.5">
              {isVideo ? <Video className="h-3 w-3" /> : <Music className="h-3 w-3" />}
              {isVideo ? 'Video' : 'Audio'}
            </span>
          </div>
          {media.isPremium && (
            <div className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-500/80 backdrop-blur-md text-white border border-white/20 shadow-lg animate-pulse-glow">
              <span className="flex items-center gap-1.5">
                <Crown className="h-3 w-3" />
                Premium
              </span>
            </div>
          )}
        </div>

        {/* Duration */}
        {media.duration && (
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
            {formatDuration(media.duration)}
          </div>
        )}

        {/* Audio Wave (Visual Feedback) */}
        {!isVideo && (
          <div className="absolute bottom-3 left-3 flex items-end gap-0.5 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            {[0.4, 0.8, 0.6, 1.0, 0.5].map((h, i) => (
              <div
                key={i}
                className="w-0.5 bg-white/80 rounded-full animate-wave"
                style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 relative">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-bold text-sm sm:text-base line-clamp-1 group-hover:text-purple-500 transition-colors duration-300">
            {media.title}
          </h3>
          {media.category && (
            <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground shrink-0 border border-border/50">
              {media.category}
            </span>
          )}
        </div>
        
        {media.uploader && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="h-4 w-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-[8px] font-bold">
              {media.uploader.username[0].toUpperCase()}
            </span>
            {media.uploader.username}
          </p>
        )}
        
        <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Eye className="h-3 w-3" />
              {formatPlays(media.plays)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-purple-500 uppercase tracking-tighter">
            {media.mediaType === 'audio' ? 'Play Now' : 'Watch Now'}
          </div>
        </div>
      </div>
    </div>
  );
}
