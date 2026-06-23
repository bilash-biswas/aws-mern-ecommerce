export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
  createdAt?: string;
  updatedAt?: string;
}