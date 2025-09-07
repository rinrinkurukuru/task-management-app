import React from 'react';
import { useDrop } from 'react-dnd';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { TaskCard, Task } from './TaskCard';

interface WeeklyKanbanProps {
  tasks: Task[];
  runningTaskId: string | null;
  onToggleTimer: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onMoveTask: (taskId: string, newDayOfWeek: number) => void;
  onAddTask: (dayOfWeek: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
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

interface DayColumnProps {
  dayOfWeek: number;
  dayName: string;
  tasks: Task[];
  runningTaskId: string | null;
  onToggleTimer: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onMoveTask: (taskId: string, newDayOfWeek: number) => void;
  onAddTask: (dayOfWeek: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const DayColumn: React.FC<DayColumnProps> = ({
  dayOfWeek,
  dayName,
  tasks,
  runningTaskId,
  onToggleTimer,
  onToggleComplete,
  onMoveTask,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item: { id: string; dayOfWeek: number }) => {
      if (item.dayOfWeek !== dayOfWeek) {
        onMoveTask(item.id, dayOfWeek);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const completedTasks = tasks.filter(task => task.isCompleted);
  const incompleteTasks = tasks.filter(task => !task.isCompleted);

  return (
    <Card className={`flex-1 min-h-[500px] ${isOver ? 'ring-2 ring-primary' : ''}`} ref={drop}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{dayName}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {tasks.length} tasks
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onAddTask(dayOfWeek)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Incomplete tasks */}
          {incompleteTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isTimerRunning={runningTaskId === task.id}
              onToggleTimer={onToggleTimer}
              onToggleComplete={onToggleComplete}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
          
          {/* Completed tasks */}
          {completedTasks.length > 0 && (
            <>
              {incompleteTasks.length > 0 && (
                <div className="border-t border-dashed border-muted-foreground/30 my-4" />
              )}
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isTimerRunning={runningTaskId === task.id}
                  onToggleTimer={onToggleTimer}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </>
          )}
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks for {dayName.toLowerCase()}</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => onAddTask(dayOfWeek)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const WeeklyKanban: React.FC<WeeklyKanbanProps> = ({
  tasks,
  runningTaskId,
  onToggleTimer,
  onToggleComplete,
  onMoveTask,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {DAYS_OF_WEEK.map((dayName, index) => {
        const dayTasks = tasks.filter(task => task.dayOfWeek === index);
        
        return (
          <DayColumn
            key={index}
            dayOfWeek={index}
            dayName={dayName}
            tasks={dayTasks}
            runningTaskId={runningTaskId}
            onToggleTimer={onToggleTimer}
            onToggleComplete={onToggleComplete}
            onMoveTask={onMoveTask}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
          />
        );
      })}
    </div>
  );
};