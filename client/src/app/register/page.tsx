'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register, clearError } from '@/store/slices/authSlice';
import { AppDispatch, RootState } from '@/store/store';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Message from '@/components/Message';
import { showToast } from '@/utils/toast';
import { Toaster } from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState('');

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

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      setMessage('Passwords do not match');
      return;
    }

    setMessage('');
    dispatch(register({ name, email, password, isAdmin }));
    showToast('Registration successful! Redirecting...', 'success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground animate-fadeIn">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="glass-card border border-card-border rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            {/* Ambient glow decoration */}
            <div className="absolute top-0 right-1/4 -translate-y-1/2 w-48 h-48 bg-primary-indigo/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold mb-2 text-center text-white tracking-tight">
                Create Account
              </h1>
              <p className="text-text-muted text-center text-sm mb-8">
                Join us today to access exclusive products
              </p>

              {message && <Message variant="error">{message}</Message>}
              {error && <Message variant="error">{error}</Message>}

              <form onSubmit={submitHandler} className="space-y-5">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200"
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200"
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="password">
                    Password
                  </label>
                  <input
                    className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200"
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all duration-200"
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Admin Registration Checkbox */}
                <div className="p-4 bg-background/50 border border-card-border rounded-2xl space-y-2">
                  <label className="flex items-center cursor-pointer select-none">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isAdmin}
                        onChange={(e) => setIsAdmin(e.target.checked)}
                        className="sr-only"
                        id="isAdmin"
                      />
                      <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${isAdmin ? 'bg-primary-indigo border-primary-indigo' : 'border-card-border bg-background'}`}>
                        {isAdmin && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-3 text-sm font-semibold text-gray-200">
                      Register as Administrator
                    </span>
                  </label>
                  <p className="text-xs text-text-muted leading-relaxed pl-8">
                    Note: Administrator accounts have access to special store operations and management dashboards.
                  </p>
                </div>

                <button
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md shadow-indigo-500/25 active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center gap-2 mt-4"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Registering...
                    </>
                  ) : (
                    'Register'
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-card-border/60 text-center">
                <p className="text-text-muted text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary-indigo hover:text-indigo-400 font-semibold transition-colors">
                    Sign In
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