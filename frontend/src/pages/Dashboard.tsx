import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Logout, AccountCircle } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import TaskManagementWithAPI from '../components/task-management/TaskManagementWithAPI';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#030213' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task Management System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountCircle />
              <Typography variant="body1">
                {user?.name || 'ユーザー'}
              </Typography>
            </Box>
            <IconButton
              color="inherit"
              onClick={logout}
              aria-label="logout"
              title="ログアウト"
            >
              <Logout />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main">
        <TaskManagementWithAPI />
      </Box>
    </Box>
  );
};

export default Dashboard;