import React, { useCallback } from 'react';
import { Product } from '../types/product';
import { useNavigation } from '@react-navigation/native';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Text,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { showToast } from '../utils/toast';
import { useAppDispatch } from '../hooks/redux';
import { addToCart } from '../store/slices/cartSlice';
import { useFavorites } from '../hooks/useFavorites';
import { theme } from '../theme/theme';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
}

type ProductCardNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ProductDetail'
>;
const { width } = Dimensions.get('window');

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'default',
}) => {
  const navigation = useNavigation<ProductCardNavigationProp>();
  const dispatch = useAppDispatch();
  const { toggleFavorite, isFavorite } = useFavorites();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getDiscountBadge = () => {
    if (product.discount && product.discount > 0) {
      return (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{product.discount}%</Text>
        </View>
      );
    }
    return null;
  };

  const getStockStatus = () => {
    if (product.stock <= 0) {
      return <Text style={styles.outOfStockText}>Out of Stock</Text>;
    }
    if (product.stock < 10) {
      return <Text style={styles.lowStockText}>Only {product.stock} left</Text>;
    }
    return null;
  };

  const addToCartHandler = () => {
    if (product) {
      dispatch(addToCart(product));
      showToast(`${product.name}(s) added to cart!`, 'success');
    }
  };

  const handleFavoritePress = useCallback(async () => {
    await toggleFavorite(product._id);
  }, [product._id, toggleFavorite]);

  const isProductFavorite = isFavorite(product._id);

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.card, styles.compactCard]}
        onPress={() =>
          navigation.navigate('ProductDetail', { productId: product._id })
        }
        activeOpacity={0.85}
      >
        <Image source={{ uri: product.image }} style={styles.compactImage} />
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.compactPrice}>{formatPrice(product.price)}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color={theme.colors.accent} />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
        </View>
        {getDiscountBadge()}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('ProductDetail', { productId: product._id })
      }
      activeOpacity={0.85}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        {getDiscountBadge()}

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isProductFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isProductFavorite ? theme.colors.danger : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.category} numberOfLines={1}>
          {product.category}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={theme.colors.accent} />
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.reviewsText}>
              ({product.reviews?.length || 0})
            </Text>
          </View>
          {getStockStatus()}
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={addToCartHandler}
          activeOpacity={0.8}
        >
          <Ionicons name="cart-outline" size={15} color={theme.colors.white} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.md,
    padding: 10,
    width: width * 0.43,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  compactCard: {
    width: width * 0.36,
    padding: 8,
    marginRight: 10,
    marginBottom: 8,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 130,
    borderRadius: theme.roundness.sm,
    backgroundColor: theme.colors.surfaceLight,
  },
  compactImage: {
    width: '100%',
    height: 80,
    borderRadius: theme.roundness.sm,
    marginBottom: 6,
    backgroundColor: theme.colors.surfaceLight,
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: theme.roundness.sm,
    zIndex: 1,
  },
  discountText: {
    color: theme.colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  compactContent: {
    flex: 1,
  },
  category: {
    fontSize: 9,
    color: theme.colors.primaryLight,
    fontWeight: '700',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 6,
    lineHeight: 17,
    height: 34, // keep constant height for alignment
  },
  compactName: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
    lineHeight: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.secondary,
  },
  compactPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.secondary,
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 9,
    color: theme.colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    height: 18,
  },
  outOfStockText: {
    fontSize: 9,
    color: theme.colors.danger,
    fontWeight: '700',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  lowStockText: {
    fontSize: 9,
    color: theme.colors.accent,
    fontWeight: '700',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: theme.roundness.sm,
    gap: 5,
  },
  addToCartText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default ProductCard;
