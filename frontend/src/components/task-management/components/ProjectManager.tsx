import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Paper
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { Project } from '../../../types/task';

interface ProjectManagerProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  projects: Project[];
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
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
  open,
  isOpen,
  onClose,
  projects,
  onAddProject,
  onUpdateProject,
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
    <Dialog open={open || isOpen || false} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Projects</DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Add new project */}
          <Box component="form" onSubmit={handleAddProject} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Add New Project</Typography>
            
            <TextField
              label="Project Name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name..."
              fullWidth
            />
            
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Project Color
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {PRESET_COLORS.map((color) => (
                  <Box
                    key={color}
                    component="button"
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: color,
                      border: selectedColor === color ? 3 : 2,
                      borderColor: selectedColor === color ? 'primary.main' : 'divider',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
            
            <Button 
              type="submit" 
              variant="contained" 
              disabled={!newProjectName.trim()}
              startIcon={<Add />}
              fullWidth
            >
              Add Project
            </Button>
          </Box>
          
          {/* Existing projects */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Existing Projects
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 300, overflowY: 'auto' }}>
              {projects.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No projects yet. Create your first project above.
                </Typography>
              ) : (
                projects.map((project) => (
                  <Paper
                    key={project.id}
                    variant="outlined"
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 2,
                      bgcolor: 'background.default'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: project.color,
                        }}
                      />
                      <Typography>{project.name}</Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => onDeleteProject(project.id)}
                      disabled={projects.length === 1} // Keep at least one project
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Paper>
                ))
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};