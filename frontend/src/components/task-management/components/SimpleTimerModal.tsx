import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  Box,
  LinearProgress,
  IconButton
} from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  Stop,
  Close
} from '@mui/icons-material';
import { Task } from '../../../types/task';

interface TimerModalProps {
  task: Task;
  onClose: () => void;
  onUpdateTimeSpent: (taskId: string, timeSpent: number) => void;
}

export const TimerModal: React.FC<TimerModalProps> = ({
  task,
  onClose,
  onUpdateTimeSpent
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeSpent, setTimeSpent] = useState(task.timeSpent || 0);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      const id = window.setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 60000); // Update every minute
      setIntervalId(id);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]);

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleStop = () => {
    setIsRunning(false);
    onUpdateTimeSpent(task.id, timeSpent);
    onClose();
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const progress = task.timeLimit ? (timeSpent / task.timeLimit) * 100 : 0;

  return (
    <Dialog open={true} onClose={handleStop} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Timer</Typography>
          <IconButton onClick={handleStop} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            {task.title}
          </Typography>
          
          <Typography variant="h2" sx={{ my: 4 }}>
            {formatTime(timeSpent)}
          </Typography>

          {task.timeLimit && (
            <>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(progress, 100)} 
                sx={{ mb: 2, height: 8, borderRadius: 4 }}
                color={progress > 100 ? 'error' : 'primary'}
              />
              <Typography variant="body2" color="text.secondary">
                Time Limit: {formatTime(task.timeLimit)}
              </Typography>
            </>
          )}

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={isRunning ? <Pause /> : <PlayArrow />}
              onClick={handleToggleTimer}
            >
              {isRunning ? 'Pause' : 'Start'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Stop />}
              onClick={handleStop}
            >
              Stop & Save
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};