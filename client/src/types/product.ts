export interface ReviewUser {
  _id: string;
  name: string;
  email?: string;
}

export interface Review {
  _id: string;
  user: ReviewUser | string;
  name: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  helpful?: number;
  verifiedPurchase?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  totalSell: number;
  discount: number;
  numReviews: number;
  views: number;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}