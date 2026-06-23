import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";
import { Product } from "../../types/product";

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  topRatedProducts: Product[];
  categories: any[];
  product: Product | null;
  loading: boolean;
  error: string | null;
  page: number;
  pages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  topRatedProducts: [],
  categories: [],
  product: null,
  loading: false,
  error: null,
  page: 1,
  pages: 1,
  total: 0,
  hasNext: false,
  hasPrev: false,
};

// In client/src/store/slices/productSlice.ts
export const createReview = createAsyncThunk(
  "products/createReview",
  async (
    {
      productId,
      rating,
      title,
      comment,
    }: {
      productId: string;
      rating: number;
      title?: string;
      comment: string;
    },
    { rejectWithValue, getState }
  ) => {
    try {
      const { auth } = getState() as { auth: { token: string } };

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      };

      const { data } = await API.post(
        `/products/${productId}/reviews`,
        { rating, title, comment },
        config
      );

      return { productId, ...data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create review"
      );
    }
  }
);

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (
    params: {
      page?: number;
      pageSize?: number;
      keyword?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      minRating?: number;
      sort?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const {
        page = 1,
        pageSize = 8,
        keyword = "",
        category = "",
        minPrice,
        maxPrice,
        minRating,
        sort = "newest",
      } = params;

      let url = `/products?page=${page}&pageSize=${pageSize}`;

      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;
      if (minRating) url += `&minRating=${minRating}`;
      if (sort) url += `&sort=${encodeURIComponent(sort)}`;

      const response = await API.get(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  "products/fetchProductDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await API.get(`/products/${id}`);
      console.log("Fetched product details:", response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product details"
      );
    }
  }
);

// Add this to your existing productSlice
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
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

export const allCategories = createAsyncThunk(
  "products/categories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/products/all/categories");
      console.log("Fetched categories:", response.data);
      return response.data;
    } catch (error: any) {
      console.log("Error fetching categories:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const featuredProducts = createAsyncThunk(
  "products/featured",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/products/most/viewed");
      console.log("Fetched featured products:", response.data);
            // Handle both response formats: { products } or array
      if (Array.isArray(response.data)) {
        return response.data; // Direct array response
      } else if (response.data.products) {
        return response.data.products; // { products: [...] } response
      } else {
        return []; // Fallback if no products found
      }
    } catch (error: any) {
      console.log("Error fetching featured products:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch featured products"
      );
    }
  }
);

export const topRatedProducts = createAsyncThunk(
  "products/topRated",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/products/top/rated");
      console.log("Fetched featured products:", response.data);
            // Handle both response formats: { products } or array
      if (Array.isArray(response.data)) {
        return response.data; // Direct array response
      } else if (response.data.products) {
        return response.data.products; // { products: [...] } response
      } else {
        return []; // Fallback if no products found
      }
    } catch (error: any) {
      console.log("Error fetching featured products:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch featured products"
      );
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
        state.categories = state.categories;
        state.hasNext = action.payload.hasNext;
        state.hasPrev = action.payload.hasPrev;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch product details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        // For single product, we might want to handle it differently
        // For now, we'll just replace the products array with the single product
        state.products = [action.payload];
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (product) => product._id !== action.payload
        );
      })
      // In productSlice extraReducers
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;

        // Update the specific product's reviews and rating
        const { productId, reviews, rating, numReviews } = action.payload;

        // If we're viewing the product details, update that product
        if (state.product && state.product._id === productId) {
          state.product.reviews = reviews;
          state.product.rating = rating;
          state.product.numReviews = numReviews;
        }

        // Also update the product in the products list if it exists there
        const productIndex = state.products.findIndex(
          (p) => p._id === productId
        );
        if (productIndex !== -1) {
          state.products[productIndex].reviews = reviews;
          state.products[productIndex].rating = rating;
          state.products[productIndex].numReviews = numReviews;
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(allCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(allCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(allCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(featuredProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(featuredProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(featuredProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(topRatedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(topRatedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.topRatedProducts = action.payload;
      })
      .addCase(topRatedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = productSlice.actions;
export default productSlice.reducer;
