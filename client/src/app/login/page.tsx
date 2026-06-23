'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, clearError } from '@/store/slices/authSlice';
import { AppDispatch, RootState } from '@/store/store';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Message from '@/components/Message';
import { showToast } from '@/utils/toast';
import { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { loading, error, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ email, password }));
    showToast('Signing in...', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground animate-fadeIn">
      <Header />
      <main className="container mx-auto px-4 py-16 flex-grow flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="glass-card border border-card-border rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Ambient background glow effect inside the card */}
            <div className="absolute top-0 left-1/4 -translate-y-1/2 w-48 h-48 bg-primary-indigo/10 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold mb-2 text-center text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="text-text-muted text-center text-sm mb-8">
                Sign in to your account to continue shopping
              </p>
              
              {error && <Message variant="error">{error}</Message>}
              
              <form onSubmit={submitHandler} className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    className="w-full px-4 py-3 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200"
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-300 text-sm font-semibold" htmlFor="password">
                      Password
                    </label>
                  </div>
                  <input
                    className="w-full px-4 py-3 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200"
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md shadow-indigo-500/25 active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center gap-2"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
              
              <div className="mt-8 pt-6 border-t border-card-border/60 text-center">
                <p className="text-text-muted text-sm">
                  New Customer?{' '}
                  <Link href="/register" className="text-primary-indigo hover:text-indigo-400 font-semibold transition-colors">
                    Register Now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}