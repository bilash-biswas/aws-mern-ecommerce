'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchProductDetails } from '@/store/slices/productSlice';
import { addToCart } from '@/store/slices/cartSlice';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Message from '@/components/Message';
import ReviewFormModal from '@/components/ReviewFormModal';
import Image from 'next/image';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { getReviewUser } from '@/utils/reviewUtils';
import { showToast } from '@/utils/toast';

export default function ProductPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const product = products[0];

  // Sample product images for demonstration
  const productImages = product ? [
    product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=600&fit=crop',
  ] : [];

  // Auto-slide effect
  useEffect(() => {
    if (productImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % productImages.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [productImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % productImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Calculate discounted price
  const calculateDiscount = () => {
    if (!product?.discount || product.discount <= 0) return null;
    
    const discountAmount = (product.price * product.discount) / 100;
    const discountedPrice = product.price - discountAmount;
    
    return {
      originalPrice: product.price,
      discountedPrice,
      discountAmount,
      discountPercent: product.discount,
      youSave: discountAmount
    };
  };

  const discountInfo = calculateDiscount();

  const handleReviewSubmitted = () => {
    if (id) {
      dispatch(fetchProductDetails(id as string));
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id as string));
    }
  }, [dispatch, id]);

  const addToCartHandler = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        dispatch(addToCart(product));
      }
      showToast(`${quantity} ${product.name}(s) added to cart!`, 'success');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-16 flex-grow flex justify-center items-center">
          <Loader />
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-16 flex-grow flex flex-col justify-center items-center gap-4">
          <Message variant="error">{error}</Message>
          <Link href="/products" className="bg-primary-indigo hover:bg-primary-indigo-hover text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all">
            Back to Products
          </Link>
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-16 flex-grow flex flex-col justify-center items-center gap-4">
          <Message variant="error">Product not found</Message>
          <Link href="/products" className="bg-primary-indigo hover:bg-primary-indigo-hover text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all">
            Back to Products
          </Link>
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {/* Breadcrumb */}
        <nav className="text-sm text-text-muted mb-6 flex items-center gap-1.5 font-medium">
          <Link href="/" className="hover:text-primary-indigo transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-indigo transition-colors">Products</Link>
          <span>/</span>
          <span className="text-white truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Images Slider */}
          <div className="space-y-4">
            <div className="relative h-96 w-full bg-card/40 border border-card-border rounded-2xl overflow-hidden group">
              {/* Main Image */}
              {productImages.length > 0 && (
                <Image
                  src={productImages[currentSlide]}
                  alt={product.name}
                  fill
                  className="object-contain p-4 transition-all duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              )}
              
              {/* Discount Badge on Image */}
              {discountInfo && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10 shadow-lg shadow-red-500/20">
                  {discountInfo.discountPercent}% OFF
                </div>
              )}

              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 border border-card-border text-white p-2 rounded-xl hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 focus:outline-none"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 border border-card-border text-white p-2 rounded-xl hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 focus:outline-none"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Slide Indicators */}
              {productImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-indigo-950/40 border border-card-border px-3 py-1.5 rounded-full backdrop-blur-md">
                  {productImages.map((_, index) => (
                    <button
                      aria-label='Slide'
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentSlide ? 'bg-primary-indigo w-4' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`relative h-20 w-20 bg-card/40 rounded-xl border-2 flex-shrink-0 transition-all ${
                    currentSlide === index ? 'border-primary-indigo scale-[1.03] shadow-md shadow-indigo-500/10' : 'border-card-border hover:border-gray-600'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover rounded-lg p-1"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Product Details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{product.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.rating)
                        ? 'text-accent-amber'
                        : 'text-border-dark'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-300 font-semibold">
                {product.rating.toFixed(1)} ({product.numReviews} reviews)
              </span>
              <span className="text-text-muted">|</span>
              <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${product.stock > 0 ? 'bg-emerald-950/40 text-accent-emerald border border-emerald-500/20' : 'bg-red-950/40 text-red-400 border border-red-500/20'}`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Price Section with Discount */}
            <div className="space-y-2">
              {discountInfo ? (
                <>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-extrabold text-accent-emerald">
                      ${discountInfo.discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-lg text-text-muted line-through font-semibold">
                      ${discountInfo.originalPrice.toFixed(2)}
                    </span>
                    <span className="bg-red-950/40 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-xs font-bold">
                      Save {discountInfo.discountPercent}%
                    </span>
                  </div>
                  <div className="text-xs text-accent-emerald font-semibold">
                    You save: ${discountInfo.youSave.toFixed(2)}
                  </div>
                </>
              ) : (
                <p className="text-3xl font-extrabold text-accent-emerald">${product.price.toFixed(2)}</p>
              )}
            </div>
            
            {/* Limited Time Offer Banner */}
            {discountInfo && (
              <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3.5">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-accent-amber mr-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-amber-300 font-semibold">
                    Special discount ends soon! Limited stock available.
                  </span>
                </div>
              </div>
            )}
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">{product.description}</p>
            </div>

            <div className="border-t border-card-border pt-6 space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-gray-300">Category:</span>
                <span className="bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold capitalize">
                  {product.category}
                </span>
              </div>

              {product.stock > 0 && (
                <>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-semibold text-gray-300 font-sans">Quantity:</span>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="bg-background border border-card-border text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-indigo focus:outline-none text-sm font-bold"
                    >
                      {[...Array(Math.min(product.stock, 10)).keys()].map((x) => (
                        <option key={x + 1} value={x + 1} className="bg-card text-white">
                          {x + 1}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-text-muted font-medium">
                      {product.stock} pieces in stock
                    </span>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={addToCartHandler}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-bold transition-all duration-200 shadow-md shadow-indigo-500/20 active:scale-95 text-sm"
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={addToCartHandler}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 px-6 rounded-xl font-bold transition-all duration-200 shadow-md shadow-emerald-500/20 active:scale-95 text-sm"
                    >
                      Buy Now
                    </button>
                  </div>

                  {/* Total Savings */}
                  {discountInfo && quantity > 1 && (
                    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5">
                      <div className="text-xs text-emerald-400 font-semibold">
                        <strong>Total bundle savings:</strong> ${(discountInfo.youSave * quantity).toFixed(2)}
                      </div>
                    </div>
                  )}
                </>
              )}

              {product.stock === 0 && (
                <div className="text-center py-4 space-y-4">
                  <Message variant="warning">This product is currently out of stock</Message>
                  <button className="bg-border-dark hover:bg-border-dark/80 text-white py-2.5 px-6 rounded-xl transition-colors font-bold text-sm">
                    Notify Me When Available
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-card border border-card-border rounded-2xl p-6 mb-8 shadow-md">
          <h2 className="text-xl font-bold mb-4 text-white">Product Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-sm mb-3 text-primary-indigo uppercase tracking-wider">Product Details</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex justify-between border-b border-card-border pb-2"><strong className="text-text-muted">SKU:</strong> <span className="font-mono text-xs">{product._id}</span></li>
                <li className="flex justify-between border-b border-card-border pb-2"><strong className="text-text-muted">Category:</strong> <span className="capitalize">{product.category}</span></li>
                <li className="flex justify-between border-b border-card-border pb-2"><strong className="text-text-muted">Weight:</strong> 1.2 kg</li>
                <li className="flex justify-between pb-2"><strong className="text-text-muted">Dimensions:</strong> 10 × 5 × 3 cm</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-3 text-primary-indigo uppercase tracking-wider">Shipping & Policy</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex justify-between border-b border-card-border pb-2"><strong className="text-text-muted">Free Shipping:</strong> <span>On orders over $100</span></li>
                <li className="flex justify-between border-b border-card-border pb-2"><strong className="text-text-muted">Guarantee:</strong> <span>30-Day Money-Back</span></li>
                <li className="flex justify-between border-b border-card-border pb-2"><strong className="text-text-muted">Returns:</strong> <span>Easy 30-Day Policy</span></li>
                <li className="flex justify-between pb-2"><strong className="text-text-muted">Warranty:</strong> <span>2-Year Full Protection</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-card border border-card-border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 text-white">Customer Reviews ({product.numReviews})</h2>
          
          {product.reviews && product.reviews.length === 0 ? (
            <Message variant="info">No reviews yet. Be the first to review this product!</Message>
          ) : (
            <div className="space-y-5">
              {product.reviews?.map((review) => {
                const reviewUser = getReviewUser(review);
                
                return (
                  <div key={review._id} className="border-b border-card-border pb-5 last:border-b-0 last:pb-0">
                    <div className="flex items-center space-x-2.5 mb-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating
                                ? 'text-accent-amber'
                                : 'text-border-dark'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-white font-bold">
                        {reviewUser.name}
                      </span>
                      <span className="text-xs text-text-muted">
                        •
                      </span>
                      <span className="text-xs text-text-muted">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {review.title && (
                      <h4 className="font-bold text-white text-base mb-1">{review.title}</h4>
                    )}
                    
                    <p className="text-sm text-gray-300 leading-relaxed">{review.comment}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Review Button */}
          <div className="mt-8 pt-4 border-t border-card-border">
            {user ? (
              <button
                onClick={() => setShowReviewModal(true)}
                className="bg-primary-indigo hover:bg-primary-indigo-hover text-white px-6 py-2.5 rounded-xl transition-all font-semibold text-sm shadow-md active:scale-95"
              >
                Write a Review
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-primary-indigo hover:bg-primary-indigo-hover text-white px-6 py-2.5 rounded-xl transition-all font-semibold text-sm inline-block shadow-md active:scale-95"
              >
                Login to Write a Review
              </Link>
            )}
          </div>
        </div>

        {/* Review Form Modal */}
        <ReviewFormModal
          productId={product._id}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}