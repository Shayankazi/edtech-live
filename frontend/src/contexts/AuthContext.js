import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        loading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.AUTH_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        loading: false,
        error: action.payload,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        loading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios interceptor for token refresh
  useEffect(() => {
    const requestInterceptor = authAPI.interceptors.request.use(
      (config) => {
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = authAPI.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (state.refreshToken) {
            try {
              const response = await authAPI.post('/auth/refresh', {
                refreshToken: state.refreshToken,
              });

              const { token, refreshToken } = response.data;
              
              // Update tokens
              localStorage.setItem('token', token);
              localStorage.setItem('refreshToken', refreshToken);
              
              dispatch({
                type: AUTH_ACTIONS.AUTH_SUCCESS,
                payload: {
                  user: state.user,
                  token,
                  refreshToken,
                },
              });

              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return authAPI(originalRequest);
            } catch (refreshError) {
              // Refresh failed, logout user
              logout();
              return Promise.reject(refreshError);
            }
          } else {
            // No refresh token, logout user
            logout();
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      authAPI.interceptors.request.eject(requestInterceptor);
      authAPI.interceptors.response.eject(responseInterceptor);
    };
  }, [state.token, state.refreshToken, state.user]);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        try {
          const response = await authAPI.get('/auth/me');
          dispatch({
            type: AUTH_ACTIONS.AUTH_SUCCESS,
            payload: {
              user: response.data.user,
              token: state.token,
              refreshToken: state.refreshToken,
            },
          });
        } catch (error) {
          console.error('Failed to load user:', error);
          // Clear invalid tokens
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });
      
      const response = await authAPI.post('/auth/login', {
        email,
        password,
      });

      const { user, token, refreshToken } = response.data;

      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: { user, token, refreshToken },
      });

      toast.success(`Welcome back, ${user.name}!`);
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: message,
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });
      
      const response = await authAPI.post('/auth/register', userData);
      const { user, token, refreshToken } = response.data;

      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: { user, token, refreshToken },
      });

      toast.success(`Welcome to VLP, ${user.name}!`);
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: message,
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint (optional)
      if (state.token) {
        await authAPI.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    }
  };

  // Update user profile
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Handle Google OAuth callback
  const handleGoogleCallback = (token, refreshToken) => {
    try {
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      // The user will be loaded by the useEffect hook
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      return { success: true };
    } catch (error) {
      console.error('Google callback error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  };

  const value = {
    // State
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    clearError,
    changePassword,
    handleGoogleCallback,
    
    // Computed values
    isAuthenticated: !!state.user,
    isInstructor: state.user?.role === 'instructor' || state.user?.role === 'admin',
    isAdmin: state.user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
