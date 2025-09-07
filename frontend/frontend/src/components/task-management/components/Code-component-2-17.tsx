import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Task } from './TaskCard';

export interface Project {
  id: string;
  name: string;
  color: string;
}

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'timeSpent' | 'isCompleted'>) => void;
  projects: Project[];
  initialTask?: Task;
  initialDayOfWeek?: number;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSave,
  projects,
  initialTask,
  initialDayOfWeek = 1, // Default to Monday
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
      timeLimit: timeLimit ? parseInt(timeLimit, 10) : undefined,
    };

    onSave(taskData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {initialTask ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={projectId} onValueChange={setProjectId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Day of Week</Label>
              <Select value={dayOfWeek.toString()} onValueChange={(value) => setDayOfWeek(parseInt(value, 10))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit (minutes, optional)</Label>
              <Input
                id="timeLimit"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                placeholder="e.g. 60"
                min="1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !projectId}>
              {initialTask ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};