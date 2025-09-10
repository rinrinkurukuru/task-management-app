import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useLogin } from '../hooks/useAuthQuery';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // URLパラメータまたは前のページからのエラーメッセージを表示
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');

    if (errorParam === 'auth_failed') {
      setError('認証に失敗しました。再度ログインしてください。');
    } else if (messageParam) {
      setError(decodeURIComponent(messageParam));
    }
  }, [location]);

  // React Queryのエラーを監視
  useEffect(() => {
    if (loginMutation.error) {
      const errorMessage = (loginMutation.error as any)?.response?.data?.message || 'ログインに失敗しました';
      setError(errorMessage);
      setPassword('');
    }
  }, [loginMutation.error]);

  // ログイン成功時の処理
  useEffect(() => {
    if (loginMutation.isSuccess) {
      navigate('/dashboard');
    }
  }, [loginMutation.isSuccess, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    loginMutation.mutate({ email, password });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center">
            ログイン
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="メールアドレス"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loginMutation.isPending}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="パスワード"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loginMutation.isPending}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? <CircularProgress size={24} /> : 'ログイン'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  パスワードを忘れた方はこちら
                </Typography>
              </Link>
              <Box mt={1}>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    アカウントをお持ちでない方はこちら
                  </Typography>
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;