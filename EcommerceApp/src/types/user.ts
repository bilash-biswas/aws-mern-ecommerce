export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}