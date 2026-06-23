// screens/ProductDetailScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { theme } from '../theme/theme';
import { RootState } from '../store/store';
import { fetchProductDetails } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { RootStackParamList } from '../types/navigation';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import ReviewFormModal from '../components/ReviewFormModal';
import { showToast } from '../utils/toast';
import { useFavorites } from '../hooks/useFavorites';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<ProductDetailRouteProp>();
  const { productId } = route.params;
  const { toggleFavorite, isFavorite } = useFavorites();

  const { products, loading, error } = useAppSelector(
    (state: RootState) => state.products,
  );
  const { user } = useAppSelector((state: RootState) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [autoSlide, setAutoSlide] = useState(true);

  const intervalRef = useRef<number | null>(null);
  const product = products[0];

  const productImages = [
    product?.image || 'https://via.placeholder.com/400',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
    'https://images.unsplash.com/photo-1485955900006-10f4d324d411',
  ];

  const calculateDiscount = () => {
    if (!product?.discount || product.discount <= 0) return null;
    const discountAmount = (product.price * product.discount) / 100;
    const discountedPrice = product.price - discountAmount;
    return {
      originalPrice: product.price,
      discountedPrice,
      discountAmount,
      discountPercent: product.discount,
      youSave: discountAmount,
    };
  };

  const discountInfo = calculateDiscount();

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductDetails(productId));
    }
  }, [dispatch, productId]);

  useEffect(() => {
    if (autoSlide && productImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setActiveImage(prev => (prev + 1) % productImages.length);
      }, 4000) as any;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoSlide, productImages.length]);

  const addToCartHandler = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        dispatch(addToCart(product));
      }
      showToast(`${quantity} ${product.name}(s) added to cart!`, 'success');
    }
  };

  const isProductFavorite = isFavorite(productId);

  const toggleFavoriteHandler = async () => {
    if (!product) return;
    try {
      await toggleFavorite(productId);
    } catch (error) {
      showToast('Failed to update favorites', 'error');
    }
  };

  const handleReviewSubmitted = () => {
    if (productId) {
      dispatch(fetchProductDetails(productId));
    }
  };

  const renderStarRating = (rating: number, size: number = 14) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <Icon
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={theme.colors.accent}
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  const goToImage = (index: number) => {
    setActiveImage(index);
    setAutoSlide(false);
    setTimeout(() => setAutoSlide(true), 5000);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Message variant="error" message={error || "Product not found"} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Navigation Breadcrumb / Top Row */}
        <View style={styles.breadcrumb}>
          <TouchableOpacity onPress={() => navigation.navigate('Home' as any)} style={styles.breadcrumbItem}>
            <Icon name="home-outline" size={14} color={theme.colors.primaryLight} />
            <Text style={styles.breadcrumbLink}>Home</Text>
          </TouchableOpacity>
          <Icon name="chevron-forward" size={12} color={theme.colors.textMuted} />
          <TouchableOpacity onPress={() => navigation.navigate('Products' as any)}>
            <Text style={styles.breadcrumbLink}>Products</Text>
          </TouchableOpacity>
          <Icon name="chevron-forward" size={12} color={theme.colors.textMuted} />
          <Text style={styles.breadcrumbCurrent} numberOfLines={1}>{product.name}</Text>
        </View>

        {/* Gallery Carousel */}
        <View style={styles.imageSection}>
          <View style={styles.mainImageContainer}>
            <Image
              source={{ uri: productImages[activeImage] }}
              style={styles.mainImage}
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />

            {imageLoading && (
              <View style={styles.imageLoader}>
                <ActivityIndicator size="small" color={theme.colors.primaryLight} />
              </View>
            )}

            {/* Auto-slide Controls & Counters */}
            <View style={styles.imageCountBadge}>
              <Text style={styles.imageCountText}>
                {activeImage + 1}/{productImages.length}
              </Text>
            </View>

            {discountInfo && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>
                  {discountInfo.discountPercent}% OFF
                </Text>
              </View>
            )}

            {/* Favorite Float */}
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={toggleFavoriteHandler}
              activeOpacity={0.8}
            >
              <Icon
                name={isProductFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isProductFavorite ? theme.colors.danger : theme.colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Gallery Dots Indicator */}
          {productImages.length > 1 && (
            <View style={styles.dotsContainer}>
              {productImages.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => goToImage(index)}
                  style={[
                    styles.dot,
                    activeImage === index && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Main Details Panel */}
        <View style={styles.detailsPanel}>
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.ratingRow}>
            {renderStarRating(product.rating, 16)}
            <Text style={styles.ratingText}>
              {product.rating.toFixed(1)} ({product.numReviews} Reviews)
            </Text>
            <View style={styles.badgeDivider} />
            <Text style={[styles.stockStatus, { color: product.stock > 0 ? theme.colors.secondary : theme.colors.danger }]}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>

          {/* Pricing Row */}
          <View style={styles.priceSection}>
            {discountInfo ? (
              <View style={styles.priceRow}>
                <Text style={styles.discountedPrice}>
                  ${discountInfo.discountedPrice.toFixed(2)}
                </Text>
                <Text style={styles.originalPrice}>
                  ${discountInfo.originalPrice.toFixed(2)}
                </Text>
                <View style={styles.savingsTag}>
                  <Text style={styles.savingsTagText}>
                    Save {discountInfo.discountPercent}%
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            )}
          </View>

          <Text style={styles.description}>{product.description}</Text>

          {/* Specifications Box */}
          <View style={styles.specsContainer}>
            <Text style={styles.specsTitle}>Specifications</Text>
            <View style={styles.specsGrid}>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Category</Text>
                <Text style={styles.specValue}>{product.category}</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>SKU Code</Text>
                <Text style={styles.specValue}>{product._id.substring(0, 8)}...</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Shipping</Text>
                <Text style={styles.specValue}>Free delivery above $100</Text>
              </View>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsTitle}>Customer Reviews</Text>
              {user ? (
                <TouchableOpacity
                  style={styles.writeReviewButton}
                  onPress={() => setShowReviewModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.writeReviewText}>Write Review</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login' as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginReviewText}>Sign in to review</Text>
                </TouchableOpacity>
              )}
            </View>

            {!product.reviews || product.reviews.length === 0 ? (
              <View style={styles.emptyReviews}>
                <Text style={styles.emptyReviewsText}>No reviews yet. Be the first to review!</Text>
              </View>
            ) : (
              <View style={styles.reviewsList}>
                {product.reviews.map(review => (
                  <View key={review._id} style={styles.reviewItem}>
                    <View style={styles.reviewHeaderRow}>
                      <Text style={styles.reviewAuthor}>{review.name || 'Anonymous'}</Text>
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.reviewRatingRow}>
                      {renderStarRating(review.rating, 12)}
                      {review.title && <Text style={styles.reviewTitleText}>{review.title}</Text>}
                    </View>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Sticky Buy Footer */}
      {product.stock > 0 ? (
        <View style={styles.buyFooter}>
          <View style={styles.quantitySection}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={styles.qtyButton}
              activeOpacity={0.7}
            >
              <Icon name="remove" size={16} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
              style={styles.qtyButton}
              activeOpacity={0.7}
            >
              <Icon name="add" size={16} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.addToCartStickyButton}
            onPress={addToCartHandler}
            activeOpacity={0.8}
          >
            <Icon name="cart-outline" size={18} color={theme.colors.white} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buyFooter}>
          <View style={styles.outOfStockBanner}>
            <Text style={styles.outOfStockBannerText}>Out of Stock</Text>
          </View>
        </View>
      )}

      {/* Review Form Modal */}
      <ReviewFormModal
        productId={product._id}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.roundness.sm,
    marginTop: 16,
  },
  backButtonText: {
    color: theme.colors.white,
    fontWeight: '700',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breadcrumbLink: {
    color: theme.colors.primaryLight,
    fontSize: 12,
    fontWeight: '600',
  },
  breadcrumbCurrent: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  imageSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  mainImageContainer: {
    width: '100%',
    height: 320,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.md,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 25, 0.5)',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.roundness.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  imageCountText: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.roundness.sm,
  },
  discountBadgeText: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 11,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.surfaceLight,
  },
  dotActive: {
    backgroundColor: theme.colors.primaryLight,
    width: 14,
  },
  detailsPanel: {
    paddingHorizontal: 16,
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  starContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  badgeDivider: {
    width: 1,
    height: 12,
    backgroundColor: theme.colors.border,
    marginHorizontal: 10,
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  priceSection: {
    marginBottom: 16,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.secondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  discountedPrice: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.secondary,
  },
  originalPrice: {
    fontSize: 18,
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  savingsTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.roundness.sm,
  },
  savingsTagText: {
    color: theme.colors.secondary,
    fontWeight: '700',
    fontSize: 11,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  specsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.md,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 24,
    ...theme.shadows.soft,
  },
  specsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  specsGrid: {
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  specLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  specValue: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  reviewsSection: {
    marginBottom: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  writeReviewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.roundness.sm,
    backgroundColor: theme.colors.surfaceLight,
  },
  writeReviewText: {
    color: theme.colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  loginReviewText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  emptyReviews: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.roundness.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyReviewsText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  reviewsList: {
    gap: 12,
  },
  reviewItem: {
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: theme.roundness.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reviewAuthor: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  reviewDate: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  reviewTitleText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  reviewComment: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  buyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...theme.shadows.strong,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.roundness.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  qtyButton: {
    padding: 10,
  },
  qtyValue: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
  addToCartStickyButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    height: 44,
    borderRadius: theme.roundness.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...theme.shadows.soft,
  },
  addToCartText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  outOfStockBanner: {
    flex: 1,
    backgroundColor: theme.colors.border,
    height: 44,
    borderRadius: theme.roundness.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBannerText: {
    color: theme.colors.textMuted,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ProductDetailScreen;
