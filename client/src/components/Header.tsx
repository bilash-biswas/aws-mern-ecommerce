"use client";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Header = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const { user } = useSelector((state: RootState) => state.auth);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const logoutHandler = () => {
    dispatch(logout());
    router.push("/");
  };

  // Show simplified header during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <header className="glass-panel sticky top-0 z-50 border-b border-card-border shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
            MERN Commerce
          </Link>

          <nav className="flex space-x-6 items-center">
            <Link
              href="/"
              className="text-gray-300 hover:text-primary-indigo font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-gray-300 hover:text-primary-indigo font-medium transition-colors duration-200"
            >
              Products
            </Link>

            <div className="flex items-center space-x-4">
              <div className="h-6 w-20 bg-card-border rounded animate-pulse"></div>
              <Link
                href="/cart"
                className="text-gray-300 hover:text-primary-indigo font-medium transition-colors duration-200 flex items-center"
              >
                <span className="mr-1">🛒</span>
                Cart
                <span className="ml-1.5 bg-card-border text-gray-400 rounded-full px-2 py-0.5 text-xs font-bold">
                  0
                </span>
              </Link>
            </div>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="glass-panel sticky top-0 z-50 border-b border-card-border shadow-xl">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
          MERN Commerce
        </Link>

        <nav className="flex items-center space-x-6">
          {/* Main Navigation */}
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-300 hover:text-primary-indigo font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-gray-300 hover:text-primary-indigo font-medium transition-colors duration-200"
            >
              Products
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-6">
            {/* Cart - Always visible */}
            <Link
              href="/cart"
              className="text-gray-300 hover:text-primary-indigo font-medium transition-colors duration-200 flex items-center relative group"
            >
              <span className="mr-1 group-hover:scale-110 transition-transform duration-200">🛒</span>
              Cart
              {cartCount > 0 && (
                <span className="ml-1.5 bg-primary-indigo text-white font-bold rounded-full px-2 py-0.5 text-[10px] shadow-[0_0_8px_rgba(99,102,241,0.5)]">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              /* Authenticated User */
              <div className="flex items-center space-x-4">
                {/* Admin Quick Access - Only for admins */}
                {user.isAdmin && (
                  <div className="hidden md:flex items-center space-x-4 border-l border-card-border pl-4">
                    <Link
                      href="/admin/dashboard"
                      className="text-gray-300 hover:text-primary-indigo transition-colors duration-200 text-sm font-medium"
                      title="Admin Dashboard"
                    >
                      📊 Dashboard
                    </Link>
                    <Link
                      href="/admin/orders"
                      className="text-gray-300 hover:text-primary-indigo transition-colors duration-200 text-sm font-medium"
                      title="Manage Orders"
                    >
                      📦 Orders
                    </Link>
                  </div>
                )}

                {/* User Dropdown */}
                <div className="relative group">
                  <button className="text-white hover:text-primary-indigo transition-colors duration-200 flex items-center outline-none">
                    <span className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md shadow-indigo-500/20">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </button>
                  <div className="absolute right-0 mt-2.5 w-52 rounded-xl shadow-2xl py-1 bg-card border border-card-border hidden group-hover:block z-50 backdrop-blur-xl">
                    <div className="px-4 py-2.5 border-b border-card-border">
                      <p className="text-sm text-white font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>
                    
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-300 hover:bg-border-dark hover:text-white text-sm transition-colors duration-150"
                    >
                      👤 Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-gray-300 hover:bg-border-dark hover:text-white text-sm transition-colors duration-150"
                    >
                      📋 My Orders
                    </Link>
                    
                    {/* Admin Links in Dropdown */}
                    {user.isAdmin && (
                      <>
                        <div className="border-t border-card-border my-1"></div>
                        <Link
                          href="/admin/dashboard"
                          className="block px-4 py-2 text-gray-300 hover:bg-border-dark hover:text-white text-sm transition-colors duration-150"
                        >
                          📊 Dashboard
                        </Link>
                        <Link
                          href="/admin/orders"
                          className="block px-4 py-2 text-gray-300 hover:bg-border-dark hover:text-white text-sm transition-colors duration-150"
                        >
                          🚚 Manage Orders
                        </Link>
                        <Link
                          href="/admin/products"
                          className="block px-4 py-2 text-gray-300 hover:bg-border-dark hover:text-white text-sm transition-colors duration-150"
                        >
                          🛍️ Manage Products
                        </Link>
                      </>
                    )}
                    
                    <div className="border-t border-card-border my-1"></div>
                    <button
                      onClick={logoutHandler}
                      className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-950/30 hover:text-red-300 text-sm transition-colors duration-150 font-medium"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Guest User */
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-primary-indigo font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-indigo hover:bg-primary-indigo-hover text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;