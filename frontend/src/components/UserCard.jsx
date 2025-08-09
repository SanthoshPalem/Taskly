import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Collapse,
  Paper,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import AddTaskForm from './AddTaskForm';
import EditTaskForm from './EditTaskForm';
import { removeUserFromGroup } from '../Services/GroupServices';
import { getTasksByUser, updateTask, deleteTask } from '../Services/TasksServices';

const UserCard = ({ member, groupId, onEdit, onDelete, onTaskAdded }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });
  const [userTasks, setUserTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTasks, setShowTasks] = useState(false);

  const { userId, isGroupCreator } = member || {};
  const name = userId?.name || 'Unknown Name';
  const email = userId?.email || 'Unknown Email';
  const userIdValue = userId?._id || '';

  const fetchUserTasks = async () => {
    if (!userIdValue || !member?.groupId) {
      console.log('Missing userId or groupId:', { userIdValue, groupId: member?.groupId });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Fetching tasks for user:', { userId: userIdValue, groupId: member.groupId });
      
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const tasks = await getTasksByUser(member.groupId, userIdValue);
      console.log('Fetched tasks:', tasks);
      setUserTasks(Array.isArray(tasks) ? tasks : []);
    } catch (error) {
      console.error('Error fetching user tasks:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        userId: userIdValue,
        groupId: member?.groupId
      });
      setSnack({
        open: true,
        message: `Failed to load tasks: ${error.message}`,
        severity: 'error'
      });
      setUserTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTasks();
  }, [userIdValue, groupId]);

  const handleAddTask = () => {
    setOpenDialog(true);
  };

  const handleTaskAdded = async () => {
    // Add a small delay to ensure the backend has time to process the new task
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Force a complete refresh of the task list
    await fetchUserTasks();
    
    // Also notify the parent component if needed
    if (typeof onTaskAdded === 'function') {
      onTaskAdded();
    }
    
    console.log('Task added and list refreshed');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
    setViewingTask(null);
  };

  const handleViewTask = (task, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setViewingTask(task);
  };

  const handleEditTask = (task) => {
    setEditingTask({
      _id: task._id,
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'not started',
      difficulty: task.difficulty || 'easy',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setOpenDialog(true);
  };

  const handleDeleteUser = async () => {
    try {
      // Validate required data
      if (!member?.groupId) {
        throw new Error('Group information is missing');
      }
      
      if (!member?.userId?._id) {
        throw new Error('User information is missing');
      }

      // Call the parent's onDelete handler with the member data
      // The parent component will handle the confirmation and API call
      onDelete?.(member);
    } catch (err) {
      console.error('Error in handleDeleteUser:', err);
      // The error will be handled by the parent component
      throw err;
    }
  };

  const handleCloseSnack = () => {
    setSnack({ ...snack, open: false });
  };

  return (
    <>
      <Card sx={{ width: '100%', mb: 2, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">{name}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {email}
          </Typography>
          
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => setShowTasks(!showTasks)}
            startIcon={<DescriptionIcon />}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            {showTasks ? 'Hide Task' : `View Task (${userTasks.length})`}
          </Button>
          
          <Collapse in={showTasks}>
            <Box sx={{ borderTop: '1px solid #eee', pt: 2 }}>
              {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">Loading tasks...</Typography>
            </Box>
          ) : userTasks && userTasks.length > 0 ? (
            userTasks.map((task, index) => (
              <Paper
                key={task._id || index}
                elevation={0}
                sx={{
                  p: 1.5,
                  mb: 1.5,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    boxShadow: 1
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 0.5,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewTask(task);
                      }}
                    >
                      {task.title}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleViewTask(task, e)}
                      title="View Task Details"
                      sx={{ ml: 1, color: 'text.secondary' }}
                    >
                      <DescriptionIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          if (!task._id) {
                            throw new Error('Task ID is missing');
                          }
                          console.log('Deleting task with ID:', task._id);
                          const response = await deleteTask(task._id);
                          console.log('Delete task response:', response);
                          
                          setSnack({
                            open: true,
                            message: 'Task deleted successfully',
                            severity: 'success'
                          });
                          
                          // Refresh the task list
                          await fetchUserTasks();
                          
                          // Notify parent component if needed
                          if (onTaskAdded) {
                            onTaskAdded();
                          }
                        } catch (error) {
                          console.error('Error deleting task:', {
                            error,
                            response: error.response?.data,
                            status: error.response?.status,
                            statusText: error.response?.statusText
                          });
                          
                          let errorMessage = 'Failed to delete task';
                          if (error.response?.data?.message) {
                            errorMessage = error.response.data.message;
                          } else if (error.message) {
                            errorMessage = error.message;
                          }
                          
                          setSnack({
                            open: true,
                            message: errorMessage,
                            severity: 'error'
                          });
                        }
                      }}
                      title="Delete Task"
                      sx={{ ml: 1, color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleViewTask(task, e)}
                      title="View Task Details"
                      sx={{ ml: 1 }}
                    >
                      <DescriptionIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5, alignItems: 'center' }}>
                  <Chip 
                    label={task.status || 'Not Started'} 
                    size="small" 
                    color={
                      task.status === 'completed' ? 'success' : 
                      task.status === 'in progress' ? 'primary' : 'default'
                    }
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                  <Chip 
                    label={`Priority: ${task.priority || 'medium'}`} 
                    size="small" 
                    color={
                      task.priority === 'high' ? 'error' : 
                      task.priority === 'medium' ? 'warning' : 'default'
                    }
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                  {task.difficulty && (
                    <Chip 
                      label={`${task.difficulty}`} 
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  )}
                  {task.dueDate && (
                    <Chip 
                      label={`Due: ${new Date(task.dueDate).toLocaleDateString()}`} 
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Paper>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
              No tasks assigned
            </Typography>
          )}
            </Box>
          </Collapse>
        </CardContent>

        <CardActions sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
          <Button size="small" variant="outlined" color="primary" onClick={handleAddTask}>
            Add Task
          </Button>
          {userTasks.length > 0 && (
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => handleEditTask(userTasks[0])} // Edit the first task for now
              sx={{ ml: 1 }}
            >
              Edit Task
            </Button>
          )}
          {!isGroupCreator && (
            <Button 
              size="small" 
              color="error"
              onClick={handleDeleteUser}
              title="Remove user from group"
            >
              Remove
            </Button>
          )}
        </CardActions>
      </Card>

      {/* Edit/Add Task Dialog */}
      <Dialog open={openDialog && !!editingTask} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {'Edit Task'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <EditTaskForm
            task={editingTask}
            onClose={handleCloseDialog}
            onTaskUpdated={async (updatedTask) => {
              try {
                // Update the task via API
                await updateTask(editingTask._id, updatedTask);
                
                // Update local state
                setUserTasks(prevTasks => 
                  prevTasks.map(task => 
                    task._id === editingTask._id 
                      ? { ...task, ...updatedTask } 
                      : task
                  )
                );
                
                setSnack({
                  open: true,
                  message: 'Task updated successfully!',
                  severity: 'success'
                });
              } catch (error) {
                console.error('Error updating task:', error);
                setSnack({
                  open: true,
                  message: `Failed to update task: ${error.message}`,
                  severity: 'error'
                });
              } finally {
                setEditingTask(null);
                handleCloseDialog();
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <AddTaskForm 
        open={openDialog && !editingTask && !viewingTask} 
        onClose={handleCloseDialog} 
        groupId={member?.groupId}
        createdBy={member?.createdBy}
        assignedTo={[member?.userId?._id]} // Pass as array to support multiple assignments
        onTaskAdded={handleTaskAdded}
      />

      {/* Task Description Dialog */}
      <Dialog 
        open={!!viewingTask} 
        onClose={(e) => {
          e?.stopPropagation();
          setViewingTask(null);
        }} 
        fullWidth 
        maxWidth="sm"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {viewingTask?.title || 'Task Details'}
          <IconButton
            aria-label="close"
            onClick={(e) => {
              e.stopPropagation();
              setViewingTask(null);
            }}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {viewingTask?.description ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>Description:</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                {viewingTask.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                <Chip 
                  label={viewingTask.status || 'Not Started'} 
                  size="small" 
                  color={
                    viewingTask.status === 'completed' ? 'success' : 
                    viewingTask.status === 'in progress' ? 'primary' : 'default'
                  }
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
                <Chip 
                  label={`Priority: ${viewingTask.priority || 'medium'}`} 
                  size="small" 
                  color={
                    viewingTask.priority === 'high' ? 'error' : 
                    viewingTask.priority === 'medium' ? 'warning' : 'default'
                  }
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
                {viewingTask.difficulty && (
                  <Chip 
                    label={`${viewingTask.difficulty}`} 
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                )}
                {viewingTask.dueDate && (
                  <Chip 
                    label={`Due: ${new Date(viewingTask.dueDate).toLocaleDateString()}`} 
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setEditingTask(viewingTask);
                    setViewingTask(null);
                  }}
                >
                  Edit Task
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No description available for this task.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnack}
          severity={snack.severity}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserCard;
