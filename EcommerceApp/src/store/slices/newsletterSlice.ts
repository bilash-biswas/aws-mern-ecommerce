import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

interface NewsletterState {
  email: string;
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: NewsletterState = {
  email: "",
  loading: false,
  success: false,
  error: null,
};

export const subscribeNewsletter = createAsyncThunk(
  "newsletter/subscribe",
  async (email: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/newsletter/subscribe", { email });
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Subscription failed"
      );
    }
  }
);

const newsletterSlice = createSlice({
  name: "newsletter",
  initialState,
  reducers: {
    clearNewsletterState: (state) => {
      state.email = "";
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(subscribeNewsletter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(subscribeNewsletter.fulfilled, (state, action) => {
        state.email = action.payload;
        state.loading = false;
        state.error = null;
        state.success = true;
      })
      .addCase(subscribeNewsletter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { clearNewsletterState } = newsletterSlice.actions;
export default newsletterSlice.reducer;
