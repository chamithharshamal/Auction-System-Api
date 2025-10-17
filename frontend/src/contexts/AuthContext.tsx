import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/api';
import { UserRole } from '../types/api';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    roles: UserRole[];
  }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasRole: (role: UserRole) => boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Validate token with server
          const isValid = await authService.validateToken();
          if (isValid) {
            // Get fresh user data from server
            const user = await authService.getCurrentUser();
            // Update stored user data
            const token = localStorage.getItem('token')!;
            authService.storeUser(user, token);
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, token },
            });
          } else {
            authService.logout();
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          authService.logout();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const jwtResponse = await authService.login({ username, password });
      
      // Store the token immediately so the axios interceptor can use it
      localStorage.setItem('token', jwtResponse.token);
      
      // Now get the current user with the token in the header
      const user = await authService.getCurrentUser();
      
      authService.storeUser(user, jwtResponse.token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: jwtResponse.token },
      });
    } catch (error: any) {
      // Clean up token if login fails
      localStorage.removeItem('token');
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    roles: UserRole[];
  }) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const user = await authService.register(userData);
      
      // Auto-login after registration
      const jwtResponse = await authService.login({
        username: userData.username,
        password: userData.password,
      });
      
      // Store the token immediately so the axios interceptor can use it
      localStorage.setItem('token', jwtResponse.token);
      
      // Get updated user info with the token in the header
      const updatedUser = await authService.getCurrentUser();
      
      authService.storeUser(updatedUser, jwtResponse.token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: updatedUser, token: jwtResponse.token },
      });
    } catch (error: any) {
      // Clean up token if registration/login fails
      localStorage.removeItem('token');
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const hasRole = (role: UserRole): boolean => {
    return state.user?.roles?.includes(role) || false;
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
