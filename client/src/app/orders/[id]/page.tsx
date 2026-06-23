'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { getOrderDetails, markOrderAsPaid } from '@/store/slices/orderSlice';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Message from '@/components/Message';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { order, loading, error } = useAppSelector((state) => state.orders);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getOrderDetails(id as string));
    }
  }, [dispatch, id, order?.isPaid]); // Refresh when payment status changes

  const handlePayment = async () => {
    if (!order) return;
    
    setProcessingPayment(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Actually mark the order as paid in the database
      await dispatch(markOrderAsPaid(order._id)).unwrap();
      
      toast.success('Payment processed successfully!');
      
    } catch (error: any) {
      toast.error(error || 'Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const getStatusBadgeClass = (status: boolean) => {
    return status 
      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' 
      : 'bg-amber-950/40 text-amber-400 border border-amber-500/20';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? '✓' : '⧗';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow flex justify-center items-center">
          <Loader />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow flex flex-col justify-center items-center">
          <Message variant="error">{error}</Message>
          <Link 
            href="/orders" 
            className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            Back to Orders
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow flex flex-col justify-center items-center">
          <Message variant="error">Order not found</Message>
          <Link 
            href="/orders" 
            className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            Back to Orders
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background text-foreground animate-fadeIn">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="text-sm text-text-muted mb-8 flex items-center">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="mx-2 text-card-border">/</span>
              <Link href="/orders" className="hover:text-white transition-colors">Orders</Link>
              <span className="mx-2 text-card-border">/</span>
              <span className="text-primary-indigo font-semibold">Order #{order._id?.substring(0, 8)}</span>
            </nav>

            <div className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-xl mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-72 h-72 bg-primary-indigo/5 blur-3xl rounded-full pointer-events-none"></div>
              
              <div className="relative z-10">
                <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Order Details</h1>
                <p className="text-text-muted text-sm mb-6">Thank you for your purchase! Here's your order status and details.</p>

                <div className="flex flex-wrap gap-3">
                  <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-xs ${getStatusBadgeClass(order.isPaid)}`}>
                    <span>{getStatusIcon(order.isPaid)}</span>
                    <span>Payment {order.isPaid ? 'Completed' : 'Pending'}</span>
                  </div>
                  <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-xs ${getStatusBadgeClass(order.isDelivered)}`}>
                    <span>{getStatusIcon(order.isDelivered)}</span>
                    <span>Delivery {order.isDelivered ? 'Completed' : 'Processing'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Shipping Information */}
              <div className="bg-card border border-card-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-indigo-950/40 text-primary-indigo border border-indigo-500/20 rounded-xl flex items-center justify-center">📍</span>
                  Shipping Address
                </h2>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-card-border/40 pb-2">
                    <span className="text-text-muted">Street Address</span>
                    <span className="font-semibold text-white">{order.shippingAddress.address}</span>
                  </div>
                  <div className="flex justify-between border-b border-card-border/40 pb-2">
                    <span className="text-text-muted">City</span>
                    <span className="font-semibold text-white">{order.shippingAddress.city}</span>
                  </div>
                  <div className="flex justify-between border-b border-card-border/40 pb-2">
                    <span className="text-text-muted">Postal Code</span>
                    <span className="font-semibold text-white">{order.shippingAddress.postalCode}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-text-muted">Country</span>
                    <span className="font-semibold text-white">{order.shippingAddress.country}</span>
                  </div>
                </div>
              </div>

              {/* Order Summary metadata */}
              <div className="bg-card border border-card-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-purple-950/40 text-purple-400 border border-purple-500/20 rounded-xl flex items-center justify-center">📋</span>
                  Metadata
                </h2>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-card-border/40 pb-2">
                    <span className="text-text-muted">Order ID</span>
                    <span className="font-mono font-bold text-white">#{order._id}</span>
                  </div>
                  <div className="flex justify-between border-b border-card-border/40 pb-2">
                    <span className="text-text-muted">Order Date</span>
                    <span className="font-semibold text-white">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-text-muted">Payment Method</span>
                    <span className="font-semibold text-white capitalize">{order.paymentMethod || 'PayPal'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-xl mb-8">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center">🛒</span>
                Order Items ({order.orderItems.length})
              </h2>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item._id} className="flex flex-col sm:flex-row sm:items-center p-4 bg-background/40 border border-card-border/60 hover:bg-card/40 hover:border-card-border rounded-2xl transition-all duration-200 gap-4">
                    <div className="relative w-16 h-16 bg-background rounded-xl overflow-hidden flex-shrink-0 border border-card-border/60">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-white text-sm line-clamp-1">{item.name}</h3>
                      <p className="text-text-muted text-xs mt-1">Quantity: {item.quantity}</p>
                    </div>
                    <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-2">
                      <p className="font-bold text-white text-sm">${item.price.toFixed(2)}</p>
                      <p className="text-text-muted text-xs">Total: ${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-amber-950/40 text-amber-400 border border-amber-500/20 rounded-xl flex items-center justify-center">💰</span>
                Payment Summary
              </h2>
              <div className="space-y-3 text-sm mb-6 border-b border-card-border/60 pb-6">
                <div className="flex justify-between">
                  <span className="text-text-muted">Items Price</span>
                  <span className="font-semibold text-white">${order.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Shipping Price</span>
                  <span className="font-semibold text-white">${order.shippingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Tax Price</span>
                  <span className="font-semibold text-white">${order.taxPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-base pt-3 border-t border-card-border/60">
                  <span className="text-white">Total Amount</span>
                  <span className="text-accent-emerald">${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {!order.isPaid && (
                <div>
                  <button 
                    onClick={handlePayment}
                    disabled={processingPayment}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer text-sm"
                  >
                    {processingPayment ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                        Processing Payment...
                      </>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </button>
                  <p className="text-center text-text-muted text-xs mt-3">
                    Secure payment gateway simulated for demonstration.
                  </p>
                </div>
              )}

              {order.isPaid && (
                <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-5 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                  <div className="text-accent-emerald text-base font-bold mb-1">✓ Payment Completed</div>
                  <p className="text-gray-300 text-sm">
                    Thank you! Paid on {order.paidAt ? new Date(order.paidAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'today'}.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/orders"
                className="bg-background border border-card-border hover:bg-border-dark text-white hover:border-gray-600 px-6 py-3 rounded-xl font-bold transition-all text-sm shadow-md cursor-pointer active:scale-95"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}