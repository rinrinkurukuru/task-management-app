import React from 'react';
import { useDrag } from 'react-dnd';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Play, Pause, Clock, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  timeLimit?: number; // in minutes
  timeSpent: number; // in minutes
  isCompleted: boolean;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
}

interface TaskCardProps {
  task: Task;
  isTimerRunning: boolean;
  onToggleTimer: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isTimerRunning,
  onToggleTimer,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
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

  return (
    <Card
      ref={drag}
      className={`cursor-move transition-all ${
        isDragging ? 'opacity-50 rotate-3' : 'hover:shadow-md'
      } ${task.isCompleted ? 'opacity-75' : ''}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Checkbox
              checked={task.isCompleted}
              onCheckedChange={() => onToggleComplete(task.id)}
            />
            <div className="flex-1">
              <h3 className={`${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <Badge
            variant="secondary"
            style={{ backgroundColor: `${task.projectColor}20`, color: task.projectColor }}
          >
            {task.projectName}
          </Badge>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(task.timeSpent)}</span>
              {task.timeLimit && <span>/ {formatTime(task.timeLimit)}</span>}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onToggleTimer(task.id)}
              disabled={task.isCompleted}
            >
              {isTimerRunning ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {task.timeLimit && (
            <div className="space-y-1">
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {Math.round(progressPercentage)}% complete
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};