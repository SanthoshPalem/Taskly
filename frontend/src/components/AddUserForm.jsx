import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Snackbar, Alert
} from '@mui/material';
import { addUserToGroup } from '../Services/GroupServices'; // Ensure correct path

const AddUserForm = ({ open, group, onClose, onUserAdded }) => {
  const [email, setEmail] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

  const handleCloseSnack = () => {
    setSnack({ ...snack, open: false });
  };

const handleAdd = async () => {
  if (!email) {
    setSnack({ open: true, message: 'Please enter an email.', severity: 'warning' });
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await addUserToGroup(group._id, { email }, token);
    setSnack({ open: true, message: 'User added successfully!', severity: 'success' });
    setEmail('');
    
    onUserAdded();  // This will trigger fetchGroupMembersById from parent
    onClose();      // Close the dialog after success

  } catch (error) {
    const msg = error?.response?.data?.message || 'Failed to add user.';
    const severity = msg.includes('not found') ? 'error' :
      msg.includes('already') ? 'warning' : 'error';

    setSnack({ open: true, message: msg, severity });
  }
};



  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Add User to Group</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ m: 1 }}>
            <TextField
              label="User Email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">Add</Button>
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
