'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, user } = useUser();
  const router = useRouter();

  // If user is already logged in, send them to dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Log in using the central Context function
        const result = await login(email, password, rememberMe);
        if (result.success) {
          router.push('/dashboard');
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        // Sign up logic
        const res = await fetch('http://localhost:5000/api/v1/users/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, isLogin: false }),
          credentials: 'include',
        });

        const data = await res.json();
        if (res.ok) {
          setError("Verification email sent! Check your inbox.");
        } else {
          setError(data.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError("Cannot connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-black pointer-events-none" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full space-y-8 bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10">
        <div>
          <h2 className="text-center text-3xl font-bold text-white">{isLogin ? 'Welcome back' : 'Create an account'}</h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-violet-400 hover:text-violet-300 outline-none">
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`text-sm p-3 rounded-lg text-center ${error.includes('sent') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {!isLogin && (
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 border border-white/10 bg-black/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-violet-500" />
            )}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-white/10 bg-black/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-violet-500" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-white/10 bg-black/50 rounded-xl text-white outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

          <div className="flex items-center">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 accent-violet-500 rounded" />
            <label className="ml-2 text-sm text-zinc-400">Remember me</label>
          </div>

          <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 rounded-xl text-white bg-violet-600 hover:bg-violet-500 transition-all disabled:opacity-50">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign in' : 'Create account')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}