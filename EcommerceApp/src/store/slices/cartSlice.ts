import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, CartState } from '../../types/cart';
import { Product } from '../../types/product';
import api from '../../services/api';

// Helper function to extract only serializable cart data from server response
const normalizeServerCart = (serverResponse: any) => {
  if (!serverResponse) return null;
  
  // Extract only the cart data, not the entire response object
  const cartData = serverResponse.data || serverResponse;
  
  return {
    items: cartData.items?.map((item: any) => ({
      ...item.product,
      quantity: item.quantity
    })) || [],
    total: cartData.totalAmount || 0,
    updatedAt: cartData.updatedAt || new Date().toISOString()
  };
};

// Async thunks for API calls
export const syncCartWithServer = createAsyncThunk(
  'cart/syncCartWithServer',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cart');
      return normalizeServerCart(response);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCartServer = createAsyncThunk(
  'cart/addToCartServer',
  async ({ product, quantity }: { product: Product; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart', { productId: product._id, quantity });
      return normalizeServerCart(response);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItemServer = createAsyncThunk(
  'cart/updateCartItemServer',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/cart/${productId}`, { quantity });
      return normalizeServerCart(response);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromCartServer = createAsyncThunk(
  'cart/removeFromCartServer',
  async (productId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/cart/${productId}`);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCartServer = createAsyncThunk(
  'cart/clearCartServer',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/cart');
      return;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper functions
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const saveCartToAsyncStorage = async (state: CartState) => {
  try {
    await AsyncStorage.setItem('cart', JSON.stringify({
      items: state.items,
      total: state.total,
      lastSynced: state.lastSynced
    }));
  } catch (error) {
    console.error('Error saving cart to AsyncStorage:', error);
  }
};

const loadInitialCartState = async (): Promise<CartState> => {
  try {
    const savedCart = await AsyncStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      return {
        items: parsedCart.items || [],
        total: parsedCart.total || 0,
        lastSynced: parsedCart.lastSynced || null,
        loading: false,
        error: null,
        syncing: false
      };
    }
  } catch (error) {
    console.error('Error loading cart from AsyncStorage:', error);
  }
  
  return { 
    items: [], 
    total: 0, 
    lastSynced: null, 
    loading: false, 
    error: null, 
    syncing: false 
  };
};

const initialState: CartState = {
  items: [],
  total: 0,
  lastSynced: null,
  loading: false,
  error: null,
  syncing: false
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    initializeCart: (state, action: PayloadAction<CartState>) => {
      state.items = action.payload.items;
      state.total = action.payload.total;
      state.lastSynced = action.payload.lastSynced;
    },
    
    // Local cart actions (for offline support)
    addToCartLocal: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find(item => item._id === action.payload._id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      
      state.total = calculateTotal(state.items);
      state.lastSynced = null; // Mark as needing sync
      saveCartToAsyncStorage(state);
    },
    
    removeFromCartLocal: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item._id !== action.payload);
      state.total = calculateTotal(state.items);
      state.lastSynced = null;
      saveCartToAsyncStorage(state);
    },
    
    updateQuantityLocal: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item._id === action.payload.id);
      if (item) {
        if (action.payload.quantity > 0) {
          item.quantity = action.payload.quantity;
        } else {
          state.items = state.items.filter(cartItem => cartItem._id !== action.payload.id);
        }
        state.total = calculateTotal(state.items);
        state.lastSynced = null;
        saveCartToAsyncStorage(state);
      }
    },
    
    incrementQuantityLocal: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item._id === action.payload);
      if (item) {
        item.quantity += 1;
        state.total = calculateTotal(state.items);
        state.lastSynced = null;
        saveCartToAsyncStorage(state);
      }
    },
    
    decrementQuantityLocal: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item._id === action.payload);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items = state.items.filter(cartItem => cartItem._id !== action.payload);
        }
        state.total = calculateTotal(state.items);
        state.lastSynced = null;
        saveCartToAsyncStorage(state);
      }
    },
    
    clearCartLocal: (state) => {
      state.items = [];
      state.total = 0;
      state.lastSynced = null;
      AsyncStorage.removeItem('cart');
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.syncing = action.payload;
    },
    
    // Merge server cart with local cart (fixed to handle serializable data only)
    mergeCarts: (state, action: PayloadAction<{ serverCart: any; localCart: CartState }>) => {
      const { serverCart, localCart } = action.payload;
      
      if (!serverCart) {
        // No server cart available, use local cart
        state.lastSynced = null;
        return;
      }
      
      // Prefer server cart if it's more recent
      if (serverCart.updatedAt && state.lastSynced) {
        const serverTime = new Date(serverCart.updatedAt).getTime();
        const localTime = new Date(state.lastSynced).getTime();
        
        if (serverTime > localTime) {
          state.items = serverCart.items || [];
          state.total = serverCart.total || 0;
          state.lastSynced = new Date().toISOString();
        } else {
          // Use local cart and mark for sync
          state.lastSynced = null;
        }
      } else if (serverCart.items && serverCart.items.length > 0) {
        // No local sync time, use server cart
        state.items = serverCart.items;
        state.total = serverCart.total;
        state.lastSynced = new Date().toISOString();
      }
      
      saveCartToAsyncStorage(state);
    },
  },
  extraReducers: (builder) => {
    builder
      // Sync cart with server
      .addCase(syncCartWithServer.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(syncCartWithServer.fulfilled, (state, action) => {
        state.syncing = false;
        if (action.payload) {
          state.items = action.payload.items;
          state.total = action.payload.total;
          state.lastSynced = new Date().toISOString();
          saveCartToAsyncStorage(state);
        }
      })
      .addCase(syncCartWithServer.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload as string;
      })
      
      // Add to cart server
      .addCase(addToCartServer.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCartServer.fulfilled, (state, action) => {
        state.loading = false;
        state.lastSynced = new Date().toISOString();
        if (action.payload) {
          state.items = action.payload.items;
          state.total = action.payload.total;
          saveCartToAsyncStorage(state);
        }
      })
      .addCase(addToCartServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update cart item server
      .addCase(updateCartItemServer.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload.items;
          state.total = action.payload.total;
          state.lastSynced = new Date().toISOString();
          saveCartToAsyncStorage(state);
        }
      })
      
      // Remove from cart server
      .addCase(removeFromCartServer.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
        state.total = calculateTotal(state.items);
        state.lastSynced = new Date().toISOString();
        saveCartToAsyncStorage(state);
      })
      
      // Clear cart server
      .addCase(clearCartServer.fulfilled, (state) => {
        state.items = [];
        state.total = 0;
        state.lastSynced = new Date().toISOString();
        saveCartToAsyncStorage(state);
      });
  },
});

