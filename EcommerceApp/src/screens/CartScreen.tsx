import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import {
  removeFromCart,
  updateQuantity,
  clearCartServer,
  syncCart
} from '../store/slices/cartSlice';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { RootState } from '../store/store';
import { showToast } from '../utils/toast';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../theme/theme';
import Loader from '../components/Loader';

const { width } = Dimensions.get('window');

export default function CartScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [isMounted, setIsMounted] = useState(false);
  
  const { items, total, loading, syncing } = useAppSelector((state: RootState) => state.cart);

  useEffect(() => {
    setIsMounted(true);
    dispatch(syncCart());
  }, [dispatch]);

  const handleIncrement = (id: string, item: any) => {
    if (item.quantity >= item.stock) {
      showToast(`Only ${item.stock} items available`, 'warning');
      return;
    }
    dispatch(updateQuantity(id, item.quantity + 1));
  };

  const handleDecrement = (id: string, item: any) => {
    if (item.quantity <= 1) {
      handleRemoveItem(id);
      return;
    }
    dispatch(updateQuantity(id, item.quantity - 1));
  };

  const handleRemoveItem = (id: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            dispatch(removeFromCart(id));
            showToast('Item removed from cart', 'success');
          },
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            dispatch(clearCartServer());
            showToast('Cart cleared', 'success');
          },
        },
      ]
    );
  };

  const calculateOrderTotal = () => {
    const subtotal = total;
    const shipping = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.1;
    return (subtotal + shipping + tax).toFixed(2);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  if (!isMounted || loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={70} color={theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptyText}>
            Looks like you haven't added any items to your cart yet.
          </Text>
          <TouchableOpacity
            style={styles.continueButton2}
            onPress={() => navigation.navigate('Products' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Shopping Cart</Text>
            <Text style={styles.subtitle}>{getTotalItems()} Items Selected</Text>
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCart}
            disabled={syncing}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={14} color={theme.colors.white} />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.itemsContainer}>
            {items.map((item) => (
              <View key={item._id} style={styles.cartItem}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  <Text style={[
                    styles.itemStock,
                    { color: item.stock < 10 ? theme.colors.accent : theme.colors.secondary }
                  ]}>
                    {item.stock > 10 ? 'In Stock' : `Only ${item.stock} left`}
                  </Text>
                </View>
                
                <View style={styles.quantitySection}>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleDecrement(item._id, item)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="remove" size={16} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleIncrement(item._id, item)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={16} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.itemTotal}>
                    <Text style={styles.itemTotalPrice}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item._id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle-outline" size={20} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Pricing Breakdown Summary */}
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>
                {total > 100 ? 'FREE' : '$10.00'}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (10%)</Text>
              <Text style={styles.summaryValue}>
                ${(total * 0.1).toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>${calculateOrderTotal()}</Text>
            </View>

            {total < 100 && (
              <View style={styles.shippingNote}>
                <Ionicons name="gift-outline" size={14} color={theme.colors.accent} />
                <Text style={styles.shippingNoteText}>
                  Add ${(100 - total).toFixed(2)} more for free shipping!
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('Checkout' as never)}
              activeOpacity={0.8}
            >
              <Ionicons name="lock-closed-outline" size={16} color={theme.colors.white} />
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('Products' as never)}
              activeOpacity={0.7}
            >
              <Text style={styles.continueText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {syncing && (
        <View style={styles.syncIndicator}>
          <ActivityIndicator size="small" color={theme.colors.primaryLight} />
          <Text style={styles.syncText}>Syncing cart...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.roundness.sm,
    gap: 4,
  },
  clearButtonText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
  itemsContainer: {
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: theme.roundness.sm,
    backgroundColor: theme.colors.background,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.secondary,
    marginBottom: 2,
  },
  itemStock: {
    fontSize: 10,
    fontWeight: '700',
  },
  quantitySection: {
    alignItems: 'center',
    marginRight: 6,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.sm,
    marginBottom: 6,
  },
  quantityButton: {
    padding: 6,
  },
  quantityText: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    alignItems: 'center',
  },
  itemTotalPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  removeButton: {
    padding: 4,
  },
  summary: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.md,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.secondary,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.roundness.sm,
    marginVertical: 12,
    gap: 6,
    ...theme.shadows.soft,
  },
  checkoutButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  continueButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  continueText: {
    color: theme.colors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  shippingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: theme.roundness.sm,
    padding: 10,
    marginTop: 10,
    gap: 6,
  },
  shippingNoteText: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  continueButton2: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.roundness.sm,
    ...theme.shadows.soft,
  },
  continueButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: 10,
    gap: 6,
  },
  syncText: {
    color: theme.colors.primaryLight,
    fontSize: 12,
    fontWeight: '600',
  },
});