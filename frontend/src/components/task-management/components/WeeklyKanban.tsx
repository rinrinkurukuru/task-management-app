import React from 'react';
import { useDrop } from 'react-dnd';
import { 
  Card, 
  CardContent, 
  CardHeader,
  Typography,
  Button,
  Box,
  IconButton
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { TaskCard } from './TaskCard';
import { Task } from '../../../types/task';

interface WeeklyKanbanProps {
  tasks: Task[];
  runningTaskId?: string | null;
  onToggleTimer?: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onMoveTask: (taskId: string, newDayOfWeek: number) => void;
  onAddTask?: (dayOfWeek: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStartTimer?: (task: Task) => void;
}

const DAYS_OF_WEEK = [
  'Backlog',
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
  runningTaskId?: string | null;
  onToggleTimer?: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onMoveTask: (taskId: string, newDayOfWeek: number) => void;
  onAddTask?: (dayOfWeek: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStartTimer?: (task: Task) => void;
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
  onStartTimer,
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
    <div ref={drop}>
      <Card
        sx={{
          minWidth: 280, // 最小幅を設定
          width: 300, // 固定幅を設定
          height: 600, // 固定の高さを設定
          border: isOver ? 2 : 1,
          borderColor: isOver ? 'primary.main' : 'divider',
          transition: 'border-color 0.2s',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0, // 縮小を防ぐ
        }}
      >
        <CardHeader
          sx={{ pb: 1 }}
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">{dayName}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {tasks.length} tasks
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onAddTask?.(dayOfWeek)}
                  color="primary"
                >
                  <Add />
                </IconButton>
              </Box>
            </Box>
          }
        />
        
        <CardContent sx={{ pt: 0, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
            {/* Incomplete tasks */}
            {incompleteTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isTimerRunning={runningTaskId === task.id}
                onToggleTimer={onToggleTimer || (() => {})}
                onToggleComplete={onToggleComplete}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStartTimer={onStartTimer}
              />
            ))}
            
            {/* Completed tasks */}
            {completedTasks.length > 0 && (
              <>
                {incompleteTasks.length > 0 && (
                  <Box 
                    sx={{ 
                      borderTop: 1, 
                      borderColor: 'divider', 
                      borderStyle: 'dashed',
                      my: 2 
                    }} 
                  />
                )}
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isTimerRunning={runningTaskId === task.id}
                    onToggleTimer={onToggleTimer || (() => {})}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStartTimer={onStartTimer}
                  />
                ))}
              </>
            )}
            
            {tasks.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" gutterBottom>
                  {dayOfWeek === -1 ? 'No backlog tasks' : `No tasks for ${dayName.toLowerCase()}`}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => onAddTask?.(dayOfWeek)}
                  sx={{ mt: 1 }}
                >
                  Add Task
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </div>
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
  onStartTimer,
}) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        gap: 2, 
        overflowX: 'auto', 
        pb: 2,
        height: 600, // 固定の高さを設定
        alignItems: 'stretch', // すべての子要素を同じ高さに
      }}
    >
      {DAYS_OF_WEEK.map((dayName, index) => {
        // Backlog is index 0, so dayOfWeek is -1
        // Sunday-Saturday are indices 1-7, so dayOfWeek is 0-6
        const dayOfWeek = index === 0 ? -1 : index - 1;
        const dayTasks = tasks.filter(task => task.dayOfWeek === dayOfWeek);
        
        return (
          <DayColumn
            key={index}
            dayOfWeek={dayOfWeek}
            dayName={dayName}
            tasks={dayTasks}
            runningTaskId={runningTaskId}
            onToggleTimer={onToggleTimer}
            onToggleComplete={onToggleComplete}
            onMoveTask={onMoveTask}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onStartTimer={onStartTimer}
          />
        );
      })}
    </Box>
  );
};