// Thunk to load cart from storage and sync with server
export const initializeCart = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    
    // Load from local storage first
    const localCartState = await loadInitialCartState();
    dispatch(cartSlice.actions.initializeCart(localCartState));
    
    // Try to sync with server if user is authenticated
    try {
      const response = await api.get('/cart');
      const serverCart = normalizeServerCart(response);
      
      dispatch(cartSlice.actions.mergeCarts({ 
        serverCart, 
        localCart: localCartState 
      }));
    } catch (error) {
      console.log('Server sync failed, using local cart:', error);
      // Continue with local cart if server sync fails
    }
    
  } catch (error) {
    dispatch(setError('Failed to initialize cart'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Thunk for adding to cart with offline support
export const addToCart = (product: Product, quantity: number = 1) => async (dispatch: any) => {
  try {
    // Optimistic local update
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCartLocal(product));
    }
    
    // Try server update
    try {
      await dispatch(addToCartServer({ product, quantity })).unwrap();
    } catch (error) {
      console.log('Server update failed, keeping local change:', error);
      // Local change remains, will sync later
    }
    
  } catch (error) {
    dispatch(setError('Failed to add item to cart'));
  }
};

// Thunk for updating quantity with offline support
export const updateQuantity = (productId: string, quantity: number) => async (dispatch: any) => {
  try {
    // Optimistic local update
    dispatch(updateQuantityLocal({ id: productId, quantity }));
    
    // Try server update
    try {
      await dispatch(updateCartItemServer({ productId, quantity })).unwrap();
    } catch (error) {
      console.log('Server update failed, keeping local change:', error);
    }
    
  } catch (error) {
    dispatch(setError('Failed to update quantity'));
  }
};

// Thunk for removing from cart with offline support
export const removeFromCart = (productId: string) => async (dispatch: any) => {
  try {
    // Optimistic local update
    dispatch(removeFromCartLocal(productId));
    
    // Try server update
    try {
      await dispatch(removeFromCartServer(productId)).unwrap();
    } catch (error) {
      console.log('Server update failed, keeping local change:', error);
    }
    
  } catch (error) {
    dispatch(setError('Failed to remove item from cart'));
  }
};

// Thunk to sync local changes with server
export const syncCart = () => async (dispatch: any, getState: any) => {
  const state = getState();
  const cart = state.cart;
  
  // Only sync if there are unsynced changes
  if (cart.lastSynced) return;
  
  try {
    dispatch(setSyncing(true));
    
    // Sync each item with server
    for (const item of cart.items) {
      try {
        await api.put(`/cart/${item._id}`, { quantity: item.quantity });
      } catch (error) {
        console.log(`Failed to sync item ${item._id}:`, error);
      }
    }
    
    // Update sync timestamp
    dispatch(cartSlice.actions.mergeCarts({
      serverCart: { items: cart.items, total: cart.total, updatedAt: new Date().toISOString() },
      localCart: cart
    }));
    
  } catch (error) {
    console.log('Cart sync failed:', error);
  } finally {
    dispatch(setSyncing(false));
  }
};

export const { 
  addToCartLocal, 
  removeFromCartLocal, 
  updateQuantityLocal, 
  incrementQuantityLocal, 
  decrementQuantityLocal, 
  clearCartLocal, 
  setLoading, 
  setError,
  setSyncing
} = cartSlice.actions;

export default cartSlice.reducer;