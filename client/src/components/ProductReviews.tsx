// client/src/components/ProductReviews.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { createReview, fetchProductDetails } from '@/store/slices/productSlice';
import { toast, Toaster } from 'react-hot-toast';
import { getReviewUser, getUserId, getUserName } from '@/utils/reviewUtils';

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const dispatch = useAppDispatch();
  const { product, loading } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductDetails(productId));
    }
  }, [dispatch, productId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    try {
      await dispatch(createReview({
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim()
      })).unwrap();
      
      toast.success('Review submitted successfully!');
      setRating(0);
      setTitle('');
      setComment('');
      setShowReviewForm(false);
    } catch (error: any) {
      toast.error(error || 'Failed to submit review');
    }
  };

  const sortedReviews = product?.reviews ? [...product.reviews] : [];
  
  // Sort reviews based on selected option
  switch (sortBy) {
    case 'newest':
      sortedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'oldest':
      sortedReviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'highest':
      sortedReviews.sort((a, b) => b.rating - a.rating);
      break;
    case 'lowest':
      sortedReviews.sort((a, b) => a.rating - b.rating);
      break;
  }

  // Check if current user has already reviewed this product
  const hasUserReviewed = user && product?.reviews?.some(review => {
    const reviewUserId = getUserId(review.user);
    return reviewUserId === user._id;
  });

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Customer Reviews</h2>
        
        {product?.reviews && product.reviews.length > 0 && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-card border border-card-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-indigo text-sm font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        )}
      </div>

      {/* Rating Summary */}
      {product && (
        <div className="bg-card border border-card-border rounded-2xl p-6 mb-6 flex items-center shadow-lg">
          <div className="text-4xl font-extrabold text-primary-indigo mr-5 bg-indigo-950/20 px-4 py-2.5 rounded-2xl border border-indigo-500/10">
            {product.rating.toFixed(1)}
          </div>
          <div>
            <div className="flex items-center mb-1 gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${
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
            <p className="text-sm text-text-muted">
              Based on {product.numReviews} review{product.numReviews !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Review Form */}
      {user && !hasUserReviewed && (
        <div className="mb-8">
          {!showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-primary-indigo hover:bg-primary-indigo-hover text-white px-6 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm shadow-md shadow-indigo-500/20 active:scale-95"
            >
              Write a Review
            </button>
          ) : (
            <div className="bg-card border border-card-border rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-white">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Rating *
                  </label>
                  <div className="flex space-x-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none hover:scale-110 active:scale-95 transition-transform duration-150"
                      >
                        <svg
                          className={`w-6 h-6 ${
                            star <= rating ? 'text-accent-amber' : 'text-border-dark'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Review Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo focus:border-transparent transition-all"
                    placeholder="Summarize your experience"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Review *
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-indigo focus:border-transparent transition-all"
                    placeholder="Share your experience with this product"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary-indigo hover:bg-primary-indigo-hover text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="bg-border-dark hover:bg-border-dark/80 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              <Toaster />
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      {sortedReviews.length === 0 ? (
        <div className="text-center py-8 bg-card border border-card-border rounded-2xl">
          <p className="text-text-muted text-sm">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map((review) => {
            const reviewUser = getReviewUser(review);
            
            return (
              <div key={review._id} className="bg-card border border-card-border rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white text-base">{reviewUser.name}</h4>
                    <div className="flex items-center mt-1 gap-1.5">
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
                      <span className="text-xs text-text-muted font-medium">
                        •
                      </span>
                      <span className="text-xs text-text-muted">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {review.title && (
                  <h5 className="font-bold text-white text-base mb-2">{review.title}</h5>
                )}
                
                <p className="text-sm text-gray-300 leading-relaxed">{review.comment}</p>
                <Toaster />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}