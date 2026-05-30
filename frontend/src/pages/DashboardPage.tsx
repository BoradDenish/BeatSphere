import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Music,
  Video,
  Crown,
  Upload,
  Trash2,
  Play,
  TrendingUp,
  Calendar,
  BarChart3,
  AlertTriangle,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { MediaCard } from '@/components/shared/MediaCard';
import { VideoPlayer } from '@/components/shared/VideoPlayer';
import { UploadForm } from '@/components/shared/UploadForm';
import { useAuthStore } from '@/stores/authStore';
import { useMusicStore, Media } from '@/stores/musicStore';
import { usePlayerStore } from '@/stores/playerStore';
import { formatPlays, formatDuration, cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export function DashboardPage() {
  const { user, subscription } = useAuthStore();
  const { media, fetchMedia, deleteMedia, isLoading } = useMusicStore();
  const { setMedia: setGlobalMedia } = usePlayerStore();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchMedia({ userId: user.id, limit: 50 });
    }
  }, [user, fetchMedia]);

  const userMedia = media.filter((m) => m.userId === user?.id);

  const handlePlay = useCallback((item: Media) => {
    if (item.mediaType === 'audio') {
      setGlobalMedia(item);
    } else {
      setSelectedMedia(item);
      setShowPlayer(true);
    }
  }, [setGlobalMedia]);

  const handleDelete = useCallback(async (id: number) => {
    await deleteMedia(id);
    setDeleteConfirm(null);
    toast({
      title: 'Deleted',
      description: 'Media item has been removed.',
      variant: 'destructive',
    });
  }, [deleteMedia]);

  const handleUploadSuccess = useCallback(() => {
    setShowUploadDialog(false);
    toast({
      title: 'Upload successful!',
      description: 'Your media has been published.',
      variant: 'success',
    });
    if (user) {
      fetchMedia({ userId: user.id, limit: 50 });
    }
  }, [user, fetchMedia]);

  const audioCount = userMedia.filter((m) => m.mediaType === 'audio').length;
  const videoCount = userMedia.filter((m) => m.mediaType === 'video').length;
  const totalPlays = userMedia.reduce((sum, m) => sum + m.plays, 0);
  const totalDuration = userMedia.reduce((sum, m) => sum + (m.duration || 0), 0);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute inset-0 hero-gradient opacity-60" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

      <div className="relative px-8 sm:px-12 pt-12 pb-24">
        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16 animate-slide-up">

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-500 font-bold uppercase tracking-widest text-xs">
              <LayoutDashboard className="h-4 w-4" />
              <span>Personal Workspace</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
              HELLO, <span className="gradient-text uppercase">{user?.username}</span>
            </h1>
            <p className="text-muted-foreground font-medium text-lg">
              Manage your creations and monitor your performance.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {subscription ? (
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative flex items-center gap-3 px-6 py-3 rounded-2xl bg-background/50 backdrop-blur-xl border border-amber-500/30">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">Active Plan</p>
                    <p className="font-bold text-sm">{subscription.plan.toUpperCase()} MEMBER</p>
                  </div>
                </div>
              </div>
            ) : (
              <Button variant="outline" asChild className="h-14 px-8 rounded-2xl glass-morphism border-white/10 hover:bg-white/5 font-bold group">
                <Link to="/subscribe" className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
                  GO PREMIUM
                </Link>
              </Button>
            )}
            
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button className="h-14 px-8 rounded-2xl btn-gradient text-white font-bold shadow-xl shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all group">
                  <Upload className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform text-white" />
                  NEW UPLOAD
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-white/10 shadow-2xl glass-morphism">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black tracking-tighter">PUBLISH CONTENT</DialogTitle>
                </DialogHeader>
                <UploadForm onSuccess={handleUploadSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              label: 'Total Library',
              value: userMedia.length,
              icon: TrendingUp,
              gradient: 'from-purple-500 to-indigo-500',
              suffix: 'Items'
            },
            {
              label: 'Audio Content',
              value: audioCount,
              icon: Music,
              gradient: 'from-blue-500 to-cyan-500',
              suffix: 'Tracks'
            },
            {
              label: 'Video Library',
              value: videoCount,
              icon: Video,
              gradient: 'from-rose-500 to-pink-500',
              suffix: 'Videos'
            },
            {
              label: 'Global Impact',
              value: formatPlays(totalPlays),
              icon: Play,
              gradient: 'from-amber-500 to-orange-500',
              suffix: 'Plays'
            },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="group relative animate-slide-up"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
            >
              <div className={cn(
                "absolute -inset-0.5 bg-gradient-to-br rounded-[2rem] blur opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                stat.gradient
              )} />
              <div className="relative h-full p-8 rounded-[2rem] bg-card/50 backdrop-blur-xl border border-border/50 overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-500">
                <div className={cn(
                  "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full -translate-y-1/2 translate-x-1/2",
                  stat.gradient
                )} />
                
                <div className="flex flex-col justify-between h-full gap-8">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500",
                    stat.gradient
                  )}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div>
                    <div className="text-4xl font-black tracking-tighter mb-1">{stat.value}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      <span className={cn(
                        "text-[8px] font-black px-2 py-0.5 rounded-full border border-border/50",
                        stat.gradient.replace('from-', 'text-').split(' ')[0]
                      )}>{stat.suffix}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="relative group p-1 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
            <div className="flex items-center gap-6 p-8 rounded-[1.4rem] bg-background/80 backdrop-blur-xl border border-white/5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1">Engagement Rate</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black tracking-tighter">
                    {userMedia.length > 0 ? Math.round(totalPlays / userMedia.length) : 0}
                  </p>
                  <span className="text-sm font-bold text-muted-foreground uppercase">Avg Plays / Track</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group p-1 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
            <div className="flex items-center gap-6 p-8 rounded-[1.4rem] bg-background/80 backdrop-blur-xl border border-white/5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">Time Invested</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black tracking-tighter">
                    {formatDuration(totalDuration)}
                  </p>
                  <span className="text-sm font-bold text-muted-foreground uppercase">Total Airtime</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Uploads Section with Enhanced Table/Grid */}
        <div className="relative rounded-[2.5rem] bg-card/30 backdrop-blur-md border border-border/50 overflow-hidden animate-slide-up shadow-2xl" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
          
          <div className="px-8 py-8 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-purple-500 rounded-full" />
              <h2 className="text-2xl font-black tracking-tighter uppercase">Content Library</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">Recent</Button>
              <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">Popular</Button>
            </div>
          </div>

          <div className="p-8">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-4 animate-pulse">
                    <div className="aspect-square bg-muted rounded-3xl" />
                    <div className="h-5 bg-muted rounded-full w-3/4" />
                  </div>
                ))}
              </div>
            ) : userMedia.length === 0 ? (
              <div className="text-center py-32 space-y-8">
                <div className="relative inline-flex h-28 w-28 rounded-[2rem] bg-muted/30 items-center justify-center animate-float">
                  <Upload className="h-12 w-12 text-muted-foreground/30" />
                  <div className="absolute -inset-4 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
                </div>
                <div className="max-w-sm mx-auto space-y-2">
                  <h3 className="text-2xl font-black tracking-tighter uppercase">Your library is silent</h3>
                  <p className="text-muted-foreground font-medium">Share your first track or video and start building your audience today.</p>
                </div>
                <Button onClick={() => setShowUploadDialog(true)} className="h-14 px-10 rounded-2xl btn-gradient text-white font-bold shadow-xl shadow-purple-500/20">
                  <Plus className="h-5 w-5 mr-2" />
                  START UPLOADING
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {userMedia.map((item, i) => (
                  <div key={item.id} className="relative group animate-slide-up" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                    <MediaCard media={item} onPlay={handlePlay} />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl scale-75 group-hover:scale-100 rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(item.id);
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this item? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedMedia?.mediaType === 'video' ? (
        <VideoPlayer
          media={selectedMedia}
          isOpen={showPlayer}
          onClose={() => {
            setShowPlayer(false);
            setSelectedMedia(null);
          }}
        />
      ) : null}
    </div>
  );
}
