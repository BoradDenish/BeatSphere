import { useEffect, useState, useRef, useCallback } from 'react';
import { Search, Music, Video, Play, Crown, Zap, TrendingUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaCard } from '@/components/shared/MediaCard';
import { VideoPlayer } from '@/components/shared/VideoPlayer';
import { useMusicStore, Media } from '@/stores/musicStore';
import { useAuthStore } from '@/stores/authStore';
import { usePlayerStore } from '@/stores/playerStore';
import { cn } from '@/lib/utils';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, options]);
  return isVisible;
}

export function HomePage() {
  const { media, fetchMedia, isLoading, freePlaysRemaining, categories, fetchCategories } = useMusicStore();
  const { isAuthenticated } = useAuthStore();
  const { setMedia: setGlobalMedia } = usePlayerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const trendingRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const trendingVisible = useIntersectionObserver(trendingRef);
  const featuresVisible = useIntersectionObserver(featuresRef);
  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    fetchMedia({ limit: 20 });
    fetchCategories();
    setLoaded(true);
  }, [fetchMedia, fetchCategories]);

  useEffect(() => {
    fetchMedia({
      search: debouncedSearch || undefined,
      type: mediaType || undefined,
      category: selectedCategory || undefined,
    });
  }, [debouncedSearch, mediaType, selectedCategory, fetchMedia]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
      });
    }
  }, []);

  const handlePlay = useCallback((item: Media) => {
    if (item.mediaType === 'audio') {
      setGlobalMedia(item);
    } else {
      setSelectedMedia(item);
      setShowPlayer(true);
    }
  }, [setGlobalMedia]);

  const handleClosePlayer = useCallback(() => {
    setShowPlayer(false);
    setSelectedMedia(null);
  }, []);

  const scrollToBrowse = useCallback(() => {
    document.getElementById('browse-section')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const trendingMedia = media.slice(0, 4);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-20 pb-32"
        onMouseMove={handleMouseMove}
      >
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-pattern opacity-40" />
        
        {/* Dynamic Background Elements */}
        <div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] animate-pulse"
          style={{ transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)` }}
        />
        <div
          className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: '-2s', transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px)` }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-purple-500/5 to-transparent pointer-events-none" />
        
        <div className="w-full px-8 sm:px-12 relative">
          <div className={`transition-all duration-1000 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="flex flex-col items-start text-left lg:max-w-4xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full glass-morphism text-sm font-semibold border-white/10 hover:scale-105 transition-transform duration-500 cursor-default shadow-xl">

                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">The Next Generation of Streaming</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 tracking-tighter leading-[0.9]">
                <span className="block text-foreground drop-shadow-2xl">LISTEN TO</span>
                <span className="gradient-text-animated block filter drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">EVERYTHING.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                Unlock millions of tracks, high-fidelity audio, and exclusive content. 
                Your journey into sound starts here.
              </p>
              
              {!isAuthenticated && freePlaysRemaining !== null && (
                <div className="group relative mb-12">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                  <div className="relative inline-flex items-center gap-3 bg-background/80 backdrop-blur-md border border-amber-500/30 px-6 py-3 rounded-full text-sm font-bold shadow-2xl">
                    <Crown className="h-4 w-4 text-amber-500 animate-bounce" />
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                      {freePlaysRemaining} Free Credits Available
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-16 px-10 text-lg font-bold btn-gradient text-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 group"
                  onClick={scrollToBrowse}
                >
                  <Play className="h-6 w-6 mr-3 text-white fill-white group-hover:scale-110 transition-transform" />
                  Get Started
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-16 px-10 text-lg font-bold glass-morphism rounded-2xl border-white/10 hover:bg-white/5 hover:scale-105 active:scale-95 transition-all duration-300"
                  onClick={scrollToBrowse}
                >
                  Browse Library
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-12 mt-24 w-full max-w-3xl">
                {[
                  { label: 'High-Fidelity Tracks', value: '50M+', icon: Music, color: 'text-purple-500' },
                  { label: 'Active Listeners', value: '12M+', icon: TrendingUp, color: 'text-pink-500' },
                  { label: 'Premium Artists', value: '100K+', icon: Crown, color: 'text-amber-500', className: 'col-span-2 md:col-span-1' },
                ].map((stat, i) => (
                  <div key={i} className={cn(
                    "relative group animate-slide-up",
                    stat.className
                  )} style={{ animationDelay: `${700 + i * 100}ms`, animationFillMode: 'both' }}>
                    <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <stat.icon className={cn("h-6 w-6 mx-auto mb-4", stat.color)} />
                    <div className="text-4xl font-black tracking-tighter mb-1">{stat.value}</div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToBrowse}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 group flex flex-col items-center gap-4 transition-all duration-500 hover:translate-y-2"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground group-hover:text-purple-500 transition-colors">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center p-1 group-hover:border-purple-500/50 transition-colors">
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-bounce group-hover:bg-purple-500 transition-colors" />
          </div>
        </button>
      </div>

      {/* Trending Section */}
      <div ref={trendingRef} className="px-8 sm:px-12 py-24 relative">
        <div className="absolute top-0 left-12 w-px h-24 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent" />
        
        <div className={`flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 transition-all duration-1000 ${trendingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-500 font-bold uppercase tracking-widest text-xs">
              <TrendingUp className="h-4 w-4" />
              <span>What's Hot</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">TRENDING <span className="text-muted-foreground/30 text-2xl md:text-3xl">NOW</span></h2>
            <p className="text-muted-foreground font-medium">Discover the most played tracks and videos of the week.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {trendingMedia.map((item, i) => (
            <div
              key={item.id}
              className={`transition-all duration-1000 ease-out ${trendingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <MediaCard media={item} onPlay={handlePlay} />
            </div>
          ))}
        </div>
      </div>

      {/* Browse Section */}
      <div id="browse-section" className="px-8 sm:px-12 py-12">
        <div className="relative glass-morphism rounded-[2.5rem] p-8 md:p-12 overflow-hidden border-white/5 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-pink-600/5" />
          
          <div className="relative flex flex-col items-start text-left mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">EXPLORE <span className="gradient-text">CATALOG</span></h2>
            <p className="text-muted-foreground max-w-xl font-medium">Filter through our extensive library by type, category, or search.</p>
          </div>

          <div className="relative space-y-12">
            {/* Advanced Search Bar */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity duration-500" />
              <div className="relative flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
                  <Input
                    placeholder="Search for tracks, artists, or genres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-16 pl-14 pr-6 bg-background/50 backdrop-blur-xl border-white/10 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-muted hover:bg-muted-foreground/10 text-xs font-bold transition-colors"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
                
                <Tabs value={mediaType} onValueChange={(v) => { setMediaType(v); setSelectedCategory(''); }} className="w-full md:w-auto">
                  <TabsList className="h-16 bg-background/50 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 w-full shadow-inner">
                    <TabsTrigger value="" className="px-8 h-full font-bold data-[state=active]:bg-foreground data-[state=active]:text-background rounded-xl transition-all">
                      ALL
                    </TabsTrigger>
                    <TabsTrigger value="audio" className="px-8 h-full font-bold data-[state=active]:bg-foreground data-[state=active]:text-background rounded-xl transition-all">
                      MUSIC
                    </TabsTrigger>
                    <TabsTrigger value="video" className="px-8 h-full font-bold data-[state=active]:bg-foreground data-[state=active]:text-background rounded-xl transition-all">
                      VIDEO
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Premium Category Filter */}
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border shadow-sm",
                    !selectedCategory
                      ? "bg-foreground text-background border-foreground shadow-purple-500/20"
                      : "bg-background/50 backdrop-blur-md border-white/10 text-muted-foreground hover:text-foreground hover:bg-background"
                  )}
                >
                  All Genres
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border shadow-sm",
                      selectedCategory === cat
                        ? "bg-purple-500 text-white border-purple-500 shadow-purple-500/40"
                        : "bg-background/50 backdrop-blur-md border-white/10 text-muted-foreground hover:text-foreground hover:bg-background"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Results Section */}
            <div className="pt-8">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="space-y-4 animate-pulse">
                      <div className="aspect-square bg-muted rounded-3xl" />
                      <div className="space-y-2 px-1">
                        <div className="h-5 bg-muted rounded-full w-3/4" />
                        <div className="h-4 bg-muted rounded-full w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : media.length === 0 ? (
                <div className="text-center py-32 space-y-6">
                  <div className="relative inline-flex h-24 w-24 rounded-3xl bg-muted/30 items-center justify-center animate-float">
                    <Music className="h-10 w-10 text-muted-foreground/30" />
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border-4 border-muted flex items-center justify-center">
                      <Search className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tighter uppercase">No Sound Found</h3>
                    <p className="text-muted-foreground font-medium">Try adjusting your filters or search keywords.</p>
                  </div>
                  <Button
                    variant="link"
                    onClick={() => { setSearchQuery(''); setMediaType(''); setSelectedCategory(''); }}
                    className="text-purple-500 font-bold hover:no-underline"
                  >
                    RESET ALL FILTERS
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-sm font-bold text-muted-foreground tracking-widest uppercase">
                      {media.length} Result{media.length !== 1 ? 's' : ''} Found
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                    {media.map((item, i) => (
                      <div
                        key={item.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                      >
                        <MediaCard media={item} onPlay={handlePlay} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="px-8 sm:px-12 py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className={`text-left mb-24 space-y-4 transition-all duration-1000 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-purple-500 font-bold uppercase tracking-[0.3em] text-xs">Features</div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
            WHY <span className="gradient-text">MUSICSTREAM</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl font-medium text-lg">
            Experience the next evolution of music streaming with features designed for the ultimate listening experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {[
            {
              icon: Crown,
              title: 'Lossless Audio',
              description: 'Crystal clear, high-fidelity audio up to 24-bit/192kHz for the most discerning ears.',
              gradient: 'from-amber-500 to-orange-500',
              delay: 0,
            },
            {
              icon: Zap,
              title: 'Zero Latency',
              description: 'Instant playback with our global edge network. No buffering, just pure sound.',
              gradient: 'from-purple-500 to-pink-500',
              delay: 150,
            },
            {
              icon: Video,
              title: 'Visual Albums',
              description: 'Immerse yourself in high-definition music videos and exclusive live performances.',
              gradient: 'from-red-500 to-rose-500',
              delay: 300,
            },
          ].map((feature, i) => (
            <div
              key={i}
              className={`group relative p-10 rounded-[2.5rem] bg-card/50 backdrop-blur-xl border border-border/50 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${feature.delay}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] rounded-[2.5rem] transition-opacity duration-500`} />
              
              <div className={`relative inline-flex p-5 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-8 shadow-lg shadow-purple-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-black tracking-tight mb-4 group-hover:text-purple-500 transition-colors">{feature.title}</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">{feature.description}</p>
              
              <div className="mt-8 pt-6 border-t border-border/20 flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground/50 group-hover:text-purple-500 transition-colors">
                Learn More
                <ArrowDown className="ml-2 h-3 w-3 -rotate-90 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMedia?.mediaType === 'video' ? (
        <VideoPlayer
          media={selectedMedia}
          isOpen={showPlayer}
          onClose={handleClosePlayer}
        />
      ) : null}
    </div>
  );
}
