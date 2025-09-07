import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  Container,
  Typography,
  Box,
  Button,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import { Add, Settings, CalendarToday } from '@mui/icons-material';
import { WeeklyKanban } from './components/WeeklyKanban';
import { TaskForm, Project } from './components/TaskForm';
import { ProjectManager } from './components/ProjectManager';
import { TimerModal } from './components/TimerModal';
import { Task } from './components/TaskCard';

// Material UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#030213',
    },
    secondary: {
      main: '#3b82f6',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 10,
  },
});

// Default projects
const DEFAULT_PROJECTS: Project[] = [
  { id: 'work', name: 'Work', color: '#3b82f6' },
  { id: 'personal', name: 'Personal', color: '#22c55e' },
  { id: 'learning', name: 'Learning', color: '#f59e0b' },
];

// Sample tasks for demonstration
const SAMPLE_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Review project proposal',
    description: 'Go through the Q4 project proposal and provide feedback',
    projectId: 'work',
    projectName: 'Work',
    projectColor: '#3b82f6',
    timeLimit: 60,
    timeSpent: 25,
    isCompleted: false,
    dayOfWeek: 1, // Monday
  },
  {
    id: 'task-2',
    title: 'Workout',
    description: 'Morning workout routine',
    projectId: 'personal',
    projectName: 'Personal',
    projectColor: '#22c55e',
    timeLimit: 45,
    timeSpent: 45,
    isCompleted: true,
    dayOfWeek: 1, // Monday
  },
  {
    id: 'task-3',
    title: 'Learn React patterns',
    description: 'Study advanced React patterns and hooks',
    projectId: 'learning',
    projectName: 'Learning',
    projectColor: '#f59e0b',
    timeLimit: 90,
    timeSpent: 30,
    isCompleted: false,
    dayOfWeek: 2, // Tuesday
  },
  {
    id: 'task-4',
    title: 'Team meeting',
    description: 'Weekly standup meeting',
    projectId: 'work',
    projectName: 'Work',
    projectColor: '#3b82f6',
    timeLimit: 30,
    timeSpent: 0,
    isCompleted: false,
    dayOfWeek: 3, // Wednesday
  },
  {
    id: 'task-5',
    title: 'Update documentation',
    description: 'Update the project README and API documentation',
    projectId: 'work',
    projectName: 'Work',
    projectColor: '#3b82f6',
    timeLimit: 120,
    timeSpent: 0,
    isCompleted: false,
    dayOfWeek: -1, // Backlog
  },
  {
    id: 'task-6',
    title: 'Research new technologies',
    description: 'Research new frameworks and libraries for next project',
    projectId: 'learning',
    projectName: 'Learning',
    projectColor: '#f59e0b',
    timeLimit: 180,
    timeSpent: 45,
    isCompleted: false,
    dayOfWeek: -1, // Backlog
  },
  {
    id: 'task-7',
    title: 'Organize photos',
    description: 'Sort and organize family photos from vacation',
    projectId: 'personal',
    projectName: 'Personal',
    projectColor: '#22c55e',
    timeLimit: 60,
    timeSpent: 0,
    isCompleted: false,
    dayOfWeek: -1, // Backlog
  },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(1);
  
  // Timer state
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  
  // Break state
  const [isBreak, setIsBreak] = useState(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0);
  const [breakInterval, setBreakInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showToast = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Timer logic
  useEffect(() => {
    if (isTimerRunning && runningTaskId && !isBreak) {
      const interval = setInterval(() => {
        setTasks(prev => prev.map(task => {
          if (task.id === runningTaskId) {
            return { ...task, timeSpent: task.timeSpent + (1/60) }; // Add 1 minute per minute
          }
          return task;
        }));
      }, 60000); // Update every minute
      
      setTimerInterval(interval);
      
      return () => clearInterval(interval);
    } else if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [isTimerRunning, runningTaskId, isBreak]);
  
  // Break timer logic
  useEffect(() => {
    if (isBreak && breakTimeRemaining > 0) {
      const interval = setInterval(() => {
        setBreakTimeRemaining(prev => {
          if (prev <= 1) {
            setIsBreak(false);
            showToast('Break time is over! Ready to continue?', 'success');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setBreakInterval(interval);
      
      return () => clearInterval(interval);
    } else if (breakInterval) {
      clearInterval(breakInterval);
      setBreakInterval(null);
    }
  }, [isBreak, breakTimeRemaining]);

  const handleToggleTimer = (taskId?: string) => {
    const targetTaskId = taskId || runningTaskId;
    
    if (!targetTaskId) return;
    
    const task = tasks.find(t => t.id === targetTaskId);
    if (!task || task.isCompleted) {
      showToast('Cannot start timer for completed task', 'error');
      return;
    }

    if (runningTaskId && runningTaskId !== targetTaskId) {
      // Stop current task and start new one
      setIsTimerRunning(false);
      setTimeout(() => {
        setRunningTaskId(targetTaskId);
        setIsTimerRunning(true);
        setIsTimerModalOpen(true);
        showToast(`Started timer for "${task.title}"`, 'success');
      }, 100);
    } else if (runningTaskId === targetTaskId) {
      // Toggle current task
      setIsTimerRunning(!isTimerRunning);
      if (!isTimerModalOpen) {
        setIsTimerModalOpen(true);
      }
      showToast(isTimerRunning ? 'Timer paused' : `Timer resumed for "${task.title}"`, 'success');
    } else {
      // Start new task
      setRunningTaskId(targetTaskId);
      setIsTimerRunning(true);
      setIsTimerModalOpen(true);
      showToast(`Started timer for "${task.title}"`, 'success');
    }
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setRunningTaskId(null);
    setIsTimerModalOpen(false);
    showToast('Timer stopped', 'success');
  };

  const handleStartBreak = () => {
    setIsBreak(true);
    setBreakTimeRemaining(5 * 60); // 5 minutes break
    setIsTimerRunning(false);
    showToast('Break started! 5 minutes to relax.', 'success');
  };

  const handleEndBreak = () => {
    setIsBreak(false);
    setBreakTimeRemaining(0);
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newTask = { ...task, isCompleted: !task.isCompleted };
        
        if (newTask.isCompleted && runningTaskId === taskId) {
          setIsTimerRunning(false);
          setRunningTaskId(null);
          showToast('Task completed! Timer stopped.', 'success');
        }
        
        return newTask;
      }
      return task;
    }));
  };

  const handleMoveTask = (taskId: string, newDayOfWeek: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, dayOfWeek: newDayOfWeek } : task
    ));
    const destination = newDayOfWeek === -1 ? 'backlog' : 'new day';
    showToast(`Task moved to ${destination}`, 'success');
  };

  const handleAddTask = (dayOfWeek: number) => {
    setSelectedDayOfWeek(dayOfWeek);
    setEditingTask(undefined);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (runningTaskId === taskId) {
      setIsTimerRunning(false);
      setRunningTaskId(null);
    }
    
    setTasks(prev => prev.filter(task => task.id !== taskId));
    showToast('Task deleted', 'success');
  };

  const handleSaveTask = (taskData: Omit<Task, 'timeSpent' | 'isCompleted'>) => {
    if (editingTask) {
      // Update existing task
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id 
          ? { ...taskData, timeSpent: task.timeSpent, isCompleted: task.isCompleted }
          : task
      ));
      showToast('Task updated', 'success');
    } else {
      // Create new task
      const newTask: Task = {
        ...taskData,
        timeSpent: 0,
        isCompleted: false,
      };
      setTasks(prev => [...prev, newTask]);
      showToast('Task created', 'success');
    }
  };

  const handleAddProject = (projectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...projectData,
      id: `project-${Date.now()}`,
    };
    setProjects(prev => [...prev, newProject]);
    showToast('Project added', 'success');
  };

  const handleDeleteProject = (projectId: string) => {
    const tasksWithProject = tasks.filter(task => task.projectId === projectId);
    if (tasksWithProject.length > 0) {
      showToast('Cannot delete project with existing tasks', 'error');
      return;
    }
    
    setProjects(prev => prev.filter(project => project.id !== projectId));
    showToast('Project deleted', 'success');
  };

  const currentTask = runningTaskId ? tasks.find(t => t.id === runningTaskId) : null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndProvider backend={HTML5Backend}>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          {/* Fixed Header */}
          <Box 
            sx={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bgcolor: 'background.default', 
              zIndex: 1100,
              borderBottom: 1,
              borderColor: 'divider',
              boxShadow: 1
            }}
          >
            <Container maxWidth="xl" sx={{ py: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h3" component="h1" gutterBottom>
                    Task Management
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Focus on your goals with time tracking and kanban organization
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Settings />}
                    onClick={() => setIsProjectManagerOpen(true)}
                  >
                    Projects
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => handleAddTask(-1)}
                  >
                    Add Task
                  </Button>
                </Box>
              </Box>
            </Container>
          </Box>

          {/* Scrollable Content */}
          <Box sx={{ pt: 20 }}> {/* Padding top to account for fixed header */}
            <Container maxWidth="xl" sx={{ py: 3 }}>
              {/* Weekly Kanban Board */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarToday />
                  <Typography variant="h5" component="h2">
                    Weekly Overview
                  </Typography>
                </Box>
                
                <WeeklyKanban
                  tasks={tasks}
                  runningTaskId={runningTaskId}
                  onToggleTimer={handleToggleTimer}
                  onToggleComplete={handleToggleComplete}
                  onMoveTask={handleMoveTask}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              </Box>
            </Container>
          </Box>

          {/* Modals */}
          <TaskForm
            isOpen={isTaskFormOpen}
            onClose={() => setIsTaskFormOpen(false)}
            onSave={handleSaveTask}
            projects={projects}
            initialTask={editingTask}
            initialDayOfWeek={selectedDayOfWeek}
          />

          <ProjectManager
            isOpen={isProjectManagerOpen}
            onClose={() => setIsProjectManagerOpen(false)}
            projects={projects}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
          />

          <TimerModal
            isOpen={isTimerModalOpen}
            onClose={() => setIsTimerModalOpen(false)}
            currentTask={currentTask}
            isRunning={isTimerRunning}
            isBreak={isBreak}
            breakTimeRemaining={breakTimeRemaining}
            onToggleTimer={() => handleToggleTimer()}
            onStopTimer={handleStopTimer}
            onStartBreak={handleStartBreak}
            onEndBreak={handleEndBreak}
          />

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}  
            </Alert>
          </Snackbar>
        </Box>
      </DndProvider>
    </ThemeProvider>
  );
}