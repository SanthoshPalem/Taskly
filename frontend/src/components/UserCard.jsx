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
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddTaskForm from './AddTaskForm'; // create or import this
import EditTaskForm from './EditTaskForm';

const UserCard = ({ member, onEdit, onDelete }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // New

  const { userId, role } = member || {};
  const name = userId?.name || 'Unknown Name';
  const email = userId?.email || 'Unknown Email';

  const handleAddTask = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };



  const handleEditTask = () => {
    setEditingTask({
      title: "Sample Task",              // Replace with real task data
      description: "Description here",
      priority: "High",
      status: "In Progress",
      difficulty: "Medium",
      deadline: "2025-08-10",
    });
    setOpenDialog(true);
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

          <Button size="small" variant="outlined" color="error" onClick={() => onDelete?.(member)}>
            Delete
          </Button>
        </CardActions>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          Add Task for {name}
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
                // Optionally refetch tasks
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
                // Optionally refetch tasks
              }}
            />
          )}


        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserCard;
