import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Snackbar, Alert, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import { addUserToGroup } from '../Services/GroupServices';

const AddUserForm = ({ open, groupId, onClose, onUserAdded }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isLoading, setIsLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

  const handleCloseSnack = () => {
    setSnack({ ...snack, open: false });
  };

  const resetForm = () => {
    setEmail('');
    setRole('member');
  };

  const handleAdd = async () => {
    if (!email) {
      setSnack({ open: true, message: 'Please enter an email.', severity: 'warning' });
      return;
    }

    if (!email.includes('@')) {
      setSnack({ open: true, message: 'Please enter a valid email address.', severity: 'warning' });
      return;
    }

    setIsLoading(true);
    try {
      await addUserToGroup(groupId, { email, role });
      setSnack({ open: true, message: 'User added successfully!', severity: 'success' });
      resetForm();
      onUserAdded();  // This will trigger fetchGroupMembersById from parent
      onClose();      // Close the dialog after success
    } catch (error) {
      console.error('Error adding user to group:', error);
      let message = 'Failed to add user to group.';
      let severity = 'error';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        message = error.response.data?.message || message;
        if (error.response.status === 401) {
          message = 'Your session has expired. Please log in again.';
          // Optionally redirect to login here if needed
        }
      } else if (error.request) {
        // The request was made but no response was received
        message = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        message = error.message || message;
      }

      // Set appropriate severity based on error type
      if (message.toLowerCase().includes('already')) {
        severity = 'warning';
      } else if (message.toLowerCase().includes('not found')) {
        severity = 'error';
      }

      setSnack({ open: true, message, severity });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Add User to Group</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ m: 1, minWidth: '300px' }}>
            <TextField
              label="User Email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="user@example.com"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleAdd} 
            variant="contained"
            disabled={isLoading || !email}
          >
            {isLoading ? 'Adding...' : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // 👈 this line sets position
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

export default AddUserForm;
