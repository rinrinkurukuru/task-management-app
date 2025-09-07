import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box
} from '@mui/material';
import { Task, Project } from '../../../types/task';
export type { Project };

interface TaskFormProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  onSubmit?: (taskData: Omit<Task, 'id'>) => void;
  onSave?: (taskData: Omit<Task, 'timeSpent' | 'isCompleted'>) => void;
  projects: Project[];
  initialTask?: Task;
  initialDayOfWeek?: number;
}

const DAYS_OF_WEEK = [
  { value: -1, label: 'Backlog' },
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

export const TaskForm: React.FC<TaskFormProps> = ({
  open,
  isOpen,
  onClose,
  onSubmit,
  onSave,
  projects,
  initialTask,
  initialDayOfWeek = -1, // Default to Backlog
}) => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [projectId, setProjectId] = React.useState('');
  const [dayOfWeek, setDayOfWeek] = React.useState(initialDayOfWeek);
  const [timeLimit, setTimeLimit] = React.useState<string>('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setProjectId(initialTask.projectId);
      setDayOfWeek(initialTask.dayOfWeek);
      setTimeLimit(initialTask.timeLimit ? initialTask.timeLimit.toString() : '');
    } else {
      setTitle('');
      setDescription('');
      setProjectId(projects[0]?.id || '');
      setDayOfWeek(initialDayOfWeek);
      setTimeLimit('');
    }
  }, [initialTask, initialDayOfWeek, projects]);

  const selectedProject = projects.find(p => p.id === projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !projectId) return;

    const taskData: Omit<Task, 'timeSpent' | 'isCompleted'> = {
      id: initialTask?.id || `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      projectId,
      projectName: selectedProject?.name || '',
      projectColor: selectedProject?.color || '#6b7280',
      dayOfWeek,
      timeLimit: timeLimit ? parseInt(timeLimit, 10) : 60,
    };

    if (onSubmit) {
      onSubmit(taskData);
      // ダイアログを閉じる前に少し待つ
      setTimeout(() => onClose(), 100);
    } else if (onSave) {
      onSave(taskData);
      setTimeout(() => onClose(), 100);
    }
  };

  return (
    <Dialog open={open || isOpen || false} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              required
              fullWidth
            />
            
            <TextField
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              multiline
              rows={3}
              fullWidth
            />
            
            <FormControl fullWidth required>
              <InputLabel>Project</InputLabel>
              <Select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                label="Project"
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: project.color,
                        }}
                      />
                      {project.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Schedule</InputLabel>
              <Select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                label="Schedule"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <MenuItem key={day.value} value={day.value}>
                    {day.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Time Limit (minutes, optional)"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              placeholder="e.g. 60"
              type="number"
              inputProps={{ min: 1 }}
              fullWidth
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={!title.trim() || !projectId}
          >
            {initialTask ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};