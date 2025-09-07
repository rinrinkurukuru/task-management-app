export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  timeLimit?: number;
  timeSpent: number;
  isCompleted: boolean;
  dayOfWeek: number;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}