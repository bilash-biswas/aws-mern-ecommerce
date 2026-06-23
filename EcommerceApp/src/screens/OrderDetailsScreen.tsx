import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getOrderDetails, markOrderAsPaid } from '../store/slices/orderSlice';
import Message from '../components/Message';
import Icon from 'react-native-vector-icons/Ionicons';
import { showToast } from '../utils/toast';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme/theme';

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'Order'>;

export default function OrderDetailsScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<OrderDetailRouteProp>();
  const { orderId } = route.params;

  const { order, loading, error } = useAppSelector(state => state.orders);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderDetails(orderId));
    }
  }, [dispatch, orderId]);

  const handlePayment = async () => {
    if (!order) return;
    setProcessingPayment(true);
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      await dispatch(markOrderAsPaid(order._id)).unwrap();
      showToast('Payment processed successfully!', 'success');
    } catch (error: any) {
      showToast(error || 'Payment failed. Please try again.', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleBackToOrders = () => {
    navigation.navigate('Orders' as any);
  };

  const getStatusColor = (status: boolean) => {
    return status ? theme.colors.secondary : theme.colors.accent;
  };

  const getStatusIcon = (status: boolean) => {
    return status ? 'checkmark-circle-outline' : 'time-outline';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primaryLight} />
        </View>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Message variant="error" message={error || "Order not found"} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToOrders}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Back to Orders</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Order Header Card */}
          <View style={styles.orderHeaderCard}>
            <Text style={styles.title}>Order Summary</Text>
            <Text style={styles.subtitle}>
              Invoice ID: #{order._id.toUpperCase()}
            </Text>

            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.isPaid) + '18' },
                ]}
              >
                <Icon
                  name={getStatusIcon(order.isPaid)}
                  size={14}
                  color={getStatusColor(order.isPaid)}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(order.isPaid) },
                  ]}
                >
                  Payment: {order.isPaid ? 'Paid' : 'Pending'}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.isDelivered) + '18' },
                ]}
              >
                <Icon
                  name={getStatusIcon(order.isDelivered)}
                  size={14}
                  color={getStatusColor(order.isDelivered)}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(order.isDelivered) },
                  ]}
                >
                  Delivery: {order.isDelivered ? 'Delivered' : 'Processing'}
                </Text>
              </View>
            </View>
          </View>

          {/* Shipping Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="navigate-outline" size={18} color={theme.colors.primaryLight} />
              <Text style={styles.cardTitle}>Shipping Details</Text>
            </View>
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Icon name="location-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>
                  {order.shippingAddress.address}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="business-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="earth-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>
                  {order.shippingAddress.country}
                </Text>
              </View>
            </View>
          </View>

          {/* Order Items Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="cart-outline" size={18} color={theme.colors.primaryLight} />
              <Text style={styles.cardTitle}>
                Items Purchased ({order.orderItems.length})
              </Text>
            </View>
            <View style={styles.itemsContainer}>
              {order.orderItems.map(item => (
                <View key={item._id} style={styles.itemCard}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>
                      Quantity: {item.quantity}
                    </Text>
                  </View>
                  <View style={styles.itemPrice}>
                    <Text style={styles.itemPriceText}>
                      ${item.price.toFixed(2)}
                    </Text>
                    <Text style={styles.itemTotalText}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Financial Breakdown Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="wallet-outline" size={18} color={theme.colors.primaryLight} />
              <Text style={styles.cardTitle}>Bill Summary</Text>
            </View>
            <View style={styles.paymentSummary}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Subtotal</Text>
                <Text style={styles.paymentValue}>
                  ${order.itemsPrice.toFixed(2)}
                </Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Shipping Fee</Text>
                <Text style={styles.paymentValue}>
                  ${order.shippingPrice.toFixed(2)}
                </Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Estimated Tax</Text>
                <Text style={styles.paymentValue}>
                  ${order.taxPrice.toFixed(2)}
                </Text>
              </View>
              <View style={styles.paymentDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Bill</Text>
                <Text style={styles.totalValue}>
                  ${order.totalPrice.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Payment Actions */}
            {!order.isPaid && (
              <View style={styles.paymentButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.paymentButton,
                    processingPayment && styles.disabledButton,
                  ]}
                  onPress={handlePayment}
                  disabled={processingPayment}
                  activeOpacity={0.8}
                >
                  {processingPayment ? (
                    <>
                      <ActivityIndicator color={theme.colors.white} size="small" />
                      <Text style={styles.paymentButtonText}>
                        Processing...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Icon name="card-outline" size={16} color={theme.colors.white} />
                      <Text style={styles.paymentButtonText}>
                        Proceed to Payment
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {order.isPaid && (
              <View style={styles.paidContainer}>
                <Icon name="checkmark-circle" size={20} color={theme.colors.secondary} />
                <Text style={styles.paidText}>Order Paid Successfully</Text>
              </View>
            )}
          </View>

          {/* Return triggers */}
          <TouchableOpacity
            style={styles.backToOrdersButton}
            onPress={handleBackToOrders}
            activeOpacity={0.7}
          >
            <Text style={styles.backToOrdersText}>Back to Orders</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  orderHeaderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.roundness.sm,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  infoContainer: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  itemsContainer: {
    gap: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.roundness.sm,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: theme.roundness.sm,
    backgroundColor: theme.colors.surface,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  itemPrice: {
    alignItems: 'flex-end',
  },
  itemPriceText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  itemTotalText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  paymentSummary: {
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  paymentValue: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  paymentDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.secondary,
  },
  paymentButtonContainer: {
    marginTop: 12,
  },
  paymentButton: {
    backgroundColor: theme.colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.roundness.sm,
    gap: 6,
    ...theme.shadows.soft,
  },
  disabledButton: {
    opacity: 0.5,
  },
  paymentButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  paidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 12,
    borderRadius: theme.roundness.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginTop: 12,
  },
  paidText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.secondary,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.roundness.sm,
    marginTop: 12,
  },
  backButtonText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  backToOrdersButton: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    borderRadius: theme.roundness.sm,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  backToOrdersText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
});