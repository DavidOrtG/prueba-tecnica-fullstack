export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  concept: string;
  amount: number;
  type: TransactionType;
  date: Date;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: UserRole;
    phone?: string;
  };
  expires: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
