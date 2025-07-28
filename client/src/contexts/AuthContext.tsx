import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { authAPI, userAPI, getAuthToken, removeTokens } from '../services/api';

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAuthToken();
      
      if (token) {
        try {
          console.log('🔍 Validating existing token...');
          const response = await userAPI.getProfile();
          
          if (response.success && response.data) {
            setUser(response.data.user);
            setIsAuthenticated(true);
            console.log('✅ Token validated, user authenticated');
          }
        } catch (error) {
          console.error('❌ Token validation failed:', error);
          removeTokens();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('🔐 Logging in user...');
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('✅ Login successful');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('📝 Creating new account...');
      const response = await authAPI.signup(name, email, password);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('✅ Signup successful');
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Logging out user...');
      await authAPI.logout();
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ User logged out');
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      console.log('🔄 Refreshing token...');
      await authAPI.refreshToken();
      console.log('✅ Token refreshed');
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    refreshToken,
    isLoading,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};