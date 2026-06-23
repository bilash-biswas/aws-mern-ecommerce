'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { getMyOrders, markOrderAsShipped, markOrderAsDelivered } from '@/store/slices/orderSlice';
import { fetchProducts } from '@/store/slices/productSlice';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Message from '@/components/Message';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const { orders, loading: ordersLoading } = useAppSelector((state) => state.orders);
  const { products, loading: productsLoading } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getMyOrders());
    dispatch(fetchProducts({}));
  }, [dispatch]);

  const handleQuickAction = async (orderId: string, action: 'ship' | 'deliver') => {
    setUpdatingOrder(orderId);
    try {
      if (action === 'ship') {
        await dispatch(markOrderAsShipped(orderId)).unwrap();
        toast.success('Order marked as shipped!');
      } else {
        await dispatch(markOrderAsDelivered(orderId)).unwrap();
        toast.success('Order marked as delivered!');
      }
    } catch (error: any) {
      toast.error(error || 'Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusBadge = (order: any) => {
    if (order.isDelivered) {
      return <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-1 rounded-lg">Delivered</span>;
    } else if (order.isShipped) {
      return <span className="bg-blue-950/40 text-blue-400 border border-blue-500/20 text-xs font-bold px-2.5 py-1 rounded-lg">Shipped</span>;
    } else if (order.isPaid) {
      return <span className="bg-amber-950/40 text-amber-400 border border-amber-500/20 text-xs font-bold px-2.5 py-1 rounded-lg">Processing</span>;
    } else {
      return <span className="bg-red-950/40 text-red-400 border border-red-500/20 text-xs font-bold px-2.5 py-1 rounded-lg">Pending Payment</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const loading = ordersLoading || productsLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground animate-fadeIn">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="max-w-6xl mx-auto space-y-8">
            <Loader variant="hero" />
            <Loader variant="table" count={3} />
          </div>
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  }

  const recentOrders = orders.slice(0, 5);
  const pendingOrders = orders.filter(order => order.isPaid && !order.isDelivered);
  const totalRevenue = orders
    .filter(order => order.isPaid)
    .reduce((sum, order) => sum + order.totalPrice, 0);

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen flex flex-col bg-background text-foreground animate-fadeIn">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Dashboard</h1>
                <p className="text-text-muted mt-1 text-sm">Welcome back, {user?.name}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/orders"
                  className="bg-background border border-card-border hover:bg-border-dark text-white hover:border-gray-600 px-4 py-2.5 rounded-xl font-bold transition-all text-sm shadow-md cursor-pointer active:scale-95"
                >
                  View All Orders
                </Link>
                <Link
                  href="/admin/products"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all text-sm shadow-md cursor-pointer active:scale-95"
                >
                  Manage Products
                </Link>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-card border border-card-border rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-primary-indigo/30 transition-all duration-200">
                <div className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wider">Total Orders</div>
                <div className="text-3xl font-black text-white tracking-tight">{orders.length}</div>
                <div className="absolute top-0 right-0 w-1.5 h-full bg-primary-indigo"></div>
              </div>
              
              <div className="bg-card border border-card-border rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-200">
                <div className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wider">Pending Orders</div>
                <div className="text-3xl font-black text-amber-400 tracking-tight">{pendingOrders.length}</div>
                <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500"></div>
              </div>
              
              <div className="bg-card border border-card-border rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-accent-emerald/30 transition-all duration-200">
                <div className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wider">Total Revenue</div>
                <div className="text-3xl font-black text-accent-emerald tracking-tight">${totalRevenue.toFixed(2)}</div>
                <div className="absolute top-0 right-0 w-1.5 h-full bg-accent-emerald"></div>
              </div>
              
              <div className="bg-card border border-card-border rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-200">
                <div className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wider">Total Products</div>
                <div className="text-3xl font-black text-purple-400 tracking-tight">{products.length}</div>
                <div className="absolute top-0 right-0 w-1.5 h-full bg-purple-500"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Recent Orders */}
              <div className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-xl lg:col-span-7">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white tracking-tight">Recent Orders</h2>
                  <Link href="/admin/orders" className="text-primary-indigo hover:text-indigo-400 text-sm font-bold transition-colors">
                    View all <span>→</span>
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 bg-background/40 hover:bg-card/40 border border-card-border/60 rounded-2xl transition-all duration-200 gap-4">
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            order.isDelivered ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                            order.isShipped ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 
                            order.isPaid ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                          }`}></div>
                          <div className="font-bold text-white text-sm truncate">#{order._id.substring(0, 8)}</div>
                        </div>
                        <div className="text-xs text-text-muted font-medium truncate pl-5">{order.user?.name}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-white text-sm">${order.totalPrice.toFixed(2)}</div>
                        <div className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-wider">{formatDate(order.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                  {recentOrders.length === 0 && (
                    <div className="text-center py-6">
                      <Message variant="info">No recent orders</Message>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions & Action Required */}
              <div className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-xl lg:col-span-5 flex flex-col justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight mb-6">Operations Panel</h2>
                  <div className="grid grid-cols-1 gap-3">
                    <Link
                      href="/admin/products"
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 text-center text-sm shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer block"
                    >
                      Add & Edit Products
                    </Link>
                    <Link
                      href="/admin/orders"
                      className="w-full bg-background border border-card-border hover:bg-border-dark text-white font-bold py-3.5 rounded-xl transition-all duration-200 text-center text-sm active:scale-95 cursor-pointer block"
                    >
                      Manage Orders Pipeline
                    </Link>
                    <Link
                      href="/admin/users"
                      className="w-full bg-background border border-card-border hover:bg-border-dark text-white font-bold py-3.5 rounded-xl transition-all duration-200 text-center text-sm active:scale-95 cursor-pointer block"
                    >
                      Manage User Accounts
                    </Link>
                  </div>
                </div>

                {/* Pending Orders that need action */}
                <div className="pt-6 border-t border-card-border/60">
                  <h3 className="text-base font-bold text-white tracking-tight mb-4">Awaiting Action</h3>
                  <div className="space-y-3">
                    {pendingOrders.slice(0, 3).map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 bg-amber-950/10 border border-amber-500/20 text-amber-300 rounded-2xl gap-3">
                        <div className="min-w-0 flex-grow">
                          <div className="font-bold text-sm text-amber-200 truncate">#{order._id.substring(0, 8)}</div>
                          <div className="text-xs text-amber-400/80 truncate mt-0.5">{order.user?.name}</div>
                        </div>
                        <div className="flex-shrink-0">
                          {order.isPaid && !order.isShipped && (
                            <button
                              onClick={() => handleQuickAction(order._id, 'ship')}
                              disabled={updatingOrder === order._id}
                              className="bg-primary-indigo hover:bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                              {updatingOrder === order._id ? 'Shipping...' : 'Ship Order'}
                            </button>
                          )}
                          {order.isShipped && !order.isDelivered && (
                            <button
                              onClick={() => handleQuickAction(order._id, 'deliver')}
                              disabled={updatingOrder === order._id}
                              className="bg-accent-emerald hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                              {updatingOrder === order._id ? 'Delivering...' : 'Deliver'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {pendingOrders.length === 0 && (
                      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 text-center">
                        <p className="text-accent-emerald text-sm font-semibold">All orders processed! 🎉</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}