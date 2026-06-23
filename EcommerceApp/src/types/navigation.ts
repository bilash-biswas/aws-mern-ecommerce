
export type RootStackParamList = {
  Splash: undefined;
  MainApp: undefined;
  AuthFlow: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Category: { category: string };
  Products: {
    category?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    keyword?: string;
    discount?: boolean;
  };
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  CheckoutSuccess: { orderId: string };
  Orders: undefined;
  Order: { orderId: string };
  Profile: undefined;
  UserManagement: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}