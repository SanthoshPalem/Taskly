import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, MenuItem, Snackbar, Alert
} from '@mui/material';
import { createTask } from '../Services/TasksServices'; // Make sure you have this service function

const difficulties = ['easy', 'medium', 'hard'];
const statuses = ['not started', 'in progress', 'completed'];
const priorities = ['low', 'medium', 'high'];

const AddTaskForm = ({ open, onClose, groupId, createdBy, assignedTo, onTaskAdded }) => {
    const [form, setForm] = useState({
        title: '',
        description: '',
        difficulty: 'easy',
        status: 'not started',
        dueDate: '',
        priority: 'medium',
    });

    const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

    const handleCloseSnack = () => setSnack({ ...snack, open: false });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.title || !form.dueDate) {
            setSnack({ open: true, message: 'Please fill all required fields.', severity: 'warning' });
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await createTask({ 
                ...form, 
                groupId, 
                createdBy, 
                assignedTo, // Using the assignedTo prop instead of form field
                status: 'not started' // Set default status
            }, token);
            setSnack({ open: true, message: 'Task created successfully!', severity: 'success' });
            onTaskAdded(); // Refresh task list
            onClose();
        } catch (error) {
            const msg = error?.response?.data?.message || 'Failed to create task.';
            setSnack({ open: true, message: msg, severity: 'error' });
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        name="title"
                        label="Title"
                        fullWidth
                        required
                        value={form.title}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        name="description"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={form.description}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        name="difficulty"
                        label="Difficulty"
                        select
                        fullWidth
                        value={form.difficulty}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    >
                        {difficulties.map((level) => (
                            <MenuItem key={level} value={level}>
                                {level}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        name="status"
                        label="Status"
                        select
                        fullWidth
                        value={form.status}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    >
                        {statuses.map((status) => (
                            <MenuItem key={status} value={status}>
                                {status}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        name="dueDate"
                        label="Due Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={form.dueDate}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        name="priority"
                        label="Priority"
                        select
                        fullWidth
                        value={form.priority}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    >
                        {priorities.map((p) => (
                            <MenuItem key={p} value={p}>
                                {p}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={handleCloseSnack}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={handleCloseSnack} sx={{ width: '100%' }}>
                    {snack.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AddTaskForm;
