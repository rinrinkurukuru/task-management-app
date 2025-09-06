import api from "./api";
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from "../types/auth";

export const authAPI = {
  // ログイン
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    } catch (error: any) {
      console.error("Login error:", error);
      console.error("Error response:", error.response);
      if (error.response?.status === 401) {
        throw new Error("メールアドレスまたはパスワードが間違っています");
      } else if (error.response?.status === 422) {
        throw new Error("入力内容に不備があります");
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("ログインに失敗しました。再度お試しください。");
      }
    }
  },

  // 新規登録
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // 現在のユーザー情報取得
  getUser: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.get("/auth/user");
    return response.data;
  },

  // ログアウト
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // パスワードリセットリクエスト
  forgotPassword: async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // パスワードリセット
  resetPassword: async (data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  // メールアドレス検証
  verifyEmail: async (
    token: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  // ヘルスチェック
  healthCheck: async (): Promise<{ status: string }> => {
    const response = await api.get("/health");
    return response.data;
  },
};
