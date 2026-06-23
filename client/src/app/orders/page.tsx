'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { getMyOrders } from '@/store/slices/orderSlice';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Message from '@/components/Message';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((state) => state.orders);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(getMyOrders());
    }
  }, [dispatch, user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background text-foreground animate-fadeIn">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">My Orders</h1>
              <Link
                href="/products"
                className="bg-background border border-card-border hover:bg-border-dark text-white hover:border-gray-600 px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-md cursor-pointer active:scale-95"
              >
                Continue Shopping
              </Link>
            </div>

            {loading && <Loader variant="table" />}
            {error && <Message variant="error">{error}</Message>}

            {!loading && !error && orders.length === 0 && (
              <div className="bg-card border border-card-border rounded-3xl p-8 md:p-12 text-center max-w-md mx-auto shadow-2xl mt-8">
                <div className="text-5xl mb-4">📦</div>
                <h2 className="text-xl font-bold text-white mb-2">No Orders Found</h2>
                <p className="text-text-muted text-sm mb-6 leading-relaxed">
                  You haven't placed any orders yet. Start exploring our premium product catalog.
                </p>
                <Link
                  href="/products"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-md shadow-indigo-500/25 active:scale-95 text-sm inline-block cursor-pointer"
                >
                  Start Shopping
                </Link>
              </div>
            )}

            {!loading && !error && orders.length > 0 && (
              <div className="overflow-x-auto rounded-2xl border border-card-border bg-background/50 shadow-xl">
                <table className="min-w-full divide-y divide-card-border">
                  <thead className="bg-card">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/60 bg-transparent">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-card/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                          #{order._id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                          {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-emerald font-bold">
                          ${order.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                              order.isPaid
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-950/40 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {order.isPaid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/orders/${order._id}`}
                            className="text-primary-indigo hover:text-indigo-400 font-bold transition-colors"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}