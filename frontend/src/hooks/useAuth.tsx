import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../types/auth';
import { authAPI } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化時に保存された認証情報をチェック
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        // トークンが有効か確認
        try {
          const response = await authAPI.getUser();
          if (response.success && response.data.user) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (error) {
          // トークンが無効な場合はクリア
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      console.log('loginWithCredentials called with:', { email });
      const response = await authAPI.login({ email, password });
      console.log('Auth response received:', response);
      if (response.success && response.data.user && response.data.token) {
        login(response.data.user, response.data.token);
      } else {
        console.error('Invalid response structure:', response);
        throw new Error('ログインレスポンスが不正です');
      }
    } catch (error: any) {
      console.error('loginWithCredentials error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  const updateUser = (user: User) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const checkAuthStatus = async () => {
    const savedToken = localStorage.getItem('auth_token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.getUser();
      if (response.success && response.data.user) {
        setUser(response.data.user);
        setToken(savedToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    login,
    loginWithCredentials,
    logout,
    updateUser,
    isAuthenticated: !!user && !!token,
    isLoading,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};