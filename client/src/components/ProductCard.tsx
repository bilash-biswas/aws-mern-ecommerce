"use client";

import Image from "next/image";
import { Product } from "@/types/product";
import { useAppDispatch } from "@/hooks/redux";
import { addToCart } from "@/store/slices/cartSlice";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { showToast } from "@/utils/toast";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const fallbackImage =
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking the button
    dispatch(addToCart(product));
    showToast("Product added to cart!", "success");
  };

  const handleProductClick = () => {
    // Navigate to product details page
    router.push(`/products/${product._id}`);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Calculate discounted price
  const discountAmount = product.discount ? (product.price * product.discount) / 100 : 0;
  const finalPrice = product.price - discountAmount;

  return (
    <div
      className="bg-card border border-card-border rounded-2xl overflow-hidden hover:translate-y-[-6px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.4)] transition-all duration-300 h-full flex flex-col cursor-pointer group"
      onClick={handleProductClick}
    >
      <div className="relative h-48 w-full overflow-hidden bg-background">
        <Image
          src={imageError ? fallbackImage : product.image || fallbackImage}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={handleImageError}
          priority={false}
        />
        {product.discount && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2.5 py-1 rounded-full text-xs font-bold z-10 shadow-lg shadow-red-500/20 animate-pulse">
            {product.discount}% OFF
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-base font-bold mb-1.5 line-clamp-1 text-white group-hover:text-primary-indigo transition-colors duration-200">
          {product.name}
        </h3>
        <p className="text-text-muted text-sm mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col">
            {product.discount ? (
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold text-accent-emerald">
                  ${finalPrice.toFixed(2)}
                </span>
                <span className="text-xs text-text-muted line-through">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-extrabold text-accent-emerald">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          <span className="text-xs text-text-muted font-medium bg-border-dark px-2 py-0.5 rounded-md">
            {product.stock} left
          </span>
        </div>
        <div className="flex items-center mb-4">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(product.rating)
                    ? "text-accent-amber"
                    : "text-border-dark"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-1.5 text-xs text-text-muted">
            ({product.numReviews})
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2.5 px-4 rounded-xl transition-all duration-200 font-semibold text-sm shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] disabled:from-border-dark disabled:to-border-dark disabled:text-text-muted disabled:cursor-not-allowed disabled:shadow-none mt-auto"
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
      <Toaster />
    </div>
  );
};

export default ProductCard;

