import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { toggleFavorite, loadFavorites, syncFavorites } from '../store/slices/favoriteSlice';
import { showToast } from '../utils/toast';

export const useFavorites = () => {
  const dispatch = useAppDispatch();
  const { items: favorites, loading, error } = useAppSelector((state) => state.favorites);
  const { user } = useAppSelector((state) => state.auth);

  const initializeFavorites = useCallback(async () => {
    await dispatch(loadFavorites());
    
    if (user) {
      await dispatch(syncFavorites());
    }
  }, [dispatch, user]);

  const toggleFavoriteHandler = useCallback(async (productId: string) => {
    try {
      await dispatch(toggleFavorite(productId)).unwrap();
      
      const isFavorite = favorites.some(item => item.productId === productId);
      showToast(
        isFavorite ? 'Removed from favorites' : 'Added to favorites',
        'success'
      );
    } catch (error) {
      showToast('Failed to update favorites', 'error');
    }
  }, [dispatch, favorites]);

  const isFavorite = useCallback((productId: string) => {
    return favorites.some(item => item.productId === productId);
  }, [favorites]);

  return {
    favorites,
    loading,
    error,
    initializeFavorites,
    toggleFavorite: toggleFavoriteHandler,
    isFavorite,
  };
};