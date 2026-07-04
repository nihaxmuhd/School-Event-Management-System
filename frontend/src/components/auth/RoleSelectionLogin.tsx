import React, { useState } from 'react';
import { ArrowRight, Crown, GraduationCap, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { UserRole } from '../../types/festival';

interface RoleSelectionLoginProps {
  onLogin: (payload: { username: string; password: string; role: UserRole }) => Promise<void>;
  schoolName: string;
  festName: string;
  loading?: boolean;
  error?: string | null;
}

export const RoleSelectionLogin: React.FC<RoleSelectionLoginProps> = ({
  onLogin,
  schoolName,
  festName,
  loading = false,
  error = null,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Admin');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onLogin({ username, password, role });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 py-10 text-slate-900 font-sans antialiased">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80 shadow-2xs mb-2">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>{schoolName} Internal SEMS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{festName} Login</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Sign in with your Django SimpleJWT credentials to access the event management portal.
          </p>
        </div>

        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Username</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                  autoComplete="username"
                  placeholder="Enter username"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                  autoComplete="current-password"
                  placeholder="Enter password"
                />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Route as</span>
              <div className="grid grid-cols-2 gap-2">
                {(['Super Admin', 'Admin', 'Manager', 'Team Leader'] as UserRole[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRole(item)}
                    className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition-all ${
                      role === item
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </label>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{loading ? 'Signing in...' : 'Login with JWT'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Hidaya School Event Management System • Internal MVP 2026</span>
        </div>
      </div>
    </div>
  );
};
