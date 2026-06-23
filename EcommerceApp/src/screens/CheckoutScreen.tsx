import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { createOrder, clearOrder } from '../store/slices/orderSlice';
import { clearCartLocal, clearCartServer } from '../store/slices/cartSlice';
import { showToast } from '../utils/toast';
import Header from '../components/Header';
import Message from '../components/Message';
import { theme } from '../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function CheckoutScreen() {
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('PayPal');

  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const { items, total } = useAppSelector(state => state.cart);
  const { loading, error, success, order } = useAppSelector(
    state => state.orders,
  );

  useEffect(() => {
    if (success && order) {
      dispatch(clearCartLocal());
      dispatch(clearCartServer());
      dispatch(clearOrder());
      navigation.navigate('CheckoutSuccess' as any, { orderId: order._id });
    }
  }, [success, order, navigation, dispatch]);

  const itemsPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const submitHandler = () => {
    if (
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      Alert.alert('Error', 'Please fill in all shipping address fields');
      return;
    }

    const orderData = {
      orderItems: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price,
        product: item._id,
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice: itemsPrice,
      taxPrice: taxPrice,
      shippingPrice: shippingPrice,
      totalPrice: totalPrice,
    };

    dispatch(createOrder(orderData));
    showToast('Processing order...', 'info');
  };

  useEffect(() => {
    if (items.length === 0 && !success) {
      navigation.navigate('Cart' as any);
    }
  }, [items, success, navigation]);

  if (items.length === 0 && !success) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primaryLight} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Checkout</Text>

        {error && <Message variant="error" message={error} />}

        <View style={styles.content}>
          {/* Shipping Form Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.address}
                onChangeText={text =>
                  setShippingAddress({ ...shippingAddress, address: text })
                }
                placeholder="Enter your street address"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.city}
                onChangeText={text =>
                  setShippingAddress({ ...shippingAddress, city: text })
                }
                placeholder="Enter city name"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Postal Code</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.postalCode}
                onChangeText={text =>
                  setShippingAddress({ ...shippingAddress, postalCode: text })
                }
                placeholder="Enter postal code"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.country}
                onChangeText={text =>
                  setShippingAddress({ ...shippingAddress, country: text })
                }
                placeholder="Enter country name"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          </View>

          {/* Payment Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setPaymentMethod('PayPal')}
              activeOpacity={0.7}
            >
              <View style={[styles.radioCircle, paymentMethod === 'PayPal' && styles.radioCircleActive]}>
                {paymentMethod === 'PayPal' && (
                  <View style={styles.radioSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>PayPal / Card</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setPaymentMethod('Stripe')}
              activeOpacity={0.7}
            >
              <View style={[styles.radioCircle, paymentMethod === 'Stripe' && styles.radioCircleActive]}>
                {paymentMethod === 'Stripe' && (
                  <View style={styles.radioSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Credit Card (Stripe)</Text>
            </TouchableOpacity>
          </View>

          {/* Order Summary Checkout Card */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Order Items</Text>

            <View style={styles.itemsList}>
              {items.map(item => (
                <View key={item._id} style={styles.itemRow}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name} <Text style={{ color: theme.colors.textMuted }}>x{item.quantity}</Text>
                  </Text>
                  <Text style={styles.itemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${itemsPrice.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping Fee</Text>
              <Text style={styles.summaryValue}>${shippingPrice.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sales Tax</Text>
              <Text style={styles.summaryValue}>${taxPrice.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Bill</Text>
              <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={submitHandler}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <View style={styles.submitBtnContent}>
                <Ionicons name="card-outline" size={16} color={theme.colors.white} />
                <Text style={styles.submitButtonText}>Place Order Now</Text>
              </View>
            )}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 16,
    color: theme.colors.textPrimary,
  },
  content: {
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.background,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: theme.colors.primaryLight,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primaryLight,
  },
  radioLabel: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.roundness.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    ...theme.shadows.soft,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  summarySection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.md,
    padding: 16,
    marginBottom: 16,
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
  itemsList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
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
});