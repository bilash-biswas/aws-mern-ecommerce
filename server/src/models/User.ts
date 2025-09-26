import mongoose, { Document, Schema, Types } from "mongoose";
import { IProduct } from "./Product";

export interface IFavoriteItem {
  product: Types.ObjectId;
  addedAt: Date;
}

export interface ICartItem {
  product: Types.ObjectId | IProduct; // can be ObjectId or populated Product
  quantity: number;
  addedAt: Date;
}

export interface ICart {
  items: ICartItem[];
  totalItems: number;
  updatedAt: Date;
  // Remove totalAmount from the main interface since it's virtual
}

// Add a separate interface for when virtuals are populated
export interface ICartWithVirtuals extends ICart {
  totalAmount: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  favorites: IFavoriteItem[];
  cart: ICart; // Use the base interface without totalAmount
  createdAt: Date;
  updatedAt: Date;
}

// Virtual type for when you need the populated version
export type IUserWithVirtuals = Omit<IUser, 'cart'> & {
  cart: ICartWithVirtuals;
};

const favoriteItemSchema: Schema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartItemSchema: Schema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema: Schema = new Schema({
  items: [cartItemSchema],
  totalItems: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

const userSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    favorites: [favoriteItemSchema],
    cart: {
      type: cartSchema,
      default: () => ({
        items: [],
        totalItems: 0,
        updatedAt: new Date(),
      }),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Middleware to ensure cart exists and calculate totalItems
userSchema.pre<IUser>("save", function (next) {
  // Ensure cart exists
  if (!this.cart) {
    this.cart = {
      items: [],
      totalItems: 0,
      updatedAt: new Date(),
    };
  }
  
  // Ensure cart.items exists
  if (!this.cart.items) {
    this.cart.items = [];
  }
  
  if (this.isModified("cart.items")) {
    this.cart.totalItems = this.cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    this.cart.updatedAt = new Date();
  }
  next();
});

// Virtual for totalAmount with proper null checks
userSchema.virtual("cart.totalAmount").get(function (this: IUser) {
  // Ensure cart and items exist
  if (!this.cart || !this.cart.items) {
    return 0;
  }
  
  return this.cart.items.reduce((total, item) => {
    if (!item) return total;
    
    // Handle both populated and non-populated cases
    if (item.product && typeof item.product === 'object' && 'price' in item.product) {
      // Product is populated
      const product = item.product as IProduct;
      return total + item.quantity * (product.price || 0);
    }
    // Product is just ObjectId - return 0
    return total;
  }, 0);
});

// Indexes
userSchema.index({ "favorites.product": 1 });
userSchema.index({ "cart.items.product": 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ email: 1, isAdmin: 1 });
userSchema.index({ "cart.updatedAt": -1 });

export default mongoose.model<IUser>("User", userSchema);