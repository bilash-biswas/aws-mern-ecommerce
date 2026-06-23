import { Order } from "@/types/order";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface OrderState {
  orders: Order[];
  order: Order | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: OrderState = {
  orders: [],
  order: null,
  loading: false,
  error: null,
  success: false,
};

export const createOrder = createAsyncThunk(
  "orders/create",
  async (orderData: any, { rejectWithValue, getState }) => {
    console.log(orderData);
    try {
      const { auth } = getState() as { auth: { token: string } };

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const { data } = await axios.post("/api/orders", orderData, config);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Order creation failed"
      );
    }
  }
);

export const getOrderDetails = createAsyncThunk(
  "orders/getDetails",
  async (orderId: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };
      const { data } = await axios.get(`/api/orders/${orderId}`, config);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get order details"
      );
    }
  }
);

export const getMyOrders = createAsyncThunk(
  "orders/getMyOrders",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };
      const { data } = await axios.get("/api/orders/my/orders", config);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get orders"
      );
    }
  }
);

export const getAllOrders = createAsyncThunk(
  "orders/getAllOrders",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };
      const { data } = await axios.get("/api/orders", config);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get orders"
      );
    }
  }
);

export const markOrderAsPaid = createAsyncThunk(
  "orders/markAsPaid",
  async (orderId: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const { data } = await axios.put(
        `/api/orders/${orderId}/pay`,
        {},
        config
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark as paid"
      );
    }
  }
);

// NEW: Mark order as shipped (admin only)
export const markOrderAsShipped = createAsyncThunk(
  "orders/markAsShipped",
  async (orderId: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const { data } = await axios.put(
        `/api/orders/${orderId}/ship`,
        {},
        config
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark as shipped"
      );
    }
  }
);

// NEW: Mark order as delivered (admin only)
export const markOrderAsDelivered = createAsyncThunk(
  "orders/markAsDelivered",
  async (orderId: string, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const { data } = await axios.put(
        `/api/orders/${orderId}/deliver`,
        {},
        config
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark as delivered"
      );
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.order = null;
      state.success = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(markOrderAsPaid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markOrderAsPaid.fulfilled, (state, action) => {
        state.loading = false;

        if (state.order && state.order._id === action.payload._id) {
          state.order = action.payload;
        }

        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(markOrderAsPaid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // NEW: Mark as shipped cases
      .addCase(markOrderAsShipped.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markOrderAsShipped.fulfilled, (state, action) => {
        state.loading = false;
        if (state.order && state.order._id === action.payload._id) {
          state.order = action.payload;
        }
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(markOrderAsShipped.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // NEW: Mark as delivered cases
      .addCase(markOrderAsDelivered.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markOrderAsDelivered.fulfilled, (state, action) => {
        state.loading = false;
        if (state.order && state.order._id === action.payload._id) {
          state.order = action.payload;
        }
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(markOrderAsDelivered.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;
