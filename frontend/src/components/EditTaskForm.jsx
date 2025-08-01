// EditTaskForm.jsx
import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, Box } from '@mui/material';

const priorities = ['Low', 'Medium', 'High'];
const statuses = ['Not Started', 'In Progress', 'Completed'];
const difficulties = ['Easy', 'Medium', 'Hard'];

const EditTaskForm = ({ task, onClose, onTaskUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    status: '',
    difficulty: '',
    deadline: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'Medium',
        status: task.status || 'Not Started',
        difficulty: task.difficulty || 'Easy',
        deadline: task.deadline?.substring(0, 10) || '',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Make API call to update the task
    console.log('Updated Task:', formData);
    onTaskUpdated?.(formData);
    onClose();
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
      >
        {priorities.map((p) => (
          <MenuItem key={p} value={p}>{p}</MenuItem>
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
      >
        {statuses.map((s) => (
          <MenuItem key={s} value={s}>{s}</MenuItem>
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
      >
        {difficulties.map((d) => (
          <MenuItem key={d} value={d}>{d}</MenuItem>
        ))}
      </TextField>
      <TextField
        name="deadline"
        label="Deadline"
        type="date"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        value={formData.deadline}
        onChange={handleChange}
      />
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} sx={{ mr: 2 }}>Cancel</Button>
        <Button type="submit" variant="contained" color="primary">Update</Button>
      </Box>
    </Box>
  );
};

export default EditTaskForm;
