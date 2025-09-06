import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    bgcolor="background.default"
  >
    <CircularProgress />
  </Box>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    // 認証が必要なページにアクセスしようとした場合、エラーメッセージ付きでログインページにリダイレクト
    const errorMessage = encodeURIComponent('ログインが必要です');
    return <Navigate to={`/login?error=auth_required&message=${errorMessage}`} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;