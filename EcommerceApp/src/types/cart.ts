import { Product } from './product';

export interface CartItem extends Product {
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  lastSynced: string | null;
  syncing: boolean;
  total: number;
  loading: boolean;
  error: string | null;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface PaymentMethod {
  method: 'PayPal' | 'Stripe' | 'CreditCard';
}