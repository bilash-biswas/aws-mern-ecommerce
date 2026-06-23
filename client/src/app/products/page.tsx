"use client";

import { useState, useEffect, Suspense } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchProducts } from "@/store/slices/productSlice";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import Message from "@/components/Message";
import { useSearchParams } from "next/navigation";
import { Toaster } from "react-hot-toast";

function ProductsPageContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { products, loading, error, page, pages, total, categories } =
    useAppSelector((state) => state.products);

  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    minRating: 0,
    sort: "newest",
    page: 1,
    pageSize: 12,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [hasUserFiltered, setHasUserFiltered] = useState(false);

  // Get price range from products for better UX
  const priceRange = {
    min: Math.min(...products.map((p) => p.price), 0),
    max: Math.max(...products.map((p) => p.price), 1000),
  };

  // Initial load without filters
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    const sortFromUrl = searchParams.get("sort");

    if (categoryFromUrl || sortFromUrl && !hasUserFiltered) {
      setFilters((prev) => ({
        ...prev,
        category: categoryFromUrl || "",
        sort: sortFromUrl || "newest",
        page: 1,
      }));
      setHasUserFiltered(true);
    } else if (!hasUserFiltered) {
      dispatch(
        fetchProducts({
          page: 1,
          pageSize: 12,
          sort: "newest",
        })
      );
    }
  }, [dispatch, hasUserFiltered, searchParams]);

  // Load with filters when user applies them
  useEffect(() => {
    if (hasUserFiltered) {
      const apiParams = {
        ...filters,
        page: Number(filters.page),
        pageSize: Number(filters.pageSize),
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        minRating: filters.minRating ? Number(filters.minRating) : undefined,
      };
      dispatch(fetchProducts(apiParams));
    }
  }, [dispatch, filters, hasUserFiltered]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
    setHasUserFiltered(true);
  };

  const handlePriceChange = (type: "min" | "max", value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    setFilters((prev) => ({
      ...prev,
      [type === "min" ? "minPrice" : "maxPrice"]: numericValue,
      page: 1,
    }));
    setHasUserFiltered(true);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    setHasUserFiltered(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
    setHasUserFiltered(true);
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      minRating: 0,
      sort: "newest",
      page: 1,
      pageSize: 12,
    });
    setHasUserFiltered(false);
  };

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "views", label: "Most Viewed" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
  ];

  const ratingOptions = [
    { value: "0", label: "Any Rating" },
    { value: "4.5", label: "4.5+ Stars" },
    { value: "4", label: "4+ Stars" },
    { value: "3", label: "3+ Stars" },
    { value: "2", label: "2+ Stars" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground animate-fadeIn">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-white tracking-tight">
          All Products
        </h1>

        {/* Search and Filter Section */}
        <div className="bg-card border border-card-border rounded-2xl p-6 mb-8 shadow-xl">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label
                  htmlFor="search"
                  className="block text-sm font-semibold text-gray-300 mb-2"
                >
                  Search Products
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by product name..."
                  value={filters.keyword}
                  onChange={(e) =>
                    handleFilterChange("keyword", e.target.value)
                  }
                  className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo focus:border-transparent transition-all"
                />
              </div>

              <div className="w-full md:w-48">
                <label
                  htmlFor="sort"
                  className="block text-sm font-semibold text-gray-300 mb-2"
                >
                  Sort By
                </label>
                <select
                  id="sort"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-indigo text-sm font-semibold transition-all"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-card text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex w-full md:w-auto gap-3">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-border-dark hover:bg-border-dark/80 text-white rounded-xl font-bold transition-all text-sm"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>

                <button
                  type="submit"
                  className="flex-1 md:flex-none bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-200 shadow-md shadow-indigo-500/20 active:scale-95 text-sm"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-5 bg-background/50 rounded-2xl border border-card-border animate-slideDown">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-indigo text-sm transition-all"
                >
                  <option value="" className="bg-card text-white">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-card text-white capitalize">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Price Range ($)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted font-medium w-8">Min:</span>
                    <input
                      type="text"
                      placeholder="0"
                      value={filters.minPrice}
                      onChange={(e) => handlePriceChange("min", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-card-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted font-medium w-8">Max:</span>
                    <input
                      type="text"
                      placeholder="1000"
                      value={filters.maxPrice}
                      onChange={(e) => handlePriceChange("max", e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-card-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo text-xs"
                    />
                  </div>
                  <div className="text-[10px] text-text-muted font-medium">
                    Available: ${priceRange.min.toFixed(0)} - ${priceRange.max.toFixed(0)}
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating.toString()}
                  onChange={(e) =>
                    handleFilterChange("minRating", e.target.value)
                  }
                  className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-indigo text-sm transition-all"
                >
                  {ratingOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-card text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results per Page */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Products per Page
                </label>
                <select
                  value={filters.pageSize}
                  onChange={(e) =>
                    handleFilterChange("pageSize", e.target.value)
                  }
                  className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-indigo text-sm transition-all"
                >
                  <option value="12" className="bg-card text-white">12 Products</option>
                  <option value="24" className="bg-card text-white">24 Products</option>
                  <option value="36" className="bg-card text-white">36 Products</option>
                  <option value="48" className="bg-card text-white">48 Products</option>
                </select>
              </div>
            </div>
          )}

          {/* Results Info and Clear Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 border-t border-card-border pt-4">
            <p className="text-sm text-text-muted">
              Showing {products.length} of {total} products
              {filters.keyword && ` for "${filters.keyword}"`}
              {filters.category && ` in ${filters.category}`}
              {(filters.minPrice || filters.maxPrice) &&
                ` priced ${
                  filters.minPrice ? `from $${filters.minPrice}` : ""
                }${filters.minPrice && filters.maxPrice ? " to " : ""}${
                  filters.maxPrice ? `$${filters.maxPrice}` : ""
                }`}
            </p>

            {hasUserFiltered && (
              <button
                onClick={clearFilters}
                className="text-red-400 hover:text-red-300 font-bold text-sm flex items-center gap-1 group"
              >
                <svg
                  className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {loading && <Loader />}
        {error && <Message variant="error">{error}</Message>}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16 bg-card border border-card-border rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">🔍</div>
            <div className="max-w-md mx-auto px-4">
              <Message variant="info">
                {hasUserFiltered
                  ? "No products found matching your criteria."
                  : "No products available at the moment."}
              </Message>
              <p className="text-sm text-text-muted mt-2 mb-6">
                {hasUserFiltered
                  ? "Try adjusting your filters or search terms."
                  : "Please check back later."}
              </p>
              {hasUserFiltered && (
                <button
                  onClick={clearFilters}
                  className="bg-primary-indigo hover:bg-primary-indigo-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-md"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8 animate-fadeIn">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {(hasUserFiltered || pages > 1) && pages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 bg-card border border-card-border p-4 rounded-2xl shadow-md">
                <p className="text-text-muted text-xs font-semibold">
                  Page {filters.page} of {pages} • {total} total products
                </p>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, filters.page - 1))
                    }
                    disabled={filters.page === 1}
                    className="px-3.5 py-2 bg-background border border-card-border text-gray-300 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-border-dark transition-all text-sm font-semibold"
                  >
                    Prev
                  </button>

                  <div className="flex items-center space-x-1">
                    {/* First page */}
                    <button
                      onClick={() => handlePageChange(1)}
                      className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all ${
                        filters.page === 1
                          ? "bg-primary-indigo border-primary-indigo text-white shadow-md shadow-indigo-500/20"
                          : "bg-background border-card-border hover:bg-border-dark text-gray-300"
                      }`}
                    >
                      1
                    </button>

                    {filters.page > 3 && (
                      <span className="px-1 text-text-muted text-xs">...</span>
                    )}

                    {(() => {
                      const pageButtons = [];
                      const startPage = Math.max(2, filters.page - 1);
                      const endPage = Math.min(pages - 1, filters.page + 1);

                      for (
                        let pageNum = startPage;
                        pageNum <= endPage;
                        pageNum++
                      ) {
                        if (pageNum > 1 && pageNum < pages) {
                          pageButtons.push(
                            <button
                              key={`page-${pageNum}`}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all ${
                                filters.page === pageNum
                                  ? "bg-primary-indigo border-primary-indigo text-white shadow-md shadow-indigo-500/20"
                                  : "bg-background border-card-border hover:bg-border-dark text-gray-300"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      }
                      return pageButtons;
                    })()}

                    {filters.page < pages - 2 && (
                      <span className="px-1 text-text-muted text-xs">...</span>
                    )}

                    {/* Last page */}
                    {pages > 1 && (
                      <button
                        onClick={() => handlePageChange(pages)}
                        className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all ${
                          filters.page === pages
                            ? "bg-primary-indigo border-primary-indigo text-white shadow-md shadow-indigo-500/20"
                            : "bg-background border-card-border hover:bg-border-dark text-gray-300"
                        }`}
                      >
                        {pages}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      handlePageChange(Math.min(pages, filters.page + 1))
                    }
                    disabled={filters.page === pages}
                    className="px-3.5 py-2 bg-background border border-card-border text-gray-300 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-border-dark transition-all text-sm font-semibold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ProductsPageContent />
    </Suspense>
  );
}

