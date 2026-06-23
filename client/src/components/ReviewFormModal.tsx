// client/src/components/ReviewFormModal.tsx
'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/hooks/redux';
import { createReview } from '@/store/slices/productSlice';
import { toast, Toaster } from 'react-hot-toast';

interface ReviewFormModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export default function ReviewFormModal({ 
  productId, 
  isOpen, 
  onClose, 
  onReviewSubmitted 
}: ReviewFormModalProps) {
  const dispatch = useAppDispatch();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    setLoading(true);
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
      onReviewSubmitted();
      onClose();
    } catch (error: any) {
      toast.error(error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-card-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-white">Write a Review</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white transition-colors duration-150 text-3xl line-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-border-dark hover:bg-border-dark/80 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
}