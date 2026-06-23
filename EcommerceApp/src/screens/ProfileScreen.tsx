import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { updateUserProfile, logoutUser } from '../store/slices/authSlice';
import { loadFavorites, toggleFavorite } from '../store/slices/favoriteSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchProductDetails } from '../store/slices/productSlice';
import { showToast } from '../utils/toast';
import { Product } from '../types/product';
import { theme } from '../theme/theme';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const {
    user,
    loading: authLoading,
    error,
  } = useAppSelector(state => state.auth);
  const { items: favorites, loading: favoritesLoading } = useAppSelector(
    state => state.favorites,
  );

  useEffect(() => {
    dispatch(loadFavorites());
  }, [dispatch]);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      if (favorites.length > 0) {
        try {
          const productPromises = favorites.map(fav =>
            dispatch(fetchProductDetails(fav.productId)).unwrap(),
          );
          const products = await Promise.all(productPromises);
          setFavoriteProducts(products.filter(Boolean) as Product[]);
        } catch (error) {
          console.error('Error fetching favorite products:', error);
        }
      } else {
        setFavoriteProducts([]);
      }
    };
    fetchFavoriteProducts();
  }, [favorites, dispatch]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setMessage('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await dispatch(updateUserProfile(updateData)).unwrap();
      showToast('Profile updated successfully!', 'success');
      setMessage('Profile updated successfully!');
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
      setIsEditing(false);
    } catch (error: any) {
      showToast(error || 'Failed to update profile', 'error');
      setMessage(error || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserManagement = () => {
    navigation.navigate('UserManagement' as never);
  };
  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await dispatch(toggleFavorite(productId)).unwrap();
      showToast('Removed from favorites', 'success');
    } catch (error) {
      showToast('Failed to remove from favorites', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      showToast('Logged out successfully', 'success');
    } catch (err: any) {
      showToast(err || 'Failed to logout', 'error');
    }
  };

  const cancelEdit = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
      });
    }
    setIsEditing(false);
    setMessage('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (authLoading && !user) {
    return (
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primaryLight} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>My Profile</Text>

        {message ? (
          <View style={styles.successContainer}>
            <Icon name="checkmark-circle-outline" size={18} color={theme.colors.secondary} />
            <Text style={styles.successText}>{message}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={18} color={theme.colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal Info</Text>
            {!isEditing && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
                activeOpacity={0.7}
              >
                <Icon name="create-outline" size={14} color={theme.colors.white} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={text => handleChange('name', text)}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.colors.textMuted}
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={text => handleChange('email', text)}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={text => handleChange('password', text)}
                  placeholder="Leave blank to keep same"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry
                  editable={!isSubmitting}
                />
              </View>

              {formData.password ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.confirmPassword}
                    onChangeText={text => handleChange('confirmPassword', text)}
                    placeholder="Confirm new password"
                    placeholderTextColor={theme.colors.textMuted}
                    secureTextEntry
                    editable={!isSubmitting}
                  />
                </View>
              ) : null}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cancelEdit}
                  disabled={isSubmitting}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={theme.colors.white} size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{user?.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Account Status</Text>
                <View style={styles.roleContainer}>
                  <Text style={styles.infoValue}>
                    {user?.isAdmin ? 'Administrator' : 'Standard Account'}
                  </Text>
                  {user?.isAdmin && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminBadgeText}>ADMIN</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Joined Date</Text>
                <Text style={styles.infoValue}>
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* User Management Row Trigger for Admins */}
        {user?.isAdmin && (
          <TouchableOpacity
            style={styles.adminCard}
            onPress={handleUserManagement}
            activeOpacity={0.85}
          >
            <View style={styles.adminCardContent}>
              <Icon name="people-circle-outline" size={26} color={theme.colors.primaryLight} />
              <View style={styles.adminCardText}>
                <Text style={styles.adminCardTitle}>User Management</Text>
                <Text style={styles.adminCardSubtitle}>
                  View and manage system users
                </Text>
              </View>
              <Icon name="chevron-forward-outline" size={20} color={theme.colors.textMuted} />
            </View>
          </TouchableOpacity>
        )}

        {/* Favorites List Container */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="heart" size={18} color={theme.colors.danger} />
              <Text style={styles.cardTitle}>My Favorites</Text>
            </View>
            <Text style={styles.favCountText}>{favorites.length}</Text>
          </View>

          {favoritesLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primaryLight} style={{ margin: 20 }} />
          ) : favorites.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="heart-dislike-outline" size={40} color={theme.colors.textMuted} />
              <Text style={styles.emptyTitle}>No Favorites Yet</Text>
              <Text style={styles.emptyText}>
                Click the heart icon on products to save them here.
              </Text>
            </View>
          ) : (
            <View style={styles.favoritesList}>
              {favoriteProducts.map(product => (
                <TouchableOpacity
                  key={product._id}
                  style={styles.favoriteItem}
                  onPress={() => handleProductPress(product._id)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: product.image }}
                    style={styles.favoriteImage}
                    resizeMode="cover"
                  />
                  <View style={styles.favoriteInfo}>
                    <Text style={styles.favoriteName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.favoritePrice}>
                      {formatPrice(product.price)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeFavoriteButton}
                    onPress={() => handleRemoveFavorite(product._id)}
                    activeOpacity={0.7}
                  >
                    <Icon name="close" size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Icon name="log-out-outline" size={18} color={theme.colors.white} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.roundness.sm,
    gap: 4,
  },
  editButtonText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  form: {
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.sm,
    backgroundColor: theme.colors.surfaceLight,
  },
  cancelButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.roundness.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  infoLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adminBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  adminBadgeText: {
    color: theme.colors.primaryLight,
    fontSize: 9,
    fontWeight: '800',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 12,
    borderRadius: theme.roundness.sm,
    marginBottom: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  successText: {
    color: theme.colors.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 12,
    borderRadius: theme.roundness.sm,
    marginBottom: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  adminCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  adminCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminCardText: {
    flex: 1,
  },
  adminCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  adminCardSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  favCountText: {
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    color: theme.colors.textPrimary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  emptyText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  favoritesList: {
    gap: 10,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.roundness.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  favoriteImage: {
    width: 50,
    height: 50,
    borderRadius: theme.roundness.sm,
    backgroundColor: theme.colors.surface,
  },
  favoriteInfo: {
    flex: 1,
    marginLeft: 10,
  },
  favoriteName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  favoritePrice: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.secondary,
  },
  removeFavoriteButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.danger,
    paddingVertical: 14,
    borderRadius: theme.roundness.sm,
    marginTop: 8,
    marginBottom: 24,
    gap: 8,
    ...theme.shadows.soft,
  },
  logoutButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
