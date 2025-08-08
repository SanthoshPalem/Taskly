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
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getMyGroups, updateUserInGroup } from '../Services/GroupServices';
import { getTasksByUser } from '../Services/TasksServices';

const Users = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchUsersAndTasks = async () => {
    try {
      setLoading(true);
      const groups = await getMyGroups();
      
      // Extract all users from all groups, including duplicates for users in multiple groups
      const allUsers = [];
      
      for (const group of groups) {
        if (group.members && Array.isArray(group.members)) {
          for (const member of group.members) {
            if (member.userId) {
              // Create a unique key combining user ID and group ID
              const userGroupKey = `${member.userId._id}-${group._id}`;
              
              allUsers.push({
                id: member.userId._id,
                key: userGroupKey, // Unique key for React rendering
                name: member.userId.name,
                email: member.userId.email,
                groupId: group._id,
                groupName: group.name,
                role: member.role,
                createdBy: group.createdBy?._id || group.createdBy // Handle both populated and non-populated createdBy
              });
            }
          }
        }
      }

      // Fetch tasks for all users
      const usersWithTasks = await Promise.all(
        allUsers.map(async (user) => {
          try {
            const tasks = await getTasksByUser(user.groupId, user.id);
            const activeTask = tasks && tasks.length > 0 ? tasks[0] : null;
            
            return {
              ...user,
              task: activeTask ? {
                id: activeTask._id,
                title: activeTask.title,
                description: activeTask.description || 'No description',
                status: activeTask.status,
                priority: activeTask.priority,
                difficulty: activeTask.difficulty,
                dueDate: activeTask.dueDate ? new Date(activeTask.dueDate).toLocaleDateString() : 'No deadline'
              } : null
            };
          } catch (error) {
            console.error(`Error fetching tasks for user ${user.id}:`, error);
            return { ...user, task: null };
          }
        })
      );

      setUsers(usersWithTasks);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsersAndTasks();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsersAndTasks();
  };

  const handleRoleChange = async (userId, groupId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    
    try {
      await updateUserInGroup(groupId, userId, { role: newRole });
      
      // Update the local state to reflect the role change
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId && user.groupId === groupId 
            ? { ...user, role: newRole } 
            : user
        )
      );
      
      setSnackbar({
        open: true,
        message: `User role updated to ${newRole}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update user role',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.task && user.task.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'primary';
      case 'not started':
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
      default:
        return 'success';
    }
  };

  if (loading && !refreshing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Users & Tasks
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search users or tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Group</TableCell>
                <TableCell>Assigned Task</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.key} hover>
                    <TableCell>
                      <Box component="span" sx={{ color: user.role === 'admin' ? 'error.main' : 'inherit', fontWeight: user.role === 'admin' ? 'bold' : 'normal' }}>
                        {user.name}
                        {user.role === 'admin' && ' (Admin)'}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.groupName}
                      {user.createdBy === user.id && (
                        <Chip 
                          label="Creator" 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1, fontSize: '0.7rem' }} 
                        />
                      )}
                    </TableCell>
                    <TableCell>{user.task?.title || 'No task assigned'}</TableCell>
                    <TableCell>
                      <Tooltip title={user.task?.description || 'No description'} arrow>
                        <Box sx={{ 
                          maxWidth: '200px', 
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {user.task?.description || 'No description'}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {user.task ? (
                        <Chip 
                          label={user.task.status} 
                          color={getStatusColor(user.task.status)}
                          size="small"
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {user.task ? (
                        <Chip 
                          label={user.task.priority} 
                          color={getPriorityColor(user.task.priority)}
                          size="small"
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell>{user.task?.difficulty || '-'}</TableCell>
                    <TableCell>{user.task?.dueDate || '-'}</TableCell>
                    <TableCell>
                      {user.createdBy !== user.id && (
                        <Button
                          variant="outlined"
                          size="small"
                          color={user.role === 'admin' ? 'error' : 'primary'}
                          onClick={() => handleRoleChange(user.id, user.groupId, user.role)}
                        >
                          Make {user.role === 'admin' ? 'Member' : 'Admin'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    {searchTerm ? 'No matching users found' : 'No users available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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

export default Users;