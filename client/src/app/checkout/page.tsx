'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { createOrder } from '@/store/slices/orderSlice';
import { clearCart } from '@/store/slices/cartSlice';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Message from '@/components/Message';
import Loader from '@/components/Loader';
import ProtectedRoute from '@/components/ProtectedRoute';
import { showToast } from '@/utils/toast';
import { Toaster } from 'react-hot-toast';

export default function CheckoutPage() {
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('PayPal');

  const dispatch = useAppDispatch();
  const router = useRouter();

  const { items, total } = useAppSelector((state) => state.cart);
  const { loading, error, success, order } = useAppSelector((state) => state.orders);

  // Move router navigation to useEffect
  useEffect(() => {
    if (success && order) {
      // Clear cart and redirect to success page
      dispatch(clearCart());
      router.push(`/checkout/success?orderId=${order._id}`);
    }
  }, [success, order, router, dispatch]);

  const itemsPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData = {
      orderItems: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price,
        product: item._id,
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice: itemsPrice,
      taxPrice: taxPrice,
      shippingPrice: shippingPrice,
      totalPrice: totalPrice,
    };

    dispatch(createOrder(orderData));
    showToast('Processing order...', 'info');
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !success) {
      router.push('/cart');
    }
  }, [items, success, router]);

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-16 flex-grow flex justify-center items-center">
          <Loader />
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
          <h1 className="text-3xl font-extrabold mb-8 text-white tracking-tight">Checkout</h1>
          
          {error && <Message variant="error">{error}</Message>}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-card border border-card-border rounded-2xl p-6 shadow-xl mb-6">
                <h2 className="text-white text-xl font-bold mb-6">Shipping Address</h2>
                <form onSubmit={submitHandler}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2">Address</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                        required
                        placeholder="123 Street Name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2">City</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        required
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2">Postal Code</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                        required
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2">Country</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        required
                        placeholder="United States"
                      />
                    </div>
                  </div>

                  <div className="mb-8 pt-6 border-t border-card-border">
                    <h2 className="text-lg font-bold mb-4 text-white">Payment Method</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className={`flex-1 flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${paymentMethod === 'PayPal' ? 'border-primary-indigo bg-indigo-950/20 text-white' : 'border-card-border bg-background text-text-muted hover:border-gray-600'}`}>
                        <span className="font-semibold text-sm">PayPal</span>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="PayPal"
                          checked={paymentMethod === 'PayPal'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 accent-primary-indigo"
                        />
                      </label>
                      <label className={`flex-1 flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 ${paymentMethod === 'Stripe' ? 'border-primary-indigo bg-indigo-950/20 text-white' : 'border-card-border bg-background text-text-muted hover:border-gray-600'}`}>
                        <span className="font-semibold text-sm">Stripe</span>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Stripe"
                          checked={paymentMethod === 'Stripe'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 accent-primary-indigo"
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3.5 rounded-xl font-bold transition-all duration-200 shadow-md shadow-indigo-500/25 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-2xl p-6 h-fit shadow-xl text-white">
              <h2 className="text-lg font-bold mb-4 text-white">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm py-0.5">
                    <span className="text-gray-300 font-medium truncate max-w-[200px]">{item.name} (x{item.quantity})</span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-card-border pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Items</span>
                  <span className="font-semibold text-white">${itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span className="font-semibold text-white">${shippingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span className="font-semibold text-white">${taxPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-white pt-3.5 border-t border-card-border">
                  <span>Total</span>
                  <span className="text-accent-emerald">${totalPrice.toFixed(2)}</span>
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