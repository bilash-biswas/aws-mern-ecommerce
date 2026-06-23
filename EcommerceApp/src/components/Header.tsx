import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { RootState } from '../store/store';
import { logoutUser } from '../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/redux';

const Header = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [isMounted, setIsMounted] = useState(false);

  const cartItems = useAppSelector((state: RootState) => state.cart.items);
  const { user } = useAppSelector((state: RootState) => state.auth);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const logoutHandler = () => {
    dispatch(logoutUser());
    navigation.navigate('Home' as any);
  };

  if (!isMounted) {
    return (
      <View style={styles.header}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.navigate('Home' as any)}>
            <Text style={styles.brand}>MERN</Text>
          </TouchableOpacity>
          <View style={styles.nav}>
            <View style={styles.skeleton} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home' as any)}
          style={styles.logoContainer}
        >
          <Text style={styles.brand}>MERN</Text>
          <Text style={styles.brandSecondary}>Store</Text>
        </TouchableOpacity>

        <View style={styles.nav}>
          <TouchableOpacity 
            style={styles.navIconButton}
            onPress={() => navigation.navigate('Products' as any)}
          >
            <Icon name="grid-outline" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cartContainer}
            onPress={() => navigation.navigate('Cart' as any)}
          >
            <Icon name="cart-outline" size={24} color={theme.colors.textPrimary} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartCountText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {user ? (
            <View style={styles.userSection}>
              {user.isAdmin && (
                <TouchableOpacity
                  style={styles.adminBadge}
                  onPress={() => navigation.navigate('AdminDashboard' as any)}
                >
                  <Icon name="shield-checkmark" size={16} color={theme.colors.accent} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.avatarButton}
                onPress={() => navigation.navigate('Profile' as any)}
              >
                <View style={styles.userAvatar}>
                  <Text style={styles.avatarText}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => navigation.navigate('Login' as any)}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primaryLight,
    letterSpacing: 0.5,
  },
  brandSecondary: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  navIconButton: {
    padding: 4,
  },
  cartContainer: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.secondary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartCountText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminBadge: {
    padding: 4,
  },
  avatarButton: {
    padding: 2,
  },
  userAvatar: {
    width: 32,
    height: 32,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  signInButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.roundness.sm,
  },
  signInText: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  skeleton: {
    width: 60,
    height: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.sm,
  },
});

export default Header;