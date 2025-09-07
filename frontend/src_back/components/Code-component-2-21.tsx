import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { Project } from './TaskForm';

interface ProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onDeleteProject: (projectId: string) => void;
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
  '#0f172a', // slate
];

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  isOpen,
  onClose,
  projects,
  onAddProject,
  onDeleteProject,
}) => {
  const [newProjectName, setNewProjectName] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState(PRESET_COLORS[0]);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProjectName.trim()) return;

    onAddProject({
      name: newProjectName.trim(),
      color: selectedColor,
    });

    setNewProjectName('');
    setSelectedColor(PRESET_COLORS[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Projects</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add new project */}
          <form onSubmit={handleAddProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">New Project Name</Label>
              <Input
                id="projectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Project Color</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color 
                        ? 'border-ring ring-2 ring-ring/20' 
                        : 'border-border hover:border-ring'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
            
            <Button type="submit" disabled={!newProjectName.trim()} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </form>
          
          {/* Existing projects */}
          <div className="space-y-3">
            <Label>Existing Projects</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {projects.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No projects yet. Create your first project above.
                </p>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <span>{project.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => onDeleteProject(project.id)}
                      disabled={projects.length === 1} // Keep at least one project
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};