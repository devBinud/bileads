import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, Lock, Eye, EyeOff, Zap, Target, TrendingUp, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const messages = {
        'auth/user-not-found':    'No account found with this email.',
        'auth/wrong-password':    'Incorrect password.',
        'auth/invalid-email':     'Invalid email address.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
        'auth/invalid-credential':'Invalid email or password.',
      };
      toast.error(messages[err.code] || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">

      {/* Card container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl shadow-violet-100 overflow-hidden flex min-h-[560px]">

        {/* ── Left Panel ─────────────────────────────────────────── */}
        <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800 p-10 flex-col justify-between relative overflow-hidden">

          {/* Background decorative circles */}
          <div className="absolute top-[-60px] right-[-60px] w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 bg-white/10 rounded-full" />
          <div className="absolute top-[40%] right-[-30px] w-32 h-32 bg-purple-500/30 rounded-full" />

          {/* Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <img src="/logo192.png" alt="BiLeads" className="w-10 h-10 rounded-xl" />
              <span className="text-white font-bold text-xl tracking-tight">BiLeads</span>
            </div>

            <h1 className="text-white text-3xl font-bold leading-tight mb-3">
              Welcome back
            </h1>
            <p className="text-violet-200 text-sm leading-relaxed">
              Your private client acquisition engine. Find local businesses that need a website and contact them in minutes.
            </p>
          </div>

          {/* Feature pills */}
          <div className="relative z-10 space-y-3">
            {[
              { icon: Target,     text: 'Smart lead scoring 0–100' },
              { icon: TrendingUp, text: 'Google Maps scraper built-in' },
              { icon: Users,      text: 'Track outreach & follow-ups' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-white/90 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Bottom tag */}
          <div className="relative z-10">
            <p className="text-violet-300 text-xs">Private system · Authorized access only</p>
          </div>
        </div>

        {/* ── Right Panel ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 md:hidden">
            <img src="/logo192.png" alt="BiLeads" className="w-9 h-9 rounded-xl" />
            <span className="font-bold text-slate-800 text-lg">
              Bi<span className="text-violet-600">Leads</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Sign in to your account</h2>
            <p className="text-slate-500 text-sm mt-1.5">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 focus:bg-white placeholder-slate-400 transition-all"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 pl-10 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 focus:bg-white placeholder-slate-400 transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-violet-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">PRIVATE SYSTEM</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Info note */}
          <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 flex items-start gap-3">
            <div className="w-6 h-6 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Zap className="w-3 h-3 text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-violet-700">Authorized access only</p>
              <p className="text-xs text-violet-500 mt-0.5">This system is private. Only your account can log in.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
