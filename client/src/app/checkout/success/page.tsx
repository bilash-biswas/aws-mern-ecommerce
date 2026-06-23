'use client';

import { useEffect, Suspense } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { clearCart } from '@/store/slices/cartSlice';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Loader from '@/components/Loader';

function CheckoutSuccessContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const { order } = useAppSelector((state) => state.orders);

  useEffect(() => {
    // Clear cart on successful checkout
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground animate-fadeIn">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="bg-card border border-card-border rounded-3xl p-8 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-950/40 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <svg className="w-8 h-8 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Order Confirmed!</h1>
            <p className="text-sm text-text-muted mb-8 leading-relaxed">
              Thank you for your purchase. Your order has been successfully processed and registered.
            </p>

            {orderId && (
              <div className="bg-background border border-card-border rounded-xl p-4 mb-4">
                <p className="text-xs text-text-muted mb-1 font-semibold">Order Number</p>
                <p className="font-mono text-sm text-white font-bold">{orderId}</p>
              </div>
            )}

            {order && (
              <div className="bg-background border border-card-border rounded-xl p-4 mb-6">
                <p className="text-xs text-text-muted mb-1 font-semibold">Order Total</p>
                <p className="font-extrabold text-2xl text-accent-emerald">${order.totalPrice.toFixed(2)}</p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/orders"
                className="block w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-bold transition-all duration-200 shadow-md shadow-indigo-500/20 active:scale-95 text-sm"
              >
                View My Orders
              </Link>
              <Link
                href="/products"
                className="block w-full bg-border-dark hover:bg-border-dark/80 text-white py-3 rounded-xl font-semibold transition-all active:scale-95 text-sm"
              >
                Continue Shopping
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-card-border">
              <p className="text-xs text-text-muted">
                We've sent a confirmation email with your shipping details.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow flex justify-center items-center">
          <Loader />
        </main>
        <Footer />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
