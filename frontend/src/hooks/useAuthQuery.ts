import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../services/authService';
import { useAuth } from './useAuth';
import { LoginCredentials, RegisterData } from '../types/auth';
import { AxiosError } from 'axios';
import { ApiError } from '../types/auth';

// 定数
const QUERY_KEYS = {
  USER: ['user'],
  HEALTH: ['health'],
} as const;

const CACHE_TIME = {
  USER: 1000 * 60 * 5, // 5分
  HEALTH: 1000 * 60,   // 1分
} as const;

// エラーメッセージ
const ERROR_MESSAGES = {
  LOGIN: 'ログインに失敗しました',
  REGISTER: '登録に失敗しました',
  LOGOUT: 'ログアウトに失敗しました',
  FORGOT_PASSWORD: 'パスワードリセットに失敗しました',
  RESET_PASSWORD: 'パスワードリセットに失敗しました',
  EMAIL_VERIFICATION: 'メール検証に失敗しました',
  FETCH_USER: 'ユーザー情報の取得に失敗しました',
} as const;

// 型定義
interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// 共通エラーハンドラー
const handleAuthError = (error: AxiosError<ApiError>, defaultMessage: string) => {
  const message = error.response?.data?.message || defaultMessage;
  console.error(message);
  return message;
};

// ログイン用フック
export const useLogin = () => {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authAPI.login(credentials),
    onSuccess: (data) => {
      if (data.success && data.data) {
        login(data.data.user, data.data.token);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER });
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      handleAuthError(error, ERROR_MESSAGES.LOGIN);
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
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER });
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      handleAuthError(error, ERROR_MESSAGES.REGISTER);
    },
  });
};

// ログアウト用フック
export const useLogout = () => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
  };

  return useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: handleLogout,
    onError: (error: AxiosError<ApiError>) => {
      // エラーが発生してもローカルでログアウト処理を実行
      handleLogout();
      handleAuthError(error, ERROR_MESSAGES.LOGOUT);
    },
  });
};

// 現在のユーザー情報取得用フック
export const useCurrentUser = () => {
  const { isAuthenticated, updateUser } = useAuth();

  const query = useQuery({
    queryKey: QUERY_KEYS.USER,
    queryFn: () => authAPI.getUser(),
    enabled: isAuthenticated,
    staleTime: CACHE_TIME.USER,
  });

  // React Query v5では、useEffectでsuccessとerrorを処理
  React.useEffect(() => {
    if (query.data?.success && query.data?.data?.user) {
      updateUser(query.data.data.user);
    }
  }, [query.data, updateUser]);

  React.useEffect(() => {
    if (query.error) {
      handleAuthError(query.error as AxiosError<ApiError>, ERROR_MESSAGES.FETCH_USER);
    }
  }, [query.error]);

  return query;
};

// パスワードリセットリクエスト用フック
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authAPI.forgotPassword(email),
    onError: (error: AxiosError<ApiError>) => {
      handleAuthError(error, ERROR_MESSAGES.FORGOT_PASSWORD);
    },
  });
};

// パスワードリセット用フック
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordData) => authAPI.resetPassword(data),
    onError: (error: AxiosError<ApiError>) => {
      handleAuthError(error, ERROR_MESSAGES.RESET_PASSWORD);
    },
  });
};

// メールアドレス検証用フック
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => authAPI.verifyEmail(token),
    onError: (error: AxiosError<ApiError>) => {
      handleAuthError(error, ERROR_MESSAGES.EMAIL_VERIFICATION);
    },
  });
};

// ヘルスチェック用フック
export const useHealthCheck = () => {
  return useQuery({
    queryKey: QUERY_KEYS.HEALTH,
    queryFn: () => authAPI.healthCheck(),
    staleTime: CACHE_TIME.HEALTH,
    retry: 1,
  });
};