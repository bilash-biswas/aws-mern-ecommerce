export interface FavoriteItem {
  productId: string;
  addedAt: string;
}

export interface FavoriteState {
  items: FavoriteItem[];
  loading: boolean;
  error: string | null;
}
