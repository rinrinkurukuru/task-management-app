import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Box,
  LinearProgress,
  Chip
} from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  Stop, 
  Coffee,
  AccessTime
} from '@mui/icons-material';
import { Task } from './TaskCard';

interface TimerDisplayProps {
  currentTask: Task | null;
  isRunning: boolean;
  isBreak: boolean;
  breakTimeRemaining: number;
  onToggleTimer: () => void;
  onStopTimer: () => void;
  onStartBreak: () => void;
  onEndBreak: () => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
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

  if (isBreak) {
    return (
      <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Coffee />
              <Typography variant="h6">Break Time</Typography>
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography 
              variant="h2" 
              component="div" 
              sx={{ 
                fontFamily: 'monospace',
                fontWeight: 'bold'
              }}
            >
              {formatBreakTime(breakTimeRemaining)}
            </Typography>
            <Typography>
              Take a rest! Break ends automatically.
            </Typography>
            <Button 
              variant="outlined" 
              onClick={onEndBreak}
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
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!currentTask) {
    return (
      <Card sx={{ bgcolor: 'grey.100' }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography color="text.secondary">
              Select a task to start timing
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = currentTask.timeLimit 
    ? Math.min((currentTime / (currentTask.timeLimit * 60)) * 100, 100)
    : 0;

  return (
    <Card sx={{ bgcolor: isRunning ? 'primary.light' : 'background.paper' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                flex: 1, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                color: isRunning ? 'primary.contrastText' : 'text.primary'
              }}
            >
              {currentTask.title}
            </Typography>
            <Chip
              label={currentTask.projectName}
              size="small"
              sx={{
                bgcolor: `${currentTask.projectColor}20`,
                color: currentTask.projectColor,
              }}
            />
          </Box>
        }
      />
      
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              component="div" 
              sx={{ 
                fontFamily: 'monospace',
                fontWeight: 'bold',
                color: isRunning ? 'primary.contrastText' : 'text.primary'
              }}
            >
              {formatTime(currentTime)}
            </Typography>
            {currentTask.timeLimit && (
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 1,
                  color: isRunning ? 'primary.contrastText' : 'text.secondary'
                }}
              >
                of {formatTime(currentTask.timeLimit * 60)}
              </Typography>
            )}
          </Box>
          
          {currentTask.timeLimit && (
            <Box>
              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{ height: 12, borderRadius: 6 }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  textAlign: 'center', 
                  mt: 1,
                  color: isRunning ? 'primary.contrastText' : 'text.secondary'
                }}
              >
                {Math.round(progressPercentage)}% complete
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button 
              variant={isRunning ? 'outlined' : 'contained'}
              onClick={onToggleTimer}
              startIcon={isRunning ? <Pause /> : <PlayArrow />}
              sx={{ flex: 1 }}
            >
              {isRunning ? 'Pause' : 'Start'}
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={onStopTimer}
              startIcon={<Stop />}
            >
              Stop
            </Button>
            
            {!isRunning && currentTime > 0 && (
              <Button 
                variant="outlined" 
                onClick={onStartBreak}
                startIcon={<Coffee />}
              >
                Break
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};