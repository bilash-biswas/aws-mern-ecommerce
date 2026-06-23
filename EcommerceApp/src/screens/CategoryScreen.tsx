import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  StatusBar,
  Animated,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { RootState } from '../store/store';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { Product } from '../types/product';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');

type CategoryScreenRouteProp = RouteProp<RootStackParamList, 'Category'>;

const CategoryScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<CategoryScreenRouteProp>();
  const { category } = route.params;

  const [refreshing, setRefreshing] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

  const { 
    products, 
    categories, 
    loading 
  } = useAppSelector((state: RootState) => state.products);

  const categoryProducts = products.filter(product => 
    product.category === category
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchProducts({ category }));
    setRefreshing(false);
  };

  useEffect(() => {
    dispatch(fetchProducts({ category }));
  }, [dispatch, category]);

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCardWrapper}>
      <ProductCard product={item} />
    </View>
  );

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        item === category && styles.activeCategoryItem
      ]}
      onPress={() => navigation.navigate('Category', { category: item })}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.categoryItemText,
        item === category && styles.activeCategoryItemText
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
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
      
      {/* Animated Fixed Header (Fades in on scroll) */}
      <Animated.View 
        style={[
          styles.floatingHeader,
          {
            opacity: headerOpacity,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.headerIconButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.floatingHeaderTitle} numberOfLines={1}>
          {category}
        </Text>
        <View style={{ width: 32 }} />
      </Animated.View>

      {/* Main Top Header Bar (Static) */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity 
          style={styles.headerIconButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.fixedHeaderTitle} numberOfLines={1}>
          {category}
        </Text>
        <TouchableOpacity 
          style={styles.headerIconButton}
          onPress={() => navigation.navigate('Products' as any)}
          activeOpacity={0.7}
        >
          <Icon name="search-outline" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primaryLight]}
            tintColor={theme.colors.primaryLight}
            backgroundColor={theme.colors.background}
          />
        }
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Section */}
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{category}</Text>
            <View style={styles.heroStats}>
              <View style={styles.stat}>
                <Icon name="sparkles-outline" size={14} color={theme.colors.accent} />
                <Text style={styles.statText}>{categoryProducts.length} Items</Text>
              </View>
              <View style={styles.stat}>
                <Icon name="star-outline" size={14} color={theme.colors.primaryLight} />
                <Text style={styles.statText}>Top Rated</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Categories Carousel */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Products Grid */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Products in {category}
            </Text>
          </View>

          {categoryProducts.length > 0 ? (
            <FlatList
              data={categoryProducts}
              renderItem={renderProduct}
              keyExtractor={item => item._id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsGrid}
              columnWrapperStyle={styles.productsRow}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Message 
              variant="info" 
              message={`No products found in ${category}`}
            />
          )}
        </View>

        {/* Other Categories Panel */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Related Categories</Text>
          <View style={styles.relatedCategories}>
            {categories
              .filter(cat => cat !== category)
              .slice(0, 4)
              .map((relatedCat, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.relatedCategoryCard}
                  onPress={() => navigation.navigate('Category', { category: relatedCat })}
                  activeOpacity={0.8}
                >
                  <View style={styles.relatedCategoryIcon}>
                    <Icon 
                      name="layers-outline" 
                      size={20} 
                      color={theme.colors.primaryLight} 
                    />
                  </View>
                  <Text style={styles.relatedCategoryText} numberOfLines={2}>
                    {relatedCat}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingTop: 56, // Push below static fixedHeader
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: theme.colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 999,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerIconButton: {
    padding: 6,
  },
  floatingHeaderTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  fixedHeaderTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    height: 160,
    position: 'relative',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
  },
  heroContent: {
    paddingHorizontal: 20,
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  categoriesSection: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  categoriesList: {
    gap: 8,
  },
  categoryItem: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.roundness.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeCategoryItem: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryItemText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  activeCategoryItemText: {
    color: theme.colors.white,
  },
  productsSection: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  productsGrid: {
    paddingBottom: 10,
  },
  productsRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCardWrapper: {
    width: (width - 44) / 2,
  },
  relatedSection: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 8,
  },
  relatedCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  relatedCategoryCard: {
    width: (width - 42) / 2,
    backgroundColor: theme.colors.background,
    padding: 14,
    borderRadius: theme.roundness.sm,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  relatedCategoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
});

export default CategoryScreen;