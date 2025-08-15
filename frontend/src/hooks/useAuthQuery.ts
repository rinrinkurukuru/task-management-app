import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../services/authService';
import { useAuth } from './useAuth';
import { LoginCredentials, RegisterData } from '../types/auth';
import { AxiosError } from 'axios';
import { ApiError } from '../types/auth';

// ログイン用フック
export const useLogin = () => {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authAPI.login(credentials),
    onSuccess: (data) => {
      if (data.success && data.data) {
        login(data.data.user, data.data.token);
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      console.error('Login error:', error.response?.data?.message || 'ログインに失敗しました');
    },
  });
};

// 新規登録用フック
export const useRegister = () => {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterData) => authAPI.register(userData),
    onSuccess: (data) => {
      if (data.success && data.data) {
        login(data.data.user, data.data.token);
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      console.error('Register error:', error.response?.data?.message || '登録に失敗しました');
    },
  });
};

// ログアウト用フック
export const useLogout = () => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
    onError: (error: AxiosError<ApiError>) => {
      // エラーが発生してもローカルでログアウト処理を実行
      logout();
      queryClient.clear();
      console.error('Logout error:', error.response?.data?.message || 'ログアウトに失敗しました');
    },
  });
};

// 現在のユーザー情報取得用フック
export const useCurrentUser = () => {
  const { isAuthenticated, updateUser } = useAuth();

  return useQuery({
    queryKey: ['user'],
    queryFn: () => authAPI.getUser(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
    onSuccess: (data) => {
      if (data.success && data.data.user) {
        updateUser(data.data.user);
      }
    },
    onError: (error: AxiosError) => {
      console.error('Failed to fetch user:', error.message);
    },
  });
};

// パスワードリセットリクエスト用フック
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authAPI.forgotPassword(email),
    onError: (error: AxiosError<ApiError>) => {
      console.error('Forgot password error:', error.response?.data?.message || 'パスワードリセットに失敗しました');
    },
  });
};

// パスワードリセット用フック
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: {
      token: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => authAPI.resetPassword(data),
    onError: (error: AxiosError<ApiError>) => {
      console.error('Reset password error:', error.response?.data?.message || 'パスワードリセットに失敗しました');
    },
  });
};

// メールアドレス検証用フック
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => authAPI.verifyEmail(token),
    onError: (error: AxiosError<ApiError>) => {
      console.error('Email verification error:', error.response?.data?.message || 'メール検証に失敗しました');
    },
  });
};

// ヘルスチェック用フック
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => authAPI.healthCheck(),
    staleTime: 1000 * 60, // 1分間キャッシュ
    retry: 1,
  });
};