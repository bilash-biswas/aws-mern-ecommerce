import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  RefreshControl,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { Product } from '../types/product';
import { RootState } from '../store/store';
import {
  fetchProducts,
  allCategories,
  featuredProducts,
  topRatedProducts,
} from '../store/slices/productSlice';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { subscribeNewsletter } from '../store/slices/newsletterSlice';
import { theme } from '../theme/theme';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

  const {
    products,
    featuredProducts: featured,
    topRatedProducts: topRated,
    categories,
    loading,
    error,
  } = useAppSelector((state: RootState) => state.products);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(featuredProducts()),
      dispatch(allCategories()),
      dispatch(topRatedProducts()),
      dispatch(fetchProducts({})),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    onRefresh();
  }, [dispatch]);

  const handleSubscribe = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      await dispatch(subscribeNewsletter(email)).unwrap();
      Alert.alert('Success', 'Thank you for subscribing to our newsletter!');
      setEmail('');
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to subscribe. Please try again.');
    }
  };

  const renderCategory = ({ item, index }: { item: string; index: number }) => {
    const categoryIcons = [
      'apps-outline', 'phone-portrait-outline', 'desktop-outline', 'watch-outline', 
      'home-outline', 'bag-handle-outline', 'shirt-outline', 'game-controller-outline',
      'wine-outline', 'gift-outline', 'book-outline', 'barbell-outline',
      'leaf-outline', 'paw-outline', 'flower-outline', 'car-outline'
    ];
    const iconColors = [
      '#6366F1', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#06B6D4', '#F97316', '#84CC16',
      '#EC4899', '#14B8A6', '#F97316', '#EF4444',
      '#06B6D4', '#84CC16', '#22C55E', '#6366F1'
    ];

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => navigation.navigate('Category' as any, { category: item })}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.categoryIcon,
            { 
              backgroundColor: `${iconColors[index % iconColors.length]}15`,
              borderColor: `${iconColors[index % iconColors.length]}30`
            },
          ]}
        >
          <Icon
            name={categoryIcons[index % categoryIcons.length]}
            size={24}
            color={iconColors[index % iconColors.length]}
          />
        </View>
        <Text style={styles.categoryText} numberOfLines={2}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCardWrapper}>
      <ProductCard product={item} />
    </View>
  );

  const renderSection = (
    title: string,
    data: Product[],
    sortParam: string,
    icon: string,
    color: string
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <View style={[styles.sectionIconContainer, { backgroundColor: `${color}15` }]}>
            <Icon name={icon} size={18} color={color} />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Products' as any, { sort: sortParam })}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Icon name="chevron-forward" size={14} color={theme.colors.primaryLight} />
        </TouchableOpacity>
      </View>
      {data && data.length > 0 ? (
        <FlatList
          data={data.slice(0, 6)}
          renderItem={renderProduct}
          keyExtractor={item => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
          snapToInterval={width * 0.43 + 12}
          decelerationRate="fast"
        />
      ) : (
        <Message variant="info" message="No products found" />
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={theme.colors.background} barStyle="light-content" />
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.background} barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.floatingHeader,
          {
            opacity: headerOpacity,
          }
        ]}
      >
        <View style={styles.floatingHeaderContent}>
          <Text style={styles.brand}>MERN</Text>
          <Text style={styles.brandSecondary}>Store</Text>
        </View>
      </Animated.View>

      <Animated.ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primaryLight]}
            tintColor={theme.colors.primaryLight}
            backgroundColor={theme.colors.background}
          />
        }
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Hero Banner Section */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
            style={styles.heroBackground}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroSubtitle}>Premium shopping experience</Text>
            <Text style={styles.heroTitle}>Discover Amazing Products</Text>
            <Text style={styles.heroDescription}>
              Shop the latest trends with fast delivery and premium service.
            </Text>
            <View style={styles.heroButtonContainer}>
              <TouchableOpacity
                style={styles.heroButtonPrimary}
                onPress={() => navigation.navigate('Products' as any, { category: 'all' })}
                activeOpacity={0.8}
              >
                <Text style={styles.heroButtonPrimaryText}>Shop Now</Text>
                <Icon name="cart-outline" size={18} color={theme.colors.background} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Stats Panel */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="airplane-outline" size={20} color={theme.colors.primaryLight} />
            <Text style={styles.statNumber}>Fast</Text>
            <Text style={styles.statLabel}>Worldwide Shipping</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="star-outline" size={20} color={theme.colors.accent} />
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="shield-checkmark-outline" size={20} color={theme.colors.secondary} />
            <Text style={styles.statNumber}>Secure</Text>
            <Text style={styles.statLabel}>Payments & Refund</Text>
          </View>
        </View>

        {/* Categories Horizontal Panel */}
        {categories && categories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={[styles.sectionIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                  <Icon name="grid-outline" size={18} color="#8b5cf6" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Shop Categories</Text>
                </View>
              </View>
            </View>
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            />
          </View>
        )}

        {/* Featured Products List */}
        {renderSection('Featured Products', featured, 'featured', 'star-outline', theme.colors.accent)}

        {/* Dynamic Promotional Offer Banner */}
        <View style={styles.offerBanner}>
          <View style={styles.offerContent}>
            <View style={styles.offerBadge}>
              <Icon name="flash-outline" size={14} color={theme.colors.white} />
              <Text style={styles.offerBadgeText}>FLASH SALE</Text>
            </View>
            <Text style={styles.offerTitle}>Summer Sale! 🎉</Text>
            <Text style={styles.offerText}>
              Up to 50% off on premium items. Limited time offer!
            </Text>
            <TouchableOpacity
              style={styles.offerButton}
              onPress={() => navigation.navigate('Products' as any, { discount: true })}
              activeOpacity={0.8}
            >
              <Text style={styles.offerButtonText}>Shop Sale</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Rated Products List */}
        {renderSection('Top Rated', topRated, 'rating', 'trophy-outline', '#F59E0B')}

        {/* New Arrivals List */}
        {renderSection('New Arrivals', products, 'newest', 'sparkles-outline', '#06b6d4')}

        {/* Premium Newsletter Section */}
        <View style={styles.newsletterSection}>
          <View style={styles.newsletterContent}>
            <View style={styles.newsletterIcon}>
              <Icon name="mail-open-outline" size={32} color={theme.colors.primaryLight} />
            </View>
            <Text style={styles.newsletterTitle}>Stay Updated</Text>
            <Text style={styles.newsletterText}>
              Subscribe to get exclusive discount offers and new product announcements.
            </Text>

            <View style={styles.newsletterForm}>
              <View style={styles.emailInputContainer}>
                <Icon name="mail-outline" size={18} color={theme.colors.textSecondary} style={styles.emailIcon} />
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={handleSubscribe}
                activeOpacity={0.8}
              >
                <Text style={styles.subscribeButtonText}>Subscribe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  floatingHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primaryLight,
    letterSpacing: 0.5,
  },
  brandSecondary: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContainer: {
    height: 320,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
  },
  heroContent: {
    padding: 24,
  },
  heroSubtitle: {
    color: theme.colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 32,
  },
  heroDescription: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 19,
  },
  heroButtonContainer: {
    flexDirection: 'row',
  },
  heroButtonPrimary: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: theme.roundness.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...theme.shadows.soft,
  },
  heroButtonPrimaryText: {
    color: theme.colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: theme.roundness.md,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
    zIndex: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginVertical: 2,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 8,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.roundness.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    color: theme.colors.primaryLight,
    fontWeight: '600',
    fontSize: 13,
  },
  productList: {
    paddingRight: 4,
    paddingBottom: 8,
  },
  productCardWrapper: {
    width: width * 0.43,
    marginRight: 12,
  },
  categoryList: {
    paddingBottom: 4,
  },
  categoryCard: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: theme.roundness.md,
    alignItems: 'center',
    width: 90,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  offerBanner: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadows.soft,
  },
  offerContent: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.roundness.sm,
    marginBottom: 10,
    gap: 4,
  },
  offerBadgeText: {
    color: theme.colors.accent,
    fontSize: 10,
    fontWeight: '800',
  },
  offerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  offerText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  offerButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: theme.roundness.sm,
    ...theme.shadows.soft,
  },
  offerButtonText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  newsletterSection: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginVertical: 24,
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadows.soft,
  },
  newsletterContent: {
    padding: 24,
    alignItems: 'center',
  },
  newsletterIcon: {
    marginBottom: 12,
  },
  newsletterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  newsletterText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18,
  },
  newsletterForm: {
    width: '100%',
    gap: 12,
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.roundness.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
  },
  emailIcon: {
    marginRight: 8,
  },
  emailInput: {
    flex: 1,
    height: 44,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  subscribeButton: {
    backgroundColor: theme.colors.primary,
    height: 44,
    borderRadius: theme.roundness.sm,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  subscribeButtonText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default HomeScreen;