import React from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Button,
  Typography
} from '@mui/material';

const UserCard = ({ member, onAddTask, onEdit, onDelete }) => {
  const { userId, role } = member || {};
  const name = userId?.name || 'Unknown Name';
  const email = userId?.email || 'Unknown Email';

  return (
    <Card sx={{ minWidth: 300, borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
          {role === 'admin' ? 'Admin' : 'Member'}
        </Typography>
        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {email}
        </Typography>
        {/* Replace static text if dynamic data available */}
        <Typography variant="body2">Assigned Tasks: 0</Typography>
        <Typography variant="body2">Deadline: N/A</Typography>
        <Typography variant="body2">Priority: Medium</Typography>
        <Typography variant="body2">Status: Not Started</Typography>
        <Typography variant="body2">Difficulty: Easy</Typography>
      </CardContent>

      <CardActions sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
        <Button size="small" variant="outlined" color="primary" onClick={() => onAddTask?.(member)}>
          Add Task
        </Button>
        <Button size="small" variant="outlined" onClick={() => onEdit?.(member)}>
          Edit
        </Button>
        <Button size="small" variant="outlined" color="error" onClick={() => onDelete?.(member)}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default UserCard;
