import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Loader2, Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    try {
      await login(username, password);
      toast({ title: 'Welcome back!', description: 'Successfully signed in.', variant: 'success' });
      navigate('/');
    } catch {
      // Error is handled in store
    }
  }, [username, password, login, navigate]);

  const fillDemo = useCallback((user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8">
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern" />
      
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      <div className="relative w-full max-w-md mx-4 animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl" />
        
        <div className="relative p-8 rounded-3xl bg-background/80 backdrop-blur-xl border border-border shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-xl shadow-purple-500/30 animate-pulse-glow">
                <Music className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your MusicStream account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20 animate-shake flex items-center gap-2">
                <span className="flex-1">{error}</span>
                <button onClick={clearError} className="text-destructive/70 hover:text-destructive">
                  ✕
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <div className="relative group">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    clearError();
                  }}
                  placeholder="Enter your username"
                  className="h-12 bg-muted/50 border-border focus:border-purple-500 input-glow transition-all"
                  required
                  autoComplete="username"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-focus-within:opacity-10 pointer-events-none transition-opacity" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  placeholder="Enter your password"
                  className="h-12 bg-muted/50 border-border focus:border-purple-500 input-glow pr-12 transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 btn-gradient text-white text-base font-semibold shadow-lg shadow-purple-500/25 group"
              disabled={isLoading || !username.trim() || !password.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link
              to="/register"
              className="font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Sign up
            </Link>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <p className="text-sm font-medium mb-3 text-center">Demo Accounts (click to fill)</p>
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemo('admin', '123')}
                className="flex justify-between items-center w-full p-2 rounded-lg bg-background/50 hover:bg-purple-500/10 transition-colors cursor-pointer"
              >
                <span className="text-muted-foreground">Admin:</span>
                <code className="text-purple-500 font-mono">admin / 123</code>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('john_doe', 'password123')}
                className="flex justify-between items-center w-full p-2 rounded-lg bg-background/50 hover:bg-purple-500/10 transition-colors cursor-pointer"
              >
                <span className="text-muted-foreground">User:</span>
                <code className="text-purple-500 font-mono">john_doe / password123</code>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
