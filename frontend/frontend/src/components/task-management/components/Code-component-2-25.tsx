import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Play, Pause, Square, Coffee } from 'lucide-react';
import { Task } from './TaskCard';

interface TimerDisplayProps {
  currentTask: Task | null;
  isRunning: boolean;
  isBreak: boolean;
  breakTimeRemaining: number;
  onToggleTimer: () => void;
  onStopTimer: () => void;
  onStartBreak: () => void;
  onEndBreak: () => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  currentTask,
  isRunning,
  isBreak,
  breakTimeRemaining,
  onToggleTimer,
  onStopTimer,
  onStartBreak,
  onEndBreak,
}) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !isBreak) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isBreak]);

  useEffect(() => {
    if (currentTask) {
      setCurrentTime(currentTask.timeSpent * 60); // Convert minutes to seconds
    } else {
      setCurrentTime(0);
    }
  }, [currentTask]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBreakTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isBreak) {
    return (
      <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Coffee className="h-5 w-5" />
            Break Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-4xl font-mono font-bold text-green-700 dark:text-green-300">
              {formatBreakTime(breakTimeRemaining)}
            </div>
            <p className="text-green-600 dark:text-green-400">
              Take a rest! Break ends automatically.
            </p>
            <Button 
              variant="outline" 
              onClick={onEndBreak}
              className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
            >
              End Break Early
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentTask) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Select a task to start timing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = currentTask.timeLimit 
    ? Math.min((currentTime / (currentTask.timeLimit * 60)) * 100, 100)
    : 0;

  return (
    <Card className={isRunning ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex-1 truncate">{currentTask.title}</CardTitle>
          <Badge
            variant="secondary"
            style={{ 
              backgroundColor: `${currentTask.projectColor}20`, 
              color: currentTask.projectColor 
            }}
          >
            {currentTask.projectName}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-mono font-bold">
              {formatTime(currentTime)}
            </div>
            {currentTask.timeLimit && (
              <p className="text-sm text-muted-foreground mt-1">
                of {formatTime(currentTask.timeLimit * 60)}
              </p>
            )}
          </div>
          
          {currentTask.timeLimit && (
            <div className="space-y-2">
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {Math.round(progressPercentage)}% complete
              </div>
            </div>
          )}
          
          <div className="flex gap-2 justify-center">
            <Button onClick={onToggleTimer} className="flex-1">
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={onStopTimer}>
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
            
            {!isRunning && currentTime > 0 && (
              <Button variant="outline" onClick={onStartBreak}>
                <Coffee className="h-4 w-4 mr-2" />
                Break
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};