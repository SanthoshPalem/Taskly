import React, { useState } from 'react';
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
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddTaskForm from './AddTaskForm';
import EditTaskForm from './EditTaskForm';
import { removeUserFromGroup } from '../Services/GroupServices'; // ✅ import the function

const UserCard = ({ member, onEdit, onDelete }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

  const { userId, role, isGroupCreator } = member || {};
  const name = userId?.name || 'Unknown Name';
  const email = userId?.email || 'Unknown Email';

  const handleAddTask = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
  };

  const handleEditTask = () => {
    setEditingTask({
      title: 'Sample Task',
      description: 'Description here',
      priority: 'High',
      status: 'In Progress',
      difficulty: 'Medium',
      deadline: '2025-08-10',
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
      <Card sx={{ minWidth: 300, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
            {role === 'admin' ? 'Admin' : 'Member'}
          </Typography>
          <Typography variant="h6" sx={{ mb: 1 }}>{name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {email}
          </Typography>
          <Typography variant="body2">Assigned Tasks: 0</Typography>
          <Typography variant="body2">Deadline: N/A</Typography>
          <Typography variant="body2">Priority: Medium</Typography>
          <Typography variant="body2">Status: Not Started</Typography>
          <Typography variant="body2">Difficulty: Easy</Typography>
        </CardContent>

        <CardActions sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
          <Button size="small" variant="outlined" color="primary" onClick={handleAddTask}>
            Add Task
          </Button>
          <Button size="small" variant="outlined" onClick={handleEditTask}>
            Edit
          </Button>
          {!isGroupCreator && (
            <Button 
              size="small" 
              color="error"
              onClick={handleDeleteUser}
              title={isGroupCreator ? 'Group creator cannot be removed' : 'Remove user from group'}
            >
              Remove
            </Button>
          )}
        </CardActions>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingTask ? 'Edit Task' : `Add Task for ${name}`}
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
          {editingTask ? (
            <EditTaskForm
              task={editingTask}
              onClose={handleCloseDialog}
              onTaskUpdated={() => {
                setEditingTask(null);
                handleCloseDialog();
              }}
            />
          ) : (
            <AddTaskForm
              open={openDialog}
              onClose={handleCloseDialog}
              groupId={member.groupId}
              createdBy={member.userId?._id}
              users={[member.userId]}
              onTaskAdded={() => {
                handleCloseDialog();
              }}
            />
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
