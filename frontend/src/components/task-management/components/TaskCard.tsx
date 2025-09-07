import React from 'react';
import { useDrag } from 'react-dnd';
import { 
  Card, 
  CardContent, 
  CardHeader,
  Chip,
  Checkbox,
  IconButton,
  Typography,
  Box,
  LinearProgress,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  AccessTime, 
  MoreVert,
  Edit,
  Delete
} from '@mui/icons-material';

import { Task } from '../../../types/task';
export type { Task };

interface TaskCardProps {
  task: Task;
  isTimerRunning: boolean;
  onToggleTimer: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStartTimer?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isTimerRunning,
  onToggleTimer,
  onToggleComplete,
  onEdit,
  onDelete,
  onStartTimer,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id, dayOfWeek: task.dayOfWeek },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const progressPercentage = task.timeLimit ? (task.timeSpent / task.timeLimit) * 100 : 0;

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(task);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(task.id);
    handleMenuClose();
  };

  return (
    <div ref={drag}>
      <Card
        sx={{
          cursor: 'move',
          transition: 'all 0.2s',
          opacity: isDragging ? 0.5 : task.isCompleted ? 0.75 : 1,
          transform: isDragging ? 'rotate(3deg)' : 'none',
          '&:hover': {
            boxShadow: 3,
          },
        }}
      >
        <CardHeader
          sx={{ pb: 1 }}
          title={
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Checkbox
                checked={task.isCompleted}
                onChange={() => onToggleComplete(task.id)}
                size="small"
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    textDecoration: task.isCompleted ? 'line-through' : 'none',
                    color: task.isCompleted ? 'text.secondary' : 'text.primary',
                    wordBreak: 'break-word',
                  }}
                >
                  {task.title}
                </Typography>
                {task.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mt: 0.5, wordBreak: 'break-word' }}
                  >
                    {task.description}
                  </Typography>
                )}
              </Box>
              <IconButton size="small" onClick={handleMenuClick}>
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleEdit}>
                  <Edit sx={{ mr: 1 }} fontSize="small" />
                  Edit
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                  <Delete sx={{ mr: 1 }} fontSize="small" />
                  Delete
                </MenuItem>
              </Menu>
            </Box>
          }
        />
        
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Chip
              label={task.projectName}
              size="small"
              sx={{
                bgcolor: `${task.projectColor}20`,
                color: task.projectColor,
                alignSelf: 'flex-start',
              }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {formatTime(task.timeSpent)}
                  {task.timeLimit && ` / ${formatTime(task.timeLimit)}`}
                </Typography>
              </Box>
              
              <IconButton
                size="small"
                onClick={() => onStartTimer?.(task)}
                disabled={task.isCompleted}
                color="primary"
              >
                <PlayArrow />
              </IconButton>
            </Box>
            
            {task.timeLimit && (
              <Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(progressPercentage, 100)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}
                >
                  {Math.round(progressPercentage)}% complete
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};