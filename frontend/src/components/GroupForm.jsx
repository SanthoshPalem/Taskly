import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { createGroup } from '../Services/GroupServices';
import { AuthContext } from '../context/AuthContext';

const GroupForm = ({ open, handleClose }) => {
  const [groupName, setGroupName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { user } = useContext(AuthContext);

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      setSnackbar({ open: true, message: 'Please enter a group name', severity: 'warning' });
      return;
    }

    try {
      await createGroup({ name: groupName });
      setGroupName('');
      setSnackbar({ open: true, message: 'Group created successfully!', severity: 'success' });
      handleClose();
    } catch (error) {
      console.error('Error creating group:', error);
      let errorMessage = 'Failed to create group. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || errorMessage;
        if (error.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Group Name"
            variant="outlined"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GroupForm;
