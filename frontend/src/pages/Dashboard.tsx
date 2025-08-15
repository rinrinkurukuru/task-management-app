import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Container component="main" maxWidth="lg">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4">
          ダッシュボード
        </Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          ようこそ、{user?.name || 'ユーザー'}さん
        </Typography>
        <Button
          variant="contained"
          onClick={logout}
          sx={{ mt: 3 }}
        >
          ログアウト
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard;