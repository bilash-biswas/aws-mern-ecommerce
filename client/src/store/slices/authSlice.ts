import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API from '../../services/api';
import { User } from '../../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  loading: false,
  error: null,
};

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/users/login', { email, password });

      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, isAdmin = false }: { 
    name: string; 
    email: string; 
    password: string; 
    isAdmin?: boolean 
  }, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/users/register', { name, email, password, isAdmin });

      localStorage.setItem('userInfo', JSON.stringify(data));
      localStorage.setItem('token', data.token);
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
      const { data } = await API.put('/users/profile', userData);

      const currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const updatedUserInfo = { ...currentUserInfo, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      
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
      const { auth } = getState() as { auth: AuthState };
      
      const endpoint = userData._id === auth.user?._id 
        ? '/users/profile' 
        : `/admin/users/${userData._id}`;
      
      const { data } = await API.put(endpoint, userData);

      if (userData._id === auth.user?._id) {
        const currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const updatedUserInfo = { ...currentUserInfo, ...data };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
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
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        // If updating current user, update the state
        if (state.user && state.user._id === action.payload._id) {
          state.user = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;