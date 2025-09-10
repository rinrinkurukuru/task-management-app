import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Container,
  Typography,
  Box,
  Button,
  Divider,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add, Settings, CalendarToday } from '@mui/icons-material';
import { WeeklyKanban } from './components/WeeklyKanban';
import { TaskForm } from './components/TaskForm';
import { ProjectManager } from './components/ProjectManager';
import { TimerModal } from './components/SimpleTimerModal';
import { Task, Project } from '../../types/task';
import { taskService, projectService } from '../../services/taskService';


// Default projects
const DEFAULT_PROJECTS: Project[] = [
  { id: 'work', name: 'Work', color: '#3b82f6' },
  { id: 'personal', name: 'Personal', color: '#22c55e' },
  { id: 'learning', name: 'Learning', color: '#f59e0b' },
];

const TaskManagementWithAPI: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [timerTask, setTimerTask] = useState<Task | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [useAPI, setUseAPI] = useState(false); // Toggle for API usage
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Check if API is available
  useEffect(() => {
    const checkAPI = async () => {
      try {
        await taskService.getTasks();
        setUseAPI(true);
      } catch (error) {
        console.log('Tasks API not available, using local storage');
        setUseAPI(false);
      }
    };
    checkAPI();
  }, []);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      if (useAPI) {
        // Load from API
        try {
          const tasksData = await taskService.getTasks();
          setTasks(tasksData);
          
          // Try to load projects, but fall back to defaults if not available
          try {
            const projectsData = await projectService.getProjects();
            setProjects(projectsData.length > 0 ? projectsData : DEFAULT_PROJECTS);
          } catch (projectError) {
            console.log('Projects API not available, using default projects');
            setProjects(DEFAULT_PROJECTS);
          }
        } catch (error) {
          console.error('Failed to load from API:', error);
          showSnackbar('Failed to load data from server', 'error');
          // Fall back to local storage
          loadFromLocalStorage();
        }
      } else {
        // Load from local storage
        loadFromLocalStorage();
      }
      
      setIsLoading(false);
    };

    loadData();
  }, [useAPI]);

  const loadFromLocalStorage = () => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Failed to load tasks from localStorage:', error);
      }
    }

    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (error) {
        console.error('Failed to load projects from localStorage:', error);
        setProjects(DEFAULT_PROJECTS);
      }
    }
  };

  // Save to localStorage when not using API
  useEffect(() => {
    if (!useAPI) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, useAPI]);

  useEffect(() => {
    if (!useAPI) {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects, useAPI]);

  const handleAddTask = async (task: Omit<Task, 'id'>) => {
    try {
      if (useAPI) {
        const newTask = await taskService.createTask(task);
        setTasks([...tasks, newTask]);
      } else {
        const newTask: Task = {
          ...task,
          id: `task-${Date.now()}`,
          timeSpent: 0,
          isCompleted: false,
        };
        setTasks([...tasks, newTask]);
      }
      showSnackbar('Task added successfully', 'success');
      // ダイアログの閉じる処理は TaskForm で行う
    } catch (error) {
      showSnackbar('Failed to add task', 'error');
    }
  };

  const handleEditTask = async (task: Omit<Task, 'id'>) => {
    if (editingTask) {
      try {
        if (useAPI) {
          const updatedTask = await taskService.updateTask(editingTask.id, task);
          setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
        } else {
          setTasks(tasks.map(t => 
            t.id === editingTask.id 
              ? { ...task, id: editingTask.id, timeSpent: editingTask.timeSpent, isCompleted: editingTask.isCompleted }
              : t
          ));
        }
        setEditingTask(undefined);
        setIsTaskFormOpen(false);
        showSnackbar('Task updated successfully', 'success');
      } catch (error) {
        showSnackbar('Failed to update task', 'error');
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      if (useAPI) {
        await taskService.deleteTask(taskId);
      }
      setTasks(tasks.filter(t => t.id !== taskId));
      showSnackbar('Task deleted', 'info');
    } catch (error) {
      showSnackbar('Failed to delete task', 'error');
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      try {
        const newCompletedState = !task.isCompleted;
        if (useAPI) {
          await taskService.toggleComplete(taskId, newCompletedState);
        }
        setTasks(tasks.map(t =>
          t.id === taskId
            ? { ...t, isCompleted: newCompletedState }
            : t
        ));
      } catch (error) {
        showSnackbar('Failed to update task completion', 'error');
      }
    }
  };

  const handleStartTimer = (task: Task) => {
    setTimerTask(task);
  };

  const handleUpdateTimeSpent = async (taskId: string, timeSpent: number) => {
    try {
      if (useAPI) {
        await taskService.updateTimeSpent(taskId, timeSpent);
      }
      setTasks(tasks.map(task =>
        task.id === taskId
          ? { ...task, timeSpent }
          : task
      ));
    } catch (error) {
      showSnackbar('Failed to update time spent', 'error');
    }
  };

  const handleMoveTask = async (taskId: string, dayOfWeek: number) => {
    try {
      if (useAPI) {
        await taskService.moveTask(taskId, dayOfWeek);
      }
      setTasks(tasks.map(task =>
        task.id === taskId
          ? { ...task, dayOfWeek }
          : task
      ));
    } catch (error) {
      showSnackbar('Failed to move task', 'error');
    }
  };

  const handleAddProject = async (project: Omit<Project, 'id'>) => {
    try {
      if (useAPI) {
        try {
          const newProject = await projectService.createProject(project);
          setProjects([...projects, newProject]);
        } catch (apiError) {
          console.log('Projects API not available, using local storage for new project');
          const newProject: Project = {
            ...project,
            id: `project-${Date.now()}`,
          };
          setProjects([...projects, newProject]);
        }
      } else {
        const newProject: Project = {
          ...project,
          id: `project-${Date.now()}`,
        };
        setProjects([...projects, newProject]);
      }
      showSnackbar('Project added successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to add project', 'error');
    }
  };

  const handleUpdateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      if (useAPI) {
        try {
          const updatedProject = await projectService.updateProject(projectId, updates);
          setProjects(projects.map(p =>
            p.id === projectId ? updatedProject : p
          ));
        } catch (apiError) {
          console.log('Projects API not available, using local storage for update');
          setProjects(projects.map(p =>
            p.id === projectId ? { ...p, ...updates } : p
          ));
        }
      } else {
        setProjects(projects.map(p =>
          p.id === projectId ? { ...p, ...updates } : p
        ));
      }
      
      // Update tasks with the new project info
      setTasks(tasks.map(task =>
        task.projectId === projectId
          ? { 
              ...task, 
              projectName: updates.name || task.projectName,
              projectColor: updates.color || task.projectColor
            }
          : task
      ));
      showSnackbar('Project updated successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to update project', 'error');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    // Check if there are tasks using this project
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length > 0) {
      showSnackbar(`Cannot delete project with ${projectTasks.length} active tasks`, 'error');
      return;
    }
    
    try {
      if (useAPI) {
        try {
          await projectService.deleteProject(projectId);
        } catch (apiError) {
          console.log('Projects API not available, deleting from local storage only');
        }
      }
      setProjects(projects.filter(p => p.id !== projectId));
      showSnackbar('Project deleted', 'info');
    } catch (error) {
      showSnackbar('Failed to delete project', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarToday sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h4" component="h1" fontWeight="bold">
                  Weekly Task Manager
                </Typography>
                {!useAPI && (
                  <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                    (Offline Mode)
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={() => setIsProjectManagerOpen(true)}
                >
                  Manage Projects
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    setEditingTask(undefined);
                    setIsTaskFormOpen(true);
                  }}
                >
                  Add Task
                </Button>
              </Box>
            </Box>
            <Divider />
          </Box>

          <WeeklyKanban
            tasks={tasks}
            onMoveTask={handleMoveTask}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
            onEditTask={openEditForm}
            onStartTimer={handleStartTimer}
            onAddTask={(dayOfWeek: number) => {
              setEditingTask(undefined);
              setIsTaskFormOpen(true);
            }}
          />

          <TaskForm
            open={isTaskFormOpen}
            onClose={() => {
              setIsTaskFormOpen(false);
              setEditingTask(undefined);
            }}
            onSubmit={editingTask ? handleEditTask : handleAddTask}
            projects={projects}
            initialTask={editingTask}
          />

          <ProjectManager
            open={isProjectManagerOpen}
            onClose={() => setIsProjectManagerOpen(false)}
            projects={projects}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
          />

          {timerTask && (
            <TimerModal
              task={timerTask}
              onClose={() => setTimerTask(undefined)}
              onUpdateTimeSpent={handleUpdateTimeSpent}
            />
          )}

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </DndProvider>
  );
};

export default TaskManagementWithAPI;