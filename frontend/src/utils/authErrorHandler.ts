import { NavigateFunction } from 'react-router-dom';

export interface AuthError {
  message: string;
  statusCode?: number;
  redirectToLogin?: boolean;
}

export const handleAuthError = (
  error: any,
  navigate: NavigateFunction,
  currentPath?: string
): string => {
  let errorMessage = 'エラーが発生しました';
  let shouldRedirect = false;

  if (error.response) {
    const status = error.response.status;
    
    switch (status) {
      case 401:
        errorMessage = 'メールアドレスまたはパスワードが間違っています';
        shouldRedirect = true;
        break;
      case 403:
        errorMessage = 'アクセス権限がありません';
        shouldRedirect = true;
        break;
      case 422:
        errorMessage = '入力内容に不備があります。再度確認してください。';
        break;
      case 429:
        errorMessage = 'リクエストが多すぎます。しばらく待ってから再度お試しください。';
        break;
      case 500:
        errorMessage = 'サーバーエラーが発生しました。管理者にお問い合わせください。';
        break;
      default:
        errorMessage = error.response.data?.message || 'ログインに失敗しました';
    }
  } else if (error.message) {
    errorMessage = error.message;
  }

  // ログインページ以外で認証エラーが発生した場合はリダイレクト
  if (shouldRedirect && currentPath !== '/login') {
    const encodedMessage = encodeURIComponent(errorMessage);
    navigate(`/login?error=auth_failed&message=${encodedMessage}`);
  }

  return errorMessage;
};

export const clearAuthErrorFromUrl = (navigate: NavigateFunction, currentPath: string) => {
  // URLからエラーパラメータを削除
  const url = new URL(window.location.href);
  if (url.searchParams.has('error') || url.searchParams.has('message')) {
    url.searchParams.delete('error');
    url.searchParams.delete('message');
    navigate(currentPath, { replace: true });
  }
};