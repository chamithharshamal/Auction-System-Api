import api from './api';
import type { ApiResponse, LoginRequest, RegisterRequest, JwtResponse, User } from '../types/api';

export const authService = {
  // Login user
  async login(credentials: LoginRequest): Promise<JwtResponse> {
    const response = await api.post<ApiResponse<JwtResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  // Register user
  async register(userData: RegisterRequest): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/auth/register', userData);
    return response.data.data;
  },

  // Get current user info
  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  // Validate token
  async validateToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      const response = await api.post<ApiResponse<boolean>>('/auth/validate', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      return false;
    }
  },

  // Logout (client-side only)
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get stored user data
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Store user data
  storeUser(user: User, token: string): void {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  },
};