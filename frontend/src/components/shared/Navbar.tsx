import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Music, LogOut, Shield, Menu, X, ChevronDown, LayoutDashboard, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    ...(isAuthenticated ? [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }] : []),
    ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin', icon: Shield }] : []),
  ];

  return (
    <nav className={cn(
      "sticky top-0 z-50 transition-all duration-500",
      scrolled 
        ? "bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm py-2" 
        : "bg-transparent py-4"
    )}>
      <div className="w-full px-4 sm:px-8">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Brand Only */}
            <Link to="/" className="flex lg:hidden items-center gap-2 group shrink-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                <Music className="h-4 w-4 text-white" />
              </div>
            </Link>
            
            {/* Navigation Context or Search */}
            <div className="hidden lg:block">
              <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/50">
                {location.pathname === '/' ? 'Home' : location.pathname.substring(1).toUpperCase()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full glass-morphism border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-inner group-hover:scale-110 transition-transform">
                    {user?.username[0].toUpperCase()}
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-300",
                    showUserMenu ? "rotate-180" : ""
                  )} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 py-3 rounded-2xl bg-background/90 backdrop-blur-xl border border-border shadow-2xl animate-scale-in origin-top-right overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 pointer-events-none" />
                    <div className="relative px-5 py-3 border-b border-border/50">
                      <p className="font-bold text-base truncate">{user?.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <div className="relative py-2">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-purple-500/10 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <LayoutDashboard className="h-4 w-4 text-purple-500" />
                        </div>
                        <span className="font-medium">Dashboard</span>
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-purple-500/10 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-rose-500" />
                          </div>
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                      )}
                    </div>
                    <div className="relative border-t border-border/50 pt-2 px-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex hover:bg-purple-500/10 px-4 rounded-full">
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild className="btn-gradient text-white shadow-lg shadow-purple-500/25 px-6 rounded-full">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 rounded-full hover:bg-purple-500/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4 space-y-2 animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-colors",
                  isActive(link.path)
                    ? "bg-purple-500/10 text-purple-500"
                    : "hover:bg-muted"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="h-5 w-5" />
                {link.name}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" asChild className="rounded-xl h-12">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                </Button>
                <Button asChild className="btn-gradient text-white rounded-xl h-12">
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
