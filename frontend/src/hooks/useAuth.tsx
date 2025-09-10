import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../types/auth';
import { authAPI } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ローカルストレージのキー定数
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
} as const;

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ローカルストレージの操作を関数化
  const storage = {
    getToken: () => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
    getUser: () => {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      return savedUser ? JSON.parse(savedUser) : null;
    },
    setAuth: (user: User, token: string) => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },
    clearAuth: () => {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    },
  };

  // 初期化時に保存された認証情報をチェック
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = storage.getToken();
      const savedUser = storage.getUser();

      if (savedToken && savedUser) {
        setUser(savedUser);

        // トークンが有効か確認
        try {
          const response = await authAPI.getUser();
          if (response.success && response.data.user) {
            setUser(response.data.user);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
          }
        } catch (error) {
          // トークンが無効な場合はクリア
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    storage.setAuth(user, token);
  };

  const logout = () => {
    setUser(null);
    storage.clearAuth();
  };

  const updateUser = (user: User) => {
    setUser(user);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user && !!storage.getToken(),
    isLoading,
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