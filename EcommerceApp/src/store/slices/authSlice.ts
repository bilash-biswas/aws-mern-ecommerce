import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginData, SignupData } from '../../types/user';
import api from '../../services/api';
import { RootState } from '../store'; // Make sure you import RootState

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null
};

// Helper function to load initial state from AsyncStorage
export const loadInitialAuthState = createAsyncThunk(
  'auth/loadInitialState',
  async () => {
    try {
      const [userData, tokenData] = await Promise.all([
        AsyncStorage.getItem('userInfo'),
        AsyncStorage.getItem('token')
      ]);
      
      return {
        user: userData ? JSON.parse(userData) : null,
        token: tokenData ? tokenData : null
      };
    } catch (error) {
      console.error('Error loading initial auth state:', error);
      return { user: null, token: null };
    }
  }
);

// Login user
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/users/login', { email, password });

      // Store both user info and token
      await Promise.all([
        AsyncStorage.setItem('userInfo', JSON.stringify(data.user || data)),
        AsyncStorage.setItem('token', data.token)
      ]);
      
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

// Register user
export const signupUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, isAdmin = false }: { 
    name: string; 
    email: string; 
    password: string; 
    isAdmin?: boolean 
  }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/users/register', { name, email, password, isAdmin });

      await Promise.all([
        AsyncStorage.setItem('userInfo', JSON.stringify(data.user || data)),
        AsyncStorage.setItem('token', data.token)
      ]);
      
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: { 
    name: string; 
    email: string; 
    password?: string; 
    isAdmin?: boolean 
  }, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/users/profile', userData);

      // ✅ FIXED: Added await and proper error handling
      const currentUserInfoStr = await AsyncStorage.getItem('userInfo');
      const currentUserInfo = currentUserInfoStr ? JSON.parse(currentUserInfoStr) : {};
      
      const updatedUserInfo = { ...currentUserInfo, ...data.user || data };
      
      await Promise.all([
        AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo)),
        AsyncStorage.setItem('token', data.token)
      ]);
      
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

// Update user (for admin purposes)
export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (userData: { 
    _id: string;
    name: string; 
    email: string; 
    isAdmin: boolean;
  }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const auth = state.auth;
      
      const endpoint = userData._id === auth.user?._id 
        ? '/users/profile' 
        : `/admin/users/${userData._id}`;
      
      const { data } = await api.put(endpoint, userData);

      if (userData._id === auth.user?._id) {
        // ✅ FIXED: Added await and proper error handling
        const currentUserInfoStr = await AsyncStorage.getItem('userInfo');
        const currentUserInfo = currentUserInfoStr ? JSON.parse(currentUserInfoStr) : {};
        const updatedUserInfo = { ...currentUserInfo, ...data.user || data };
        
        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        
        if (data.token) {
          await AsyncStorage.setItem('token', data.token);
        }
      }
      
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user'
      );
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Clear all auth-related items
      await AsyncStorage.multiRemove(['userInfo', 'token', 'user', 'cart']);
      return null;
    } catch (error: any) {
      return rejectWithValue('Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      
      // Also persist to AsyncStorage (fire and forget)
      AsyncStorage.setItem('userInfo', JSON.stringify(action.payload.user));
      AsyncStorage.setItem('token', action.payload.token);
    },
    // Add a reducer to update user data without making API call
    updateUserData: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        
        // Update AsyncStorage as well
        AsyncStorage.setItem('userInfo', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load initial state
      .addCase(loadInitialAuthState.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        
        // Clear storage on login failure
        AsyncStorage.multiRemove(['userInfo', 'token']).catch(console.error);
      })
      // Register
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
        if (action.payload.token) {
          state.token = action.payload.token;
        }
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update User (admin)
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        // Only update current user if it's their own profile
        if (state.user && state.user._id === action.payload._id) {
          state.user = { ...state.user, ...action.payload.user || action.payload };
          if (action.payload.token) {
            state.token = action.payload.token;
          }
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
        state.loading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload as string;
        // Even if logout fails, clear local state
        state.user = null;
        state.token = null;
        state.loading = false;
      });
  },
});

export const { clearError, setLoading, setCredentials, updateUserData } = authSlice.actions;
export default authSlice.reducer;