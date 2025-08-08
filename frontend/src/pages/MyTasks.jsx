import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Tooltip,
  MenuItem,
  Select,
  Snackbar,
  Alert
} from '@mui/material';
import { getMyAssignedTasks, updateTask } from '../Services/TasksServices';
import { format } from 'date-fns';

const statusColors = {
  'not started': 'default',
  'in progress': 'primary',
  'completed': 'success'
};

const priorityColors = {
  'low': 'info',
  'medium': 'warning',
  'high': 'error'
};

const difficultyColors = {
  'easy': 'success',
  'medium': 'warning',
  'hard': 'error'
};

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getMyAssignedTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error in fetchTasks:', error);
      
      let errorMessage = 'Failed to load tasks. Please try again.';
      
      if (error.message === 'No authentication token found') {
        errorMessage = 'You need to log in to view your tasks.';
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (error.response.status === 404) {
          errorMessage = 'Tasks endpoint not found. Please contact support.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      
      // If unauthorized, clear user data and redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        // You might want to add a redirect to login here
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      
      // Update the local state to reflect the change
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, status: newStatus } : task
      ));
      
      setSnackbar({
        open: true,
        message: 'Task status updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update task status. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        My Assigned Tasks
      </Typography>
      
      <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
        {tasks.length === 0 ? (
          <Typography variant="body1" align="center" sx={{ p: 3 }}>
            No tasks assigned to you yet.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Group</TableCell>
                  <TableCell>Assigned By</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Due Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task._id} hover>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <Tooltip title={task.description || 'No description'} arrow>
                        <span>
                          {task.description 
                            ? `${task.description.substring(0, 30)}${task.description.length > 30 ? '...' : ''}`
                            : '-'}
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {task.groupId?.name || 'Unknown Group'}
                    </TableCell>
                    <TableCell>
                      {task.createdBy?.name || 'Unknown User'}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        size="small"
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="not started">Not Started</MenuItem>
                        <MenuItem value="in progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={task.priority} 
                        color={priorityColors[task.priority] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={task.difficulty} 
                        color={difficultyColors[task.difficulty] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {task.dueDate 
                        ? format(new Date(task.dueDate), 'MMM dd, yyyy')
                        : 'No deadline'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyTasks;