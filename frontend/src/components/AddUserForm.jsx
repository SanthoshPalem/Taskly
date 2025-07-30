import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box
} from '@mui/material';
import { addUserToGroup } from '../Services/GroupServices'; // Ensure correct path

const AddUserForm = ({ open, group, onClose, onUserAdded }) => {
  const [email, setEmail] = useState('');

  const handleAdd = async () => {
    if (!email) return;

    try {
      const token = localStorage.getItem('token');
      await addUserToGroup(group._id, { email }, token);
      setEmail('');
      onClose();
      onUserAdded();  // ✅ Refresh group data
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  return (
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
  );
};

export default AddUserForm;
