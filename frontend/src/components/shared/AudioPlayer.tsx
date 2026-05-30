import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  ListMusic,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatDuration, cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/playerStore';

export function AudioPlayer() {
  const { currentMedia: media, isOpen, isPlaying, togglePlay, setIsPlaying, close } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (isOpen && audioRef.current && media?.fileUrl) {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${media.fileUrl}`;
      if (audioRef.current.src !== url) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
    }
  }, [isOpen, media]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, media, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  }, [duration]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  }, []);

  const handleProgressChange = useCallback(([value]: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  }, []);

  const handleVolumeChange = useCallback(([value]: number[]) => {
    setVolume(value / 100);
    setIsMuted(false);
  }, []);

  if (!isOpen || !media) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:left-72 z-50 bg-background/80 backdrop-blur-3xl border-t border-white/5 shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.5)] animate-slide-up overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
      
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="relative px-4 sm:px-8">
        {/* Modern Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 group cursor-pointer">
          <div className="absolute inset-0 bg-muted/20" />
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 relative transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(e) => handleProgressChange([parseFloat(e.target.value)])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>

        <div className="flex items-center justify-between py-4 gap-6">
          {/* Track Info */}
          <div className="flex items-center gap-4 min-w-0 flex-1 max-w-[320px]">
            <div className="relative h-14 w-14 rounded-2xl bg-muted shrink-0 overflow-hidden shadow-lg group">
              {media.thumbnailUrl ? (
                <img src={media.thumbnailUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <ListMusic className="h-6 w-6 text-purple-500" />
                </div>
              )}
              {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                  <div className="flex items-end gap-1 h-4">
                    {[0.4, 0.8, 0.6, 1.0].map((h, i) => (
                      <div key={i} className="w-1 bg-white rounded-full animate-wave" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-base font-bold truncate tracking-tight">{media.title}</h4>
              {media.uploader && (
                <p className="text-xs font-bold text-muted-foreground truncate uppercase tracking-widest">{media.uploader.username}</p>
              )}
            </div>
          </div>

          {/* Player Core Controls */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:text-foreground transition-colors hidden sm:flex"
                onClick={() => seek(-10)}
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                size="icon"
                className="h-12 w-12 rounded-2xl bg-foreground text-background hover:scale-110 active:scale-95 transition-all shadow-xl"
                onClick={togglePlay}
              >
                {isBuffering ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-6 w-6 fill-current" />
                ) : (
                  <Play className="h-6 w-6 fill-current ml-1" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:text-foreground transition-colors hidden sm:flex"
                onClick={() => seek(10)}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground font-mono tabular-nums">
              <span>{formatDuration(currentTime)}</span>
              <div className="w-32 h-0.5 bg-muted/20 rounded-full overflow-hidden hidden md:block">
                <div className="h-full bg-muted-foreground/30" style={{ width: `${progressPercent}%` }} />
              </div>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Right Section Controls */}
          <div className="flex items-center justify-end gap-2 flex-1 max-w-[320px]">
            <div className="hidden xl:flex items-center gap-3 mr-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-red-500 transition-colors"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={cn("h-5 w-5", isLiked ? "fill-red-500 text-red-500" : "")} />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="hidden lg:flex items-center gap-3 mr-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                className="w-24"
                onValueChange={handleVolumeChange}
              />
            </div>

            <div className="flex items-center gap-1 border-l border-white/5 pl-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:text-foreground"
                onClick={close}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
