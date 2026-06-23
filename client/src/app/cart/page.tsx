'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { 
  removeFromCart, 
  incrementQuantity, 
  decrementQuantity, 
  clearCart 
} from '@/store/slices/cartSlice';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { showToast } from '@/utils/toast';

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [isMounted, setIsMounted] = useState(false);
  
  // Use useSelector only after component is mounted
  const { items, total } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleIncrement = (id: string) => {
    dispatch(incrementQuantity(id));
    showToast('Quantity increased');
  };

  const handleDecrement = (id: string) => {
    dispatch(decrementQuantity(id));
    showToast('Quantity decreased');
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
    showToast('Item removed from cart');
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    showToast('Cart cleared');
  };

  // Show loading state during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-48 bg-card-border rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-card-border rounded animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-card border border-card-border rounded-2xl p-4 mb-4 flex items-center animate-pulse">
                  <div className="h-24 w-24 mr-4 bg-card-border rounded-xl flex-shrink-0"></div>
                  <div className="flex-grow">
                    <div className="h-6 bg-card-border rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-card-border rounded w-1/2 mb-1"></div>
                    <div className="h-4 bg-card-border rounded w-1/3"></div>
                  </div>
                  <div className="flex items-center space-x-2 mx-4">
                    <div className="h-8 w-8 bg-card-border rounded"></div>
                    <div className="h-6 w-6 bg-card-border rounded"></div>
                    <div className="h-8 w-8 bg-card-border rounded"></div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="h-6 bg-card-border rounded w-16 mb-2"></div>
                    <div className="h-4 bg-card-border rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card border border-card-border rounded-2xl p-6 h-fit animate-pulse">
              <div className="h-7 bg-card-border rounded w-40 mb-4"></div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <div className="h-4 bg-card-border rounded w-32"></div>
                  <div className="h-4 bg-card-border rounded w-16"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-card-border rounded w-24"></div>
                  <div className="h-4 bg-card-border rounded w-12"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-card-border rounded w-16"></div>
                  <div className="h-4 bg-card-border rounded w-10"></div>
                </div>
                <div className="flex justify-between pt-2 border-t border-card-border">
                  <div className="h-5 bg-card-border rounded w-20"></div>
                  <div className="h-5 bg-card-border rounded w-24"></div>
                </div>
              </div>
              <div className="h-12 bg-card-border rounded w-full mb-4"></div>
              <div className="h-5 bg-card-border rounded w-40 mx-auto"></div>
            </div>
          </div>
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-16 flex-grow flex flex-col items-center justify-center">
          <div className="bg-card border border-card-border rounded-3xl p-8 md:p-12 text-center max-w-md w-full shadow-2xl">
            <div className="text-6xl mb-5">🛒</div>
            <h1 className="text-2xl font-extrabold text-white mb-3 tracking-tight">Your Cart is Empty</h1>
            <p className="text-text-muted mb-8 text-sm leading-relaxed">Looks like you haven't added any products to your cart yet.</p>
            <Link
              href="/products"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-200 shadow-md shadow-indigo-500/25 inline-block active:scale-95 text-sm"
            >
              Start Shopping
            </Link>
          </div>
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground animate-fadeIn">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Shopping Cart</h1>
          <button
            onClick={handleClearCart}
            className="bg-red-950/40 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl hover:bg-red-900/20 transition-all font-semibold text-sm shadow-md"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {items.map((item) => (
              <div key={item._id} className="bg-card border border-card-border rounded-2xl p-4 md:p-6 mb-4 flex flex-col sm:flex-row items-start sm:items-center shadow-md gap-4">
                <div className="relative h-20 w-20 md:h-24 md:w-24 flex-shrink-0 bg-background rounded-xl overflow-hidden border border-card-border">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-1"
                    sizes="96px"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="text-base font-bold text-white mb-0.5 line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-accent-emerald font-semibold">${item.price.toFixed(2)}</p>
                  <p className={`text-xs mt-1.5 font-semibold ${item.stock < 10 ? 'text-amber-400' : 'text-text-muted'}`}>
                    {item.stock} pieces in stock
                  </p>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex items-center space-x-2 bg-background border border-card-border p-1 rounded-xl">
                    <button
                      onClick={() => handleDecrement(item._id)}
                      className="w-8 h-8 bg-card border border-card-border hover:bg-border-dark text-white rounded-lg flex items-center justify-center font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-2.5 py-1 text-white font-bold min-w-[2.5rem] text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleIncrement(item._id)}
                      className="w-8 h-8 bg-card border border-card-border hover:bg-border-dark text-white rounded-lg flex items-center justify-center font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="text-right sm:ml-6 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-4">
                    <p className="text-base font-extrabold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-card-border rounded-2xl p-6 h-fit sticky top-24 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal ({items.reduce((total, item) => total + item.quantity, 0)} items)</span>
                <span className="font-semibold text-white">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span className="font-semibold text-white">${total > 100 ? '0.00' : '10.00'}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax (10%)</span>
                <span className="font-semibold text-white">${(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t border-card-border pt-4 mt-4">
                <div className="flex justify-between text-base font-extrabold text-white">
                  <span>Total</span>
                  <span className="text-accent-emerald">
                    ${(total + (total > 100 ? 0 : 10) + total * 0.1).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <Link
              href="/checkout"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-bold transition-all duration-200 text-center block mb-4 text-sm shadow-md shadow-indigo-500/20 active:scale-95"
            >
              Proceed to Checkout
            </Link>
            
            <Link
              href="/products"
              className="block text-center text-text-muted hover:text-white transition-colors text-sm font-semibold"
            >
              Continue Shopping
            </Link>

            {total < 100 && (
              <div className="mt-4 p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl">
                <p className="text-amber-300 text-xs text-center font-medium">
                  Add ${(100 - total).toFixed(2)} more for free shipping!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}