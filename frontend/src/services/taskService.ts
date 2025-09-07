import api from './api';
import { Task, Project } from '../types/task';

// Task API Service
export const taskService = {
  // Get all tasks for the authenticated user
  async getTasks(): Promise<Task[]> {
    try {
      const response = await api.get('/tasks');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Create a new task
  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    try {
      const response = await api.post('/tasks', {
        title: task.title,
        description: task.description,
        estimated_minutes: task.timeLimit,
        day_of_week: task.dayOfWeek === -1 ? 'todo' : 
                     task.dayOfWeek === 0 ? 'sunday' :
                     task.dayOfWeek === 1 ? 'monday' :
                     task.dayOfWeek === 2 ? 'tuesday' :
                     task.dayOfWeek === 3 ? 'wednesday' :
                     task.dayOfWeek === 4 ? 'thursday' :
                     task.dayOfWeek === 5 ? 'friday' :
                     task.dayOfWeek === 6 ? 'saturday' : 'todo',
      });
      return {
        id: response.data.data.id.toString(),
        title: response.data.data.title,
        description: response.data.data.description,
        projectId: 'work',
        projectName: 'Work',
        projectColor: '#3b82f6',
        timeLimit: response.data.data.estimated_minutes,
        timeSpent: response.data.data.actual_minutes || 0,
        isCompleted: !!response.data.data.completed_at,
        dayOfWeek: response.data.data.day_of_week === 'todo' ? -1 : 
                   response.data.data.day_of_week === 'sunday' ? 0 :
                   response.data.data.day_of_week === 'monday' ? 1 :
                   response.data.data.day_of_week === 'tuesday' ? 2 :
                   response.data.data.day_of_week === 'wednesday' ? 3 :
                   response.data.data.day_of_week === 'thursday' ? 4 :
                   response.data.data.day_of_week === 'friday' ? 5 :
                   response.data.data.day_of_week === 'saturday' ? 6 : -1,
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Update a task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    try {
      const response = await api.put(`/tasks/${taskId}`, {
        title: updates.title,
        description: updates.description,
        project_id: updates.projectId,
        project_name: updates.projectName,
        project_color: updates.projectColor,
        time_limit: updates.timeLimit,
        time_spent: updates.timeSpent,
        is_completed: updates.isCompleted,
        day_of_week: updates.dayOfWeek,
      });
      return {
        id: response.data.id.toString(),
        title: response.data.title,
        description: response.data.description,
        projectId: response.data.project_id,
        projectName: response.data.project_name,
        projectColor: response.data.project_color,
        timeLimit: response.data.time_limit,
        timeSpent: response.data.time_spent,
        isCompleted: response.data.is_completed,
        dayOfWeek: response.data.day_of_week,
      };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Update task time spent
  async updateTimeSpent(taskId: string, timeSpent: number): Promise<void> {
    try {
      await api.patch(`/tasks/${taskId}`, { actual_minutes: timeSpent });
    } catch (error) {
      console.error('Error updating time spent:', error);
      throw error;
    }
  },

  // Toggle task completion
  async toggleComplete(taskId: string, isCompleted: boolean): Promise<void> {
    try {
      await api.patch(`/tasks/${taskId}/complete`, { is_completed: isCompleted });
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  },

  // Move task to different day
  async moveTask(taskId: string, dayOfWeek: number): Promise<void> {
    try {
      await api.patch(`/tasks/${taskId}/move`, { day_of_week: dayOfWeek });
    } catch (error) {
      console.error('Error moving task:', error);
      throw error;
    }
  },
};

// Project API Service
export const projectService = {
  // Get all projects for the authenticated user
  async getProjects(): Promise<Project[]> {
    try {
      const response = await api.get('/projects');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Create a new project
  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    try {
      const response = await api.post('/projects', project);
      return {
        id: response.data.id.toString(),
        name: response.data.name,
        color: response.data.color,
      };
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Update a project
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    try {
      const response = await api.put(`/projects/${projectId}`, updates);
      return {
        id: response.data.id.toString(),
        name: response.data.name,
        color: response.data.color,
      };
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Delete a project
  async deleteProject(projectId: string): Promise<void> {
    try {
      await api.delete(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },
};