import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

interface AdminState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  loading: false,
  error: null,
};

// Get all users
export const getUsers = createAsyncThunk(
  "admin/getUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/admin/users");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

// Create user
export const createUser = createAsyncThunk(
  "admin/createUser",
  async (
    userData: {
      name: string;
      email: string;
      password: string;
      isAdmin: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await API.post("/admin/users", userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create user"
      );
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  "admin/updateUser",
  async (
    userData: { _id: string; name: string; email: string; isAdmin: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await API.put(`/admin/users/${userData._id}`, userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user"
      );
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      await API.delete(`/admin/users/${userId}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

// Create product
export const createProduct = createAsyncThunk(
  "admin/createProduct",
  async (
    productData: {
      name: string;
      description: string;
      price: number;
      image: string;
      category: string;
      stock: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await API.post("/products", productData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product"
      );
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  "admin/updateProduct",
  async (
    productData: {
      _id: string;
      name: string;
      description: string;
      price: number;
      image: string;
      category: string;
      stock: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await API.put(
        `/products/${productData._id}`,
        productData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product"
      );
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  "admin/deleteProduct",
  async (productId: string, { rejectWithValue }) => {
    try {
      await API.delete(`/products/${productId}`);
      return productId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get users
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create user
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      // Update user
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (user) => user._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
      })

      // Create product
      .addCase(createProduct.fulfilled, (state, action) => {
        // Product will be refetched by product slice
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        // Product will be refetched by product slice
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        // Product will be refetched by product slice
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
