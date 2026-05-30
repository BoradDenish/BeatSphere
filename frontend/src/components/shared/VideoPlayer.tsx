import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  X,
  Heart,
  Share2,
  Music,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDuration, formatPlays, getMediaUrl, cn } from '@/lib/utils';
import type { Media } from '@/stores/musicStore';

interface VideoPlayerProps {
  media: Media | null;
  isOpen: boolean;
  onClose: () => void;
}

const PLAYBACK_SPEEDS = ['0.25', '0.5', '0.75', '1', '1.25', '1.5', '1.75', '2'];
const QUALITIES = ['144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p'];

export function VideoPlayer({ media, isOpen, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState('1');
  const [quality, setQuality] = useState('1080p');
  const [showSettings, setShowSettings] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideControls = useCallback(() => {
    if (isPlaying) {
      setShowControls(false);
    }
  }, [isPlaying]);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    if (isPlaying) {
      controlsTimeout.current = setTimeout(hideControls, 3000);
    }
  }, [isPlaying, hideControls]);

  useEffect(() => {
    if (isOpen && videoRef.current && media?.fileUrl) {
      // Reload the video whenever the source changes
      videoRef.current.load();
    }
  }, [isOpen, media?.fileUrl]);

  useEffect(() => {
    if (isPlaying) {
      controlsTimeout.current = setTimeout(hideControls, 3000);
    }
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [isPlaying, hideControls]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'j':
          e.preventDefault();
          seek(-10);
          break;
        case 'l':
          e.preventDefault();
          seek(10);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume((v) => Math.min(1, v + 0.1));
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = parseFloat(playbackSpeed);
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(duration, videoRef.current.currentTime + seconds)
      );
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      setHoverPosition(e.clientX - rect.left);
      setHoverTime(pos * duration);
    }
  };

  if (!isOpen || !media) return null;

  const isAudio = media.mediaType === 'audio';
  const mediaSource = getMediaUrl(media.fileUrl);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg">
      <div
        ref={containerRef}
        className="relative flex h-full w-full flex-col items-center justify-center"
        onMouseMove={resetControlsTimeout}
      >
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {!isAudio && (
          <video
            ref={videoRef}
            key={mediaSource}
            className={cn(
              'max-h-full max-w-full',
              showControls ? 'cursor-default' : 'cursor-none'
            )}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onWaiting={() => setIsBuffering(true)}
            onCanPlay={() => setIsBuffering(false)}
            onClick={togglePlay}
            playsInline
          >
            <source src={mediaSource} type={media.mimeType || 'video/mp4'} />
          </video>
        )}

        {isAudio && (
          <div className="flex flex-col items-center justify-center text-white">
            <div className="relative mb-8">
              <div className="h-64 w-64 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Music className="h-24 w-24 text-white/80" />
              </div>
              {isPlaying && (
                <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse-ring" />
              )}
            </div>
            <h2 className="text-3xl font-bold mb-2">{media.title}</h2>
            {media.uploader && (
              <p className="text-lg text-white/70">{media.uploader.username}</p>
            )}
            <audio
              ref={videoRef}
              key={mediaSource}
              className="hidden"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={mediaSource} type={media.mimeType || 'audio/mpeg'} />
            </audio>
          </div>
        )}

        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <div
            ref={progressRef}
            className="relative h-1 bg-white/20 rounded-full cursor-pointer group mb-4"
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            onMouseLeave={() => setHoverTime(null)}
          >
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            {hoverTime !== null && (
              <div
                className="absolute bottom-full mb-2 px-2 py-1 bg-black/80 rounded text-xs text-white"
                style={{ left: hoverPosition }}
              >
                {formatDuration(hoverTime)}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => seek(-10)}
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => seek(10)}
              >
                <SkipForward className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  className="w-24"
                  onValueChange={([v]) => {
                    setVolume(v / 100);
                    setIsMuted(false);
                  }}
                />
              </div>

              <span className="text-sm text-white/80 ml-4">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <Heart className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <Share2 className="h-5 w-5" />
              </Button>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-5 w-5" />
                </Button>

                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 p-3 bg-black/90 rounded-lg shadow-xl min-w-[200px]">
                    <div className="mb-3">
                      <label className="text-xs text-white/60 mb-1 block">
                        Playback Speed
                      </label>
                      <Select
                        value={playbackSpeed}
                        onValueChange={setPlaybackSpeed}
                      >
                        <SelectTrigger className="bg-white/10 border-0 text-white text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PLAYBACK_SPEEDS.map((speed) => (
                            <SelectItem key={speed} value={speed}>
                              {speed}x
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {!isAudio && (
                      <div>
                        <label className="text-xs text-white/60 mb-1 block">
                          Quality
                        </label>
                        <Select value={quality} onValueChange={setQuality}>
                          <SelectTrigger className="bg-white/10 border-0 text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {QUALITIES.map((q) => (
                              <SelectItem key={q} value={q}>
                                {q}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'absolute top-4 left-4 right-4 flex items-start justify-between transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <div>
            <h2 className="text-xl font-bold text-white">{media.title}</h2>
            {media.uploader && (
              <p className="text-sm text-white/70">{media.uploader.username}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-white border-white/30">
              {formatPlays(media.plays)} views
            </Badge>
            <Badge variant={isAudio ? 'audio' : 'video'}>
              {isAudio ? 'Audio' : 'Video'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="absolute bottom-20 right-4 text-xs text-white/50">
        Press Space/K to play/pause • J/L to seek • M to mute • F for fullscreen
      </div>
    </div>
  );
}
