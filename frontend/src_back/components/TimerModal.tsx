import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Paper
} from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  Stop, 
  Coffee,
  Close
} from '@mui/icons-material';
import { Task } from './TaskCard';

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTask: Task | null;
  isRunning: boolean;
  isBreak: boolean;
  breakTimeRemaining: number;
  onToggleTimer: () => void;
  onStopTimer: () => void;
  onStartBreak: () => void;
  onEndBreak: () => void;
}

export const TimerModal: React.FC<TimerModalProps> = ({
  isOpen,
  onClose,
  currentTask,
  isRunning,
  isBreak,
  breakTimeRemaining,
  onToggleTimer,
  onStopTimer,
  onStartBreak,
  onEndBreak,
}) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !isBreak) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isBreak]);

  useEffect(() => {
    if (currentTask) {
      setCurrentTime(currentTask.timeSpent * 60); // Convert minutes to seconds
    } else {
      setCurrentTime(0);
    }
  }, [currentTask]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBreakTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    onClose();
  };

  const handleStopAndClose = () => {
    onStopTimer();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: 400,
        }
      }}
    >
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        {isBreak ? (
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              bgcolor: 'success.light', 
              color: 'success.contrastText',
              borderRadius: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
              <Coffee sx={{ fontSize: 32 }} />
              <Typography variant="h5">Break Time</Typography>
            </Box>
            
            <Typography 
              variant="h1" 
              component="div" 
              sx={{ 
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontSize: '3.5rem',
                mb: 2
              }}
            >
              {formatBreakTime(breakTimeRemaining)}
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              Take a rest! Break ends automatically.
            </Typography>
            
            <Button 
              variant="outlined" 
              onClick={onEndBreak}
              size="large"
              sx={{ 
                borderColor: 'success.contrastText',
                color: 'success.contrastText',
                '&:hover': {
                  borderColor: 'success.contrastText',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              End Break Early
            </Button>
          </Paper>
        ) : currentTask ? (
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {currentTask.title}
              </Typography>
              <Chip
                label={currentTask.projectName}
                sx={{
                  bgcolor: `${currentTask.projectColor}20`,
                  color: currentTask.projectColor,
                }}
              />
            </Box>

            <Typography 
              variant="h1" 
              component="div" 
              sx={{ 
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontSize: '4rem',
                mb: 1,
                color: isRunning ? 'primary.main' : 'text.primary'
              }}
            >
              {formatTime(currentTime)}
            </Typography>
            
            {currentTask.timeLimit && (
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                of {formatTime(currentTask.timeLimit * 60)}
              </Typography>
            )}
            
            {currentTask.timeLimit && (
              <Box sx={{ mb: 4 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((currentTime / (currentTask.timeLimit * 60)) * 100, 100)}
                  sx={{ height: 12, borderRadius: 6, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {Math.round(Math.min((currentTime / (currentTask.timeLimit * 60)) * 100, 100))}% complete
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant={isRunning ? 'outlined' : 'contained'}
                onClick={onToggleTimer}
                startIcon={isRunning ? <Pause /> : <PlayArrow />}
                size="large"
                sx={{ minWidth: 120 }}
              >
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={handleStopAndClose}
                startIcon={<Stop />}
                size="large"
              >
                Stop
              </Button>
              
              {!isRunning && currentTime > 0 && (
                <Button 
                  variant="outlined" 
                  onClick={onStartBreak}
                  startIcon={<Coffee />}
                  size="large"
                >
                  Break
                </Button>
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No task selected
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};