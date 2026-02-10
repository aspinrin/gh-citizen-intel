"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Shield, Lock, AlertCircle } from 'lucide-react';

// Initialize Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PoliceLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Access Denied: Invalid Credentials');
      setLoading(false);
    } else {
      // Success! Redirect to the dashboard
      router.push('/police-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-blue-900/50">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">OFFICER ACCESS</h1>
          <p className="text-slate-500 text-xs uppercase tracking-widest mt-2">Intelligence Unit Only</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-6 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Service ID (Email)</label>
            <div className="relative">
              <Shield className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="email" 
                required
                className="w-full bg-slate-950 border border-slate-800 text-white pl-10 p-3 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="officer@ghpolice.gov"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Secure Passkey</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="password" 
                required
                className="w-full bg-slate-950 border border-slate-800 text-white pl-10 p-3 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-600">
            Unauthorized access is a punishable offense under the <br/> Cybersecurity Act, 2020 (Act 1038).
          </p>
        </div>
      </div>
    </div>
  );
}