import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getMyOrders, getAllOrders } from '../store/slices/orderSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootState } from '../store/store';
import { theme } from '../theme/theme';

export default function OrdersScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { orders, loading, error } = useAppSelector(
    (state: RootState) => state.orders,
  );
  const { user } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user?._id) return;
    if (user.isAdmin) {
      dispatch(getAllOrders());
    } else {
      dispatch(getMyOrders());
    }
  }, [user?._id, user?.isAdmin, dispatch]);

  const handleContinueShopping = () => {
    navigation.navigate('Products' as any, { category: 'all' });
  };

  const handleViewOrderDetails = (orderId: string) => {
    navigation.navigate('Order' as any, { orderId: orderId }); 
  };

  const getOrderStatus = (order: any) => {
    if (order.isPaid && order.isDelivered) {
      return { text: 'Delivered', color: theme.colors.secondary, bgColor: 'rgba(16, 185, 129, 0.15)' };
    } else if (order.isPaid && order.isShipped) {
      return { text: 'Shipped', color: theme.colors.primaryLight, bgColor: 'rgba(99, 102, 241, 0.15)' };
    } else if (order.isPaid) {
      return { text: 'Paid', color: theme.colors.secondary, bgColor: 'rgba(16, 185, 129, 0.15)' };
    } else {
      return { text: 'Pending Payment', color: theme.colors.accent, bgColor: 'rgba(245, 158, 11, 0.15)' };
    }
  };

  const getStatusIcon = (order: any) => {
    if (order.isPaid && order.isDelivered) return 'checkmark-circle-outline';
    if (order.isPaid && order.isShipped) return 'airplane-outline';
    if (order.isPaid) return 'wallet-outline';
    return 'time-outline';
  };

  const renderOrderItem = ({ item: order }: { item: any }) => {
    const status = getOrderStatus(order);
    const statusIcon = getStatusIcon(order);

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>
            Order ID: #{order._id?.substring(0, 8).toUpperCase()}
          </Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Bill</Text>
            <Text style={styles.detailValue}>
              ${order.totalPrice?.toFixed(2)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
              <Icon 
                name={statusIcon} 
                size={12} 
                color={status.color} 
              />
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.text}
              </Text>
            </View>
          </View>

          {user?.isAdmin && order.user && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Customer</Text>
                <Text style={styles.detailValue}>{order.user.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{order.user.email}</Text>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => handleViewOrderDetails(order._id)}
          activeOpacity={0.8}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Icon name="arrow-forward-outline" size={14} color={theme.colors.primaryLight} />
        </TouchableOpacity>
      </View>
    );
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {user?.isAdmin ? 'All Orders' : 'My Orders'}
        </Text>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinueShopping}
          activeOpacity={0.7}
        >
          <Text style={styles.continueButtonText}>Shop</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={24} color={theme.colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (user?.isAdmin) {
                dispatch(getAllOrders());
              } else {
                dispatch(getMyOrders());
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && orders.length === 0 && (
        <View style={styles.emptyContainer}>
          <Icon name="receipt-outline" size={60} color={theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>
            {user?.isAdmin ? 'No Orders Found' : 'No Orders Yet'}
          </Text>
          <Text style={styles.emptyText}>
            {user?.isAdmin
              ? 'There are no orders in the system yet.'
              : "You haven't placed any orders yet."}
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={handleContinueShopping}
            activeOpacity={0.8}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && orders.length > 0 && (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          style={styles.flatList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flatList: {
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
  continueButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.roundness.sm,
    ...theme.shadows.soft,
  },
  continueButtonText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 16,
    margin: 16,
    borderRadius: theme.roundness.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.roundness.sm,
    marginTop: 8,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 16,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  shopButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.roundness.sm,
    ...theme.shadows.soft,
  },
  shopButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.md,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  orderDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  orderDetails: {
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.sm,
    backgroundColor: theme.colors.surfaceLight,
    gap: 4,
  },
  viewDetailsText: {
    color: theme.colors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
});