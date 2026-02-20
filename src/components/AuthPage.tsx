import { useState } from 'react';
import { ChefHat, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { signIn, signUp } from '@/lib/auth-service';

interface AuthPageProps {
  onAuth: () => void;
}

const AuthPage = ({ onAuth }: AuthPageProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signup') {
        await signUp(email.trim(), password);
        setSuccessMsg('Account created! You can now set up your profile.');
        setTimeout(() => onAuth(), 1000);
      } else {
        await signIn(email.trim(), password);
        onAuth();
      }
    } catch (err: any) {
      // Make Supabase error messages friendlier
      const msg = err?.message ?? 'Something went wrong. Try again.';
      if (msg.includes('Invalid login credentials')) {
        setError('Wrong email or password. Try again!');
      } else if (msg.includes('already registered')) {
        setError('This email is already registered. Try logging in!');
      } else if (msg.includes('valid email')) {
        setError('Please enter a valid email address.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top coral blob */}
      <div className="relative overflow-hidden">
        <div className="gradient-coral px-6 pt-16 pb-24 rounded-b-[3rem]">
          {/* Decorative circles */}
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute top-16 right-12 w-16 h-16 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 left-8 w-20 h-20 rounded-full bg-white/10" />

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-5 backdrop-blur-sm">
              <ChefHat className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">CraveCare</h1>
            <p className="text-white/80 text-sm">
              {mode === 'login'
                ? 'Welcome back, queen! 👋'
                : 'Join thousands of hostel queens eating smarter 💪'}
            </p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 px-6 -mt-8 relative z-10">
        <div className="bg-card rounded-3xl border border-border shadow-xl p-6">
          {/* Mode toggle */}
          <div className="flex bg-muted rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'login' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'signup' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                  className="w-full pl-10 pr-11 py-3.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error / success */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-sage/10 border border-sage/30 rounded-xl px-4 py-3 text-sm text-sage font-medium">
                ✅ {successMsg}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-2xl gradient-coral text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity mt-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Log In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Fine print */}
        <p className="text-xs text-muted-foreground text-center mt-5 px-4">
          {mode === 'signup'
            ? 'By signing up, your data is saved securely so you never lose your tokens or streak 🔒'
            : 'Your tokens, streaks, and cheat days are waiting for you 🎉'}
        </p>
      </div>

      {/* Bottom safe area */}
      <div className="h-10" />
    </div>
  );
};

export default AuthPage;