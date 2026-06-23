"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchProducts,
  allCategories,
  featuredProducts,
  topRatedProducts,
} from "@/store/slices/productSlice";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import Message from "@/components/Message";
import Link from "next/link";
import {
  subscribeNewsletter,
  clearNewsletterState,
} from "@/store/slices/newsletterSlice";

export default function Home() {
  const dispatch = useAppDispatch();
  const {
    products,
    featuredProducts: featured,
    topRatedProducts: topRated,
    categories,
    loading,
    error,
  } = useAppSelector((state) => state.products);

  const {
    loading: newsLetterLoading,
    error: newsletterError,
    success: newsletterSuccess,
  } = useAppSelector((state) => state.newsletter);
  const [email, setEmail] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    try {
      await dispatch(subscribeNewsletter(email)).unwrap();
      setEmail(""); // Clear input on success
      setTimeout(() => {
        dispatch(clearNewsletterState());
      }, 5000);
    } catch (err) {
      // Error is handled by the slice
    }
  };

  useEffect(() => {
    dispatch(fetchProducts({}));
    dispatch(allCategories());
    dispatch(featuredProducts());
    dispatch(topRatedProducts());
  }, [dispatch]);

  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-16 flex-grow flex justify-center items-center">
          <Message variant="error">{error}</Message>
        </main>
        <Footer />
      </div>
    );
  }

  // Map category names to modern premium icons
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      electronics: "🔌",
      fashion: "👕",
      accessories: "🕶️",
      home: "🏡",
      beauty: "✨",
      sports: "⚽",
      books: "📚",
    };
    return icons[category.toLowerCase()] || "📦";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-gradient-to-br from-indigo-950/50 via-background to-purple-950/30 border-b border-card-border">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              MERN Commerce
            </span>
          </h1>
          <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto font-medium">
            Discover a curated universe of top-tier products, outstanding quality, and lightning-fast deliveries.
          </p>
          <Link
            href="/products"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-200 inline-block shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-95"
          >
            Explore Shop
          </Link>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16 flex-grow space-y-20">
        {/* Categories Section */}
        {categories && categories.length > 0 && (
          <section>
            <div className="flex flex-col mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">🛍️ Shop by Category</h2>
              <div className="w-16 h-1 bg-primary-indigo rounded mt-2"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {categories.map((category, index) => (
                <Link
                  key={category._id || index}
                  href={`/products?category=${category}`}
                  className="group bg-card border border-card-border p-6 rounded-2xl hover:translate-y-[-4px] hover:shadow-2xl hover:border-indigo-500/40 transition-all duration-300 text-center flex flex-col items-center"
                >
                  <div className="w-14 h-14 bg-indigo-950/40 border border-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-950/60 group-hover:border-indigo-500/30 transition-all duration-200">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                      {getCategoryIcon(category)}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-200 text-sm group-hover:text-primary-indigo transition-colors duration-200 capitalize">
                    {category}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Top Rated Section */}
        <section>
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">⭐ Top Rated</h2>
              <div className="w-16 h-1 bg-primary-indigo rounded mt-2"></div>
            </div>
            <Link
              href="/products?sort=rating"
              className="text-primary-indigo hover:text-indigo-400 font-semibold text-sm flex items-center gap-1 group transition-colors duration-200"
            >
              View All <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topRated && topRated.length > 0 ? (
              topRated
                .slice(0, 4)
                .map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
            ) : (
              <div className="col-span-full">
                <Message variant="info">No top-rated products found</Message>
              </div>
            )}
          </div>
        </section>

        {/* Most Viewed Section */}
        <section>
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">🔥 Trending Now</h2>
              <div className="w-16 h-1 bg-primary-indigo rounded mt-2"></div>
            </div>
            <Link
              href="/products?sort=views"
              className="text-primary-indigo hover:text-indigo-400 font-semibold text-sm flex items-center gap-1 group transition-colors duration-200"
            >
              View All <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured && featured.length > 0 ? (
              featured
                .slice(0, 4)
                .map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
            ) : (
              <div className="col-span-full">
                <Message variant="info">No trending products found</Message>
              </div>
            )}
          </div>
        </section>

        {/* Special Offer Banner */}
        <section className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-orange-500/20 rounded-3xl p-8 md:p-12 shadow-xl shadow-orange-500/5">
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Limited Time Offer
              </span>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mt-4 mb-3">
                Summer Sale! 🎉
              </h3>
              <p className="text-gray-300 text-lg max-w-xl">
                Upgrade your lifestyle with up to <span className="text-accent-amber font-extrabold">50% off</span> on selected summer goods.
              </p>
            </div>
            <Link
              href="/products?minPrice=0&maxPrice=100"
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-200 whitespace-nowrap shadow-lg shadow-orange-500/20 active:scale-95"
            >
              Shop Sale Items
            </Link>
          </div>
        </section>

        {/* New Arrivals Section */}
        <section>
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">🆕 New Arrivals</h2>
              <div className="w-16 h-1 bg-primary-indigo rounded mt-2"></div>
            </div>
            <Link
              href="/products?sort=newest"
              className="text-primary-indigo hover:text-indigo-400 font-semibold text-sm flex items-center gap-1 group transition-colors duration-200"
            >
              View All <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products && products.length > 0 ? (
              products
                .slice(0, 4)
                .map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
            ) : (
              <div className="col-span-full">
                <Message variant="info">No new products found</Message>
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="bg-card border border-card-border rounded-3xl p-8 md:p-12 shadow-lg">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              🌟 Why Choose Us
            </h2>
            <p className="text-text-muted text-sm md:text-base mt-2 max-w-xl mx-auto">
              We design and ship all our packages with maximum care, ensuring quality and satisfaction at every step.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-background/40 border border-card-border p-6 rounded-2xl hover:border-indigo-500/20 transition-all duration-200">
              <div className="w-14 h-14 bg-indigo-950/30 border border-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">
                Fast Shipping
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Free shipping on orders over $100. Delivered directly to your doorstep within 2-3 business days.
              </p>
            </div>

            <div className="text-center bg-background/40 border border-card-border p-6 rounded-2xl hover:border-emerald-500/20 transition-all duration-200">
              <div className="w-14 h-14 bg-emerald-950/30 border border-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">
                Quality Guarantee
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                All products undergo strict quality testing before packaging. Includes a robust 30-day money-back guarantee.
              </p>
            </div>

            <div className="text-center bg-background/40 border border-card-border p-6 rounded-2xl hover:border-purple-500/20 transition-all duration-200">
              <div className="w-14 h-14 bg-purple-950/30 border border-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">
                Secure Payment
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Your credentials are secure. We support state-of-the-art secure layers and encrypted checkouts.
              </p>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-card-border rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">📧 Stay in the Loop</h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Subscribe to our monthly newsletter and gain early access to special discounts, new releases, and curated events.
            </p>

            {/* Newsletter Feedback Messages */}
            {newsletterSuccess && (
              <div className="bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl max-w-md mx-auto text-sm font-semibold">
                ✅ Successfully subscribed! Welcome aboard.
              </div>
            )}

            {newsletterError && (
              <div className="bg-red-950/30 border border-red-500/30 text-red-400 p-3.5 rounded-xl max-w-md mx-auto text-sm font-semibold">
                ❌ {newsletterError}
              </div>
            )}

            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2"
            >
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={newsLetterLoading}
                className="flex-1 px-4 py-3 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo transition-all text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={newsLetterLoading}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-md shadow-indigo-500/20 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {newsLetterLoading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>

            <p className="text-xs text-text-muted pt-2">
              We care about your data privacy. Unsubscribe easily at any time.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

