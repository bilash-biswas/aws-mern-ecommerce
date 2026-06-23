import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { FavoriteItem, FavoriteState } from '../../types/favorite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

const initialState: FavoriteState = {
  items: [],
  loading: false,
  error: null,
};

export const loadFavorites = createAsyncThunk(
  'favorites/loadFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const favoritesData = await AsyncStorage.getItem('favorites');
      return favoritesData ? JSON.parse(favoritesData) : [];
    } catch (error: any) {
      return rejectWithValue('Failed to load favorites');
    }
  },
);

export const toggleFavorite = createAsyncThunk(
  'favorites/toggleFavorite',
  async (productId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;

      const { auth } = state;
      const { favorites } = state;

      const isCurrentlyFavorite = favorites.items.some(
        (item: FavoriteItem) => item.productId === productId,
      );

      let updatedFavorites: FavoriteItem[];

      if (isCurrentlyFavorite) {
        updatedFavorites = favorites.items.filter(
          (item: FavoriteItem) => item.productId !== productId,
        );

        if (auth.user) {
          await api.delete(`/favorites/${productId}`);
        }
      } else {
        const newFavorite: FavoriteItem = {
          productId,
          addedAt: new Date().toISOString(),
        };

        updatedFavorites = [...favorites.items, newFavorite];

        if (auth.user) {
          await api.post('/favorites', { productId });
        }
      }

      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));

      return updatedFavorites;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to toggle favorite',
      );
    }
  },
);

export const syncFavorites = createAsyncThunk(
  'favorites/syncFavorites',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const { auth } = state;

      if (!auth.user) {
        return;
      }

      const localFavorites = await AsyncStorage.getItem('favorites');
      const localItems: FavoriteItem[] = localFavorites
        ? JSON.parse(localFavorites)
        : [];
      if (loadFavorites.length > 0) {
        const productTds = localItems.map(item => item.productId);
        await api.post('/favorites/sync', { productTds });

        await AsyncStorage.removeItem('favorites');
      }
      const response = await api.get('/favorites');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to sync favorites',
      );
    }
  },
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavorites: state => {
      state.items = [];
      state.error = null;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadFavorites.pending, state => {
        state.loading = true;
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleFavorite.pending, state => {
        state.loading = true;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(syncFavorites.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload;
        }
      });
  },
});

export const { clearFavorites, clearError } = favoritesSlice.actions;
export default favoritesSlice.reducer;