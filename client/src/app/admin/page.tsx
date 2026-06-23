'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { getUsers } from '@/store/slices/adminSlice';
import { fetchProducts } from '@/store/slices/productSlice';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.admin);
  const { products } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(getUsers());
    dispatch(fetchProducts({}));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground animate-fadeIn">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="max-w-6xl mx-auto">
            <Loader variant="table" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen flex flex-col bg-background text-foreground animate-fadeIn">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-extrabold mb-8 text-white tracking-tight">Admin Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Users Card */}
              <div className="bg-card border border-card-border rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-primary-indigo/40 transition-all duration-300">
                <div className="absolute top-0 right-0 translate-x-6 -translate-y-6 w-24 h-24 bg-primary-indigo/5 rounded-full blur-xl group-hover:bg-primary-indigo/10 transition-colors"></div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-bold text-white tracking-tight">Users</h2>
                  <span className="w-8 h-8 rounded-xl bg-primary-indigo/10 text-primary-indigo font-bold flex items-center justify-center text-sm">👥</span>
                </div>
                <p className="text-4xl font-black text-primary-indigo mb-4 tracking-tight">{users.length}</p>
                <Link href="/admin/users" className="text-xs text-text-muted hover:text-white font-bold tracking-wider uppercase transition-colors flex items-center gap-1">
                  Manage Users <span>→</span>
                </Link>
              </div>

              {/* Products Card */}
              <div className="bg-card border border-card-border rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-accent-emerald/40 transition-all duration-300">
                <div className="absolute top-0 right-0 translate-x-6 -translate-y-6 w-24 h-24 bg-accent-emerald/5 rounded-full blur-xl group-hover:bg-accent-emerald/10 transition-colors"></div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-bold text-white tracking-tight">Products</h2>
                  <span className="w-8 h-8 rounded-xl bg-accent-emerald/10 text-accent-emerald font-bold flex items-center justify-center text-sm">🛍️</span>
                </div>
                <p className="text-4xl font-black text-accent-emerald mb-4 tracking-tight">{products.length}</p>
                <Link href="/admin/products" className="text-xs text-text-muted hover:text-white font-bold tracking-wider uppercase transition-colors flex items-center gap-1">
                  Manage Products <span>→</span>
                </Link>
              </div>

              {/* Orders Card */}
              <div className="bg-card border border-card-border rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
                <div className="absolute top-0 right-0 translate-x-6 -translate-y-6 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors"></div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-bold text-white tracking-tight">Orders</h2>
                  <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 font-bold flex items-center justify-center text-sm">📦</span>
                </div>
                <p className="text-4xl font-black text-purple-400 mb-4 tracking-tight">0</p>
                <Link href="/admin/orders" className="text-xs text-text-muted hover:text-white font-bold tracking-wider uppercase transition-colors flex items-center gap-1">
                  View Orders <span>→</span>
                </Link>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/3 w-64 h-64 bg-primary-indigo/5 blur-3xl rounded-full pointer-events-none"></div>
              
              <h2 className="text-xl font-bold text-white mb-6 relative z-10 tracking-tight">Quick Operations</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <Link
                  href="/admin/products"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3.5 rounded-xl font-bold transition-all duration-200 text-center text-sm shadow-md shadow-indigo-500/20 active:scale-95"
                >
                  Manage & Add Products
                </Link>
                <Link
                  href="/admin/users"
                  className="bg-background border border-card-border hover:bg-border-dark hover:border-gray-600 text-white py-3.5 rounded-xl font-bold transition-all text-center text-sm active:scale-95 shadow-sm"
                >
                  Manage Users list
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}