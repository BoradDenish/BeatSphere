import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard, 
  Shield, 
  Music, 
  Video, 
  Compass, 
  Library,
  PlusCircle,
  Heart,
  History
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const location = useLocation();
  const { user, isAuthenticated, subscription } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const mainLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Browse', path: '/#browse-section', icon: Compass },
  ];

  const personalLinks = [
    ...(isAuthenticated ? [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Library', path: '/library', icon: Library },
      { name: 'Favorites', path: '/favorites', icon: Heart },
      { name: 'History', path: '/history', icon: History },
    ] : []),
    ...(user?.role === 'admin' ? [{ name: 'Admin Panel', path: '/admin', icon: Shield }] : []),
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 bg-background/50 backdrop-blur-3xl border-r border-border/50 z-40 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
      
      {/* Brand */}
      <div className="p-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:rotate-12 transition-all duration-500">
              <Music className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
          </div>
          <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            MusicStream
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 no-scrollbar">
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4">Menu</p>
          {mainLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group",
                isActive(link.path)
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <link.icon className={cn("h-5 w-5", isActive(link.path) ? "" : "group-hover:scale-110 transition-transform")} />
              {link.name}
            </Link>
          ))}
        </div>

        {/* Library / Personal */}
        {isAuthenticated && (
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4">Library</p>
            {personalLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group",
                  isActive(link.path)
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <link.icon className={cn("h-5 w-5", isActive(link.path) ? "" : "group-hover:scale-110 transition-transform")} />
                {link.name}
              </Link>
            ))}
          </div>
        )}

        {/* Categories / Quick Actions */}
        <div className="space-y-1">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4">Discover</p>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300 group">
            <Music className="h-5 w-5 group-hover:text-purple-500 transition-colors" />
            Top Music
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300 group">
            <Video className="h-5 w-5 group-hover:text-pink-500 transition-colors" />
            New Videos
          </button>
        </div>
      </div>

      {/* Upgrade Banner */}
      {!subscription && (
        <div className="p-6">
          <div className="relative group p-6 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="relative space-y-4">
              <p className="text-white font-black text-sm">UPGRADE TO PREMIUM</p>
              <p className="text-white/80 text-xs leading-relaxed">Unlock ad-free listening and high-fidelity sound.</p>
              <Link to="/subscribe" className="block text-center py-2 bg-white text-purple-600 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all">
                LEARN MORE
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer minimal info */}
      <div className="p-8 border-t border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            {isAuthenticated ? (
              <span className="font-bold text-purple-500">{user?.username[0].toUpperCase()}</span>
            ) : (
              <PlusCircle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">
              {isAuthenticated ? user?.username : 'Guest User'}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {isAuthenticated ? user?.role : 'Sign in to sync'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
