// EditTaskForm.jsx
import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Box, CircularProgress } from '@mui/material';

const priorities = ['low', 'medium', 'high'];
const statuses = ['not started', 'in progress', 'completed'];
const difficulties = ['easy', 'medium', 'hard'];

const EditTaskForm = ({ task, onClose, onTaskUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'not started',
    difficulty: 'easy',
    dueDate: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'not started',
        difficulty: task.difficulty || 'easy',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      console.log('Submitting task update:', formData);
      
      // Ensure all required fields are present
      if (!formData.title) {
        throw new Error('Title is required');
      }
      
      // Convert date to ISO string if it exists
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
      };
      
      // Call the parent's onTaskUpdated with the updated task data
      await onTaskUpdated?.(taskData);
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      // The error will be handled by the parent component
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        name="title"
        label="Title"
        fullWidth
        margin="normal"
        value={formData.title}
        onChange={handleChange}
        required
      />
      <TextField
        name="description"
        label="Description"
        fullWidth
        margin="normal"
        multiline
        rows={3}
        value={formData.description}
        onChange={handleChange}
      />
      <TextField
        name="priority"
        label="Priority"
        select
        fullWidth
        margin="normal"
        value={formData.priority}
        onChange={handleChange}
        required
      >
        {priorities.map((p) => (
          <MenuItem key={p} value={p}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        name="status"
        label="Status"
        select
        fullWidth
        margin="normal"
        value={formData.status}
        onChange={handleChange}
        required
      >
        {statuses.map((s) => (
          <MenuItem key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        name="difficulty"
        label="Difficulty"
        select
        fullWidth
        margin="normal"
        value={formData.difficulty}
        onChange={handleChange}
        required
      >
        {difficulties.map((d) => (
          <MenuItem key={d} value={d}>
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        name="dueDate"
        label="Due Date"
        type="date"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        value={formData.dueDate}
        onChange={handleChange}
        inputProps={{
          min: new Date().toISOString().split('T')[0] // Prevent selecting past dates
        }}
      />
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={isSubmitting}
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={isSubmitting}
          sx={{ minWidth: 100 }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Update'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default EditTaskForm;
