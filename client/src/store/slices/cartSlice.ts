import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, CartState } from '../../types/cart';
import { Product } from '../../types/product';

const getInitialCartState = (): CartState => {
  if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('cart');
    return savedCart 
      ? JSON.parse(savedCart) 
      : { items: [], total: 0, loading: false, error: null };
  }
  return { items: [], total: 0, loading: false, error: null };
};

const initialState: CartState = getInitialCartState();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find(item => item._id === action.payload._id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      
      state.total = calculateTotal(state.items);
      saveCartToLocalStorage(state);
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item._id !== action.payload);
      state.total = calculateTotal(state.items);
      saveCartToLocalStorage(state);
    },
    
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item._id === action.payload.id);
      if (item && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity;
        state.total = calculateTotal(state.items);
        saveCartToLocalStorage(state);
      }
    },
    
    incrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item._id === action.payload);
      if (item) {
        item.quantity += 1;
        state.total = calculateTotal(state.items);
        saveCartToLocalStorage(state);
      }
    },
    
    decrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find(item => item._id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        state.total = calculateTotal(state.items);
        saveCartToLocalStorage(state);
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      localStorage.removeItem('cart');
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Helper function to calculate total
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Helper function to save cart to localStorage
const saveCartToLocalStorage = (state: CartState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify({
      items: state.items,
      total: state.total
    }));
  }
};

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  incrementQuantity, 
  decrementQuantity, 
  clearCart, 
  setLoading, 
  setError 
} = cartSlice.actions;

export default cartSlice.reducer;