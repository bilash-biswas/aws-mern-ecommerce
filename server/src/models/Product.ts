// server/src/models/Product.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IReview {
  user: mongoose.Types.ObjectId;
  name: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: Date;
  helpful?: number;
  verifiedPurchase?: boolean;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  numReviews: number;
  views: number;
  reviews: IReview[];
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: '' },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  helpful: { type: Number, default: 0 },
  verifiedPurchase: { type: Boolean, default: false }
});

const productSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  views: { type: Number, required: true, default: 0 },
  reviews: [reviewSchema]
}, {
  timestamps: true
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ rating: -1, numReviews: -1 });

export default mongoose.model<IProduct>('Product', productSchema);