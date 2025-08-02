/* eslint-disable @typescript-eslint/no-explicit-any */
import api, { ApiResponse } from './api';
import { z } from 'zod';
import Cookies from 'js-cookie';

// Define UserRole enum
export const UserRole = z.enum(['ADMIN', 'ANNOTATOR']);
export type UserRole = z.infer<typeof UserRole>;

// Define User type
export const UserSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(2),
  email: z.string().email(),
  role: UserRole,
  recorderId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.number().nullable(),
});

export type User = z.infer<typeof UserSchema>;

// Define CreateUser type
export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: UserRole,
  recorderId: z.string().optional(),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;

// Define UpdateUser type
export type UpdateUser = {
  name?: string;
  email?: string;
  password?: string;
  recorderId?: string;
};

// Define GetUsersResult type
export interface GetUsersResult {
  users: User[];
  total: number;
  totalPages: number;
  currentPage: number;
}

// Define specific response types
export type LoginResponse = ApiResponse<{
  user: User;
  token: string;
}>;

export type UserResponse = ApiResponse<{
  user: User;
}>;

export type UsersListResponse = ApiResponse<GetUsersResult>;

export type DeleteUserResponse = ApiResponse<never>;

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', { email, password });
      const loginResponse = response.data as LoginResponse;

      if (loginResponse.success && loginResponse.data) {
        // Store token in cookies
        Cookies.set('auth_token', loginResponse.data.token, {
          expires: 7, // Token expires in 7 days
          secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
          sameSite: 'strict', // Prevent CSRF
        });

        // Store specific user details in separate cookies
        const { id, name, email, role, recorderId } = loginResponse.data.user;
        Cookies.set('auth_user_id', id.toString(), {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        Cookies.set('auth_user_name', name, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        Cookies.set('auth_user_email', email, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        Cookies.set('auth_user_role', role, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        Cookies.set('auth_user_recorderId', recorderId || '', {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
      }

      return loginResponse;
    } catch (error: any) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  static async createUser(data: CreateUser): Promise<UserResponse> {
    try {
      const response = await api.post('/auth/register', data);
      return response.data as UserResponse;
    } catch (error: any) {
      throw new Error(`User creation failed: ${error.message}`);
    }
  }

  static async getAllUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  } = {}): Promise<UsersListResponse> {
    try {
      const response = await api.get('/auth/users', { params });
      return response.data as UsersListResponse;
    } catch (error: any) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  static async getUserById(id: number): Promise<UserResponse> {
    try {
      const response = await api.get(`/auth/users/${id}`);
      return response.data as UserResponse;
    } catch (error: any) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  static async updateUser(id: number, data: UpdateUser): Promise<UserResponse> {
    try {
      const response = await api.put(`/auth/users/${id}`, data);
      return response.data as UserResponse;
    } catch (error: any) {
      throw new Error(`User update failed: ${error.message}`);
    }
  }

  static async deleteUser(id: number): Promise<DeleteUserResponse> {
    try {
      const response = await api.delete(`/auth/users/${id}`);
      return response.data as DeleteUserResponse;
    } catch (error: any) {
      throw new Error(`User deletion failed: ${error.message}`);
    }
  }

  // Method to clear auth cookies (updated to remove all user-related cookies)
  static clearAuthCookies(): void {
    Cookies.remove('auth_token');
    Cookies.remove('auth_user_id');
    Cookies.remove('auth_user_name');
    Cookies.remove('auth_user_email');
    Cookies.remove('auth_user_role');
    Cookies.remove('auth_user_recorderId');
  }
}