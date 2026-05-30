import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Loader2, Eye, EyeOff, Check, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;
    if (!username.trim() || !email.trim() || !password.trim()) return;
    try {
      await register(username, email, password);
      toast({ title: 'Account created!', description: 'Welcome to MusicStream.', variant: 'success' });
      navigate('/');
    } catch {
      // Error is handled in store
    }
  }, [username, email, password, confirmPassword, register, navigate]);

  const passwordMatch = password === confirmPassword || !confirmPassword;

  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabel = strength <= 2 ? 'Weak' : strength <= 4 ? 'Good' : 'Strong';
  const strengthColor = strength <= 2 ? 'bg-red-500' : strength <= 4 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern" />
      
      <div className="absolute top-20 right-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      <div className="relative w-full max-w-md mx-4 animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-3xl blur-xl" />
        
        <div className="relative p-8 rounded-3xl bg-background/80 backdrop-blur-xl border border-border shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-violet-500 flex items-center justify-center shadow-xl shadow-pink-500/30 animate-pulse-glow">
                <Music className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-30" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join MusicStream today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20 animate-shake flex items-center gap-2">
                <span className="flex-1">{error}</span>
                <button onClick={clearError} className="text-destructive/70 hover:text-destructive">✕</button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                id="username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearError(); }}
                placeholder="Choose a username"
                className="h-12 bg-muted/50 border-border focus:border-purple-500 input-glow transition-all"
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                placeholder="Enter your email"
                className="h-12 bg-muted/50 border-border focus:border-purple-500 input-glow transition-all"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="Create a password"
                  className="h-12 bg-muted/50 border-border focus:border-purple-500 input-glow pr-12 transition-all"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColor : 'bg-muted'}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs" style={{ color: strength <= 2 ? '#ef4444' : strength <= 4 ? '#eab308' : '#22c55e' }}>
                      {strengthLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">Use 8+ chars with mixed case, numbers & symbols</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className={`h-12 bg-muted/50 border-border focus:border-purple-500 input-glow transition-all ${
                    !passwordMatch ? 'border-destructive' : confirmPassword ? 'border-green-500' : ''
                  }`}
                  required
                  autoComplete="new-password"
                />
                {confirmPassword && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {passwordMatch ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-destructive animate-shake" />
                    )}
                  </div>
                )}
              </div>
              {!passwordMatch && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <span>Passwords do not match</span>
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 btn-gradient text-white text-base font-semibold shadow-lg shadow-purple-500/25 group"
              disabled={isLoading || !passwordMatch || !username.trim() || !email.trim() || !password.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link
              to="/login"
              className="font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <p className="text-sm font-medium mb-3 text-center">What you get</p>
            <div className="space-y-2 text-sm">
              {[
                'Unlimited music streaming',
                'Create your own playlists',
                'Access to exclusive content',
                'Ad-free experience',
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{benefit}</span>
                </div>
              ))}
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
