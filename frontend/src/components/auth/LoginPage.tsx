import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>;
  schoolName?: string;
  festName?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, schoolName = 'Hidaya School', festName = 'English Fest' }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onLogin(username, password);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{schoolName}</h1>
          <p className="text-sm text-slate-500">{festName} Management Portal</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Username / Email</label>
          <input className="w-full px-3 py-2 border rounded-xl" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
          <input type="password" className="w-full px-3 py-2 border rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button disabled={loading} className="w-full px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold">
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};
