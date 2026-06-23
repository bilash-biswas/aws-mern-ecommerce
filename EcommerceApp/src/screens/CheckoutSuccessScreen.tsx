import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { clearCartLocal, clearCartServer } from '../store/slices/cartSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme/theme';

type CheckoutSuccessRouteProp = RouteProp<RootStackParamList, 'CheckoutSuccess'>;

export default function CheckoutSuccessScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<CheckoutSuccessRouteProp>();
  const { orderId } = route.params;

  const { order } = useAppSelector(state => state.orders);

  useEffect(() => {
    dispatch(clearCartLocal());
    dispatch(clearCartServer());
  }, [dispatch]);

  const handleViewOrders = () => {
    navigation.navigate('Orders' as any);
  };

  const handleContinueShopping = () => {
    navigation.navigate('Products' as any, { category: 'all' });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Icon name="checkmark-circle-outline" size={48} color={theme.colors.secondary} />
          </View>

          <Text style={styles.title}>Order Confirmed!</Text>
          <Text style={styles.subtitle}>
            Thank you for shopping with us. Your order has been successfully
            placed and is being processed.
          </Text>

          {orderId && (
            <View style={styles.orderInfo}>
              <Text style={styles.infoLabel}>Order Reference</Text>
              <Text style={styles.orderNumber}>{orderId}</Text>
            </View>
          )}

          {order && (
            <View style={styles.orderInfo}>
              <Text style={styles.infoLabel}>Total Bill</Text>
              <Text style={styles.orderTotal}>
                ${order.totalPrice?.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleViewOrders}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>View My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleContinueShopping}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Icon name="mail-unread-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.footerText}>
              A confirmation email has been sent with your invoice details.
            </Text>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.md,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    ...theme.shadows.strong,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  orderInfo: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.roundness.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.secondary,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
    marginBottom: 24,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.roundness.sm,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 14,
    borderRadius: theme.roundness.sm,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 16,
    width: '100%',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    flex: 1,
  },
});