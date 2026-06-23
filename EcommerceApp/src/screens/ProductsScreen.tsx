// screens/ProductsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Modal,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { Product } from '../types/product';
import { RootState } from '../store/store';
import { fetchProducts } from '../store/slices/productSlice';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { theme } from '../theme/theme';

type ProductsScreenRouteProp = RouteProp<{
  Products: {
    category?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  };
}, 'Products'>;

const ProductsScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<ProductsScreenRouteProp>();
  
  const { products, loading, error, page, pages, total } =
    useAppSelector((state: RootState) => state.products);

  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minRating: 0,
    sort: 'newest',
    page: 1,
    pageSize: 12,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [hasUserFiltered, setHasUserFiltered] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async (params: any) => {
    await dispatch(fetchProducts(params));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts(filters);
    setRefreshing(false);
  };

  useEffect(() => {
    const initialParams = {
      page: 1,
      pageSize: 12,
      sort: 'newest',
    };

    if (route.params?.category || route.params?.sort) {
      const newFilters = {
        ...filters,
        category: route.params.category || '',
        sort: route.params.sort || 'newest',
        page: 1,
      };
      setFilters(newFilters);
      setHasUserFiltered(true);
      loadProducts(newFilters);
    } else {
      loadProducts(initialParams);
    }
  }, [route.params]);

  useEffect(() => {
    if (hasUserFiltered) {
      const apiParams = {
        ...filters,
        page: Number(filters.page),
        pageSize: Number(filters.pageSize),
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        minRating: filters.minRating ? Number(filters.minRating) : undefined,
      };
      loadProducts(apiParams);
    }
  }, [filters, hasUserFiltered]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
    setHasUserFiltered(true);
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setFilters((prev) => ({
      ...prev,
      [type === 'min' ? 'minPrice' : 'maxPrice']: numericValue,
      page: 1,
    }));
    setHasUserFiltered(true);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    setHasUserFiltered(true);
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    setHasUserFiltered(true);
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      minRating: 0,
      sort: 'newest',
      page: 1,
      pageSize: 12,
    });
    setHasUserFiltered(false);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'views', label: 'Most Viewed' },
  ];

  const ratingOptions = [
    { value: '0', label: 'Any Rating' },
    { value: '4.5', label: '4.5+ Stars' },
    { value: '4', label: '4+ Stars' },
    { value: '3', label: '3+ Stars' },
  ];

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard product={item} />
  );

  const renderPaginationButton = (pageNum: number, label?: string) => (
    <TouchableOpacity
      key={pageNum}
      onPress={() => handlePageChange(pageNum)}
      style={[
        styles.paginationButton,
        filters.page === pageNum && styles.paginationButtonActive,
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.paginationButtonText,
          filters.page === pageNum && styles.paginationButtonTextActive,
        ]}
      >
        {label || pageNum}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
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
      >
        <View style={styles.content}>
          <Text style={styles.title}>All Products</Text>

          {/* Search and Filters Section */}
          <View style={styles.filterSection}>
            <View style={styles.searchRow}>
              <View style={styles.searchInputContainer}>
                <Icon name="search-outline" size={16} color={theme.colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search products..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={filters.keyword}
                  onChangeText={(text) => handleFilterChange('keyword', text)}
                  onSubmitEditing={handleSearch}
                />
              </View>

              <TouchableOpacity
                style={styles.filterTriggerButton}
                onPress={() => setShowFilters(true)}
                activeOpacity={0.7}
              >
                <Icon name="options-outline" size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Results Counters */}
            <View style={styles.resultsInfo}>
              <Text style={styles.resultsText}>
                Showing {products.length} of {total} products
              </Text>
              
              {hasUserFiltered && (
                <TouchableOpacity onPress={clearFilters} activeOpacity={0.7}>
                  <Text style={styles.clearFiltersText}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {loading && <Loader />}
          {error && <Message variant="error" message={error} />}

          {!loading && !error && products.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="search-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyStateText}>
                No products found matching your search.
              </Text>
            </View>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item._id}
                numColumns={2}
                columnWrapperStyle={styles.productGrid}
                scrollEnabled={false}
              />

              {/* Pagination */}
              {pages > 1 && (
                <View style={styles.pagination}>
                  <View style={styles.paginationControls}>
                    <TouchableOpacity
                      onPress={() => handlePageChange(Math.max(1, filters.page - 1))}
                      disabled={filters.page === 1}
                      style={[styles.paginationNavButton, filters.page === 1 && styles.paginationNavButtonDisabled]}
                      activeOpacity={0.7}
                    >
                      <Icon name="chevron-back" size={16} color={theme.colors.textPrimary} />
                    </TouchableOpacity>

                    <View style={styles.paginationNumbers}>
                      {renderPaginationButton(1)}
                      {filters.page > 3 && <Text style={styles.paginationEllipsis}>...</Text>}
                      
                      {(() => {
                        const buttons = [];
                        const startPage = Math.max(2, filters.page - 1);
                        const endPage = Math.min(pages - 1, filters.page + 1);

                        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
                          if (pageNum > 1 && pageNum < pages) {
                            buttons.push(renderPaginationButton(pageNum));
                          }
                        }
                        return buttons;
                      })()}

                      {filters.page < pages - 2 && <Text style={styles.paginationEllipsis}>...</Text>}
                      {pages > 1 && renderPaginationButton(pages)}
                    </View>

                    <TouchableOpacity
                      onPress={() => handlePageChange(Math.min(pages, filters.page + 1))}
                      disabled={filters.page === pages}
                      style={[styles.paginationNavButton, filters.page === pages && styles.paginationNavButtonDisabled]}
                      activeOpacity={0.7}
                    >
                      <Icon name="chevron-forward" size={16} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Modern Filter Overlay Drawer */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters & Sort</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)} activeOpacity={0.7}>
                <Icon name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Sort Section */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Sort Products By</Text>
                <View style={styles.sortOptionsList}>
                  {sortOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.chip,
                        filters.sort === opt.value && styles.chipActive,
                      ]}
                      onPress={() => handleFilterChange('sort', opt.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.chipText,
                        filters.sort === opt.value && styles.chipTextActive,
                      ]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price Range Filter */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Price Budget ($)</Text>
                <View style={styles.priceInputs}>
                  <View style={styles.priceInputRow}>
                    <Text style={styles.priceTextLabel}>Min</Text>
                    <TextInput
                      style={styles.priceInputField}
                      placeholder="0"
                      placeholderTextColor={theme.colors.textMuted}
                      value={filters.minPrice}
                      onChangeText={(text) => handlePriceChange('min', text)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.priceInputRow}>
                    <Text style={styles.priceTextLabel}>Max</Text>
                    <TextInput
                      style={styles.priceInputField}
                      placeholder="2000"
                      placeholderTextColor={theme.colors.textMuted}
                      value={filters.maxPrice}
                      onChangeText={(text) => handlePriceChange('max', text)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Minimum Rating */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Minimum Rating</Text>
                <View style={styles.sortOptionsList}>
                  {ratingOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.chip,
                        filters.minRating.toString() === opt.value && styles.chipActive,
                      ]}
                      onPress={() => handleFilterChange('minRating', opt.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.chipText,
                        filters.minRating.toString() === opt.value && styles.chipTextActive,
                      ]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.sm,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  filterTriggerButton: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  clearFiltersText: {
    color: theme.colors.primaryLight,
    fontWeight: '700',
    fontSize: 13,
  },
  productGrid: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  pagination: {
    marginTop: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paginationNavButton: {
    width: 36,
    height: 36,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationNavButtonDisabled: {
    opacity: 0.3,
  },
  paginationNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paginationButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.sm,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  paginationButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  paginationButtonTextActive: {
    color: theme.colors.white,
  },
  paginationEllipsis: {
    color: theme.colors.textMuted,
    paddingHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.roundness.lg,
    borderTopRightRadius: theme.roundness.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  sortOptionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: theme.colors.white,
  },
  priceInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.sm,
    paddingHorizontal: 10,
  },
  priceTextLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginRight: 6,
    fontWeight: '600',
  },
  priceInputField: {
    flex: 1,
    height: 40,
    color: theme.colors.textPrimary,
    fontSize: 13,
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ProductsScreen;