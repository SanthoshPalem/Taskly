import React, { useEffect, useState } from 'react';
import {
  Box, Typography, InputBase, Paper, List, ListItem, ListItemButton, ListItemText,
  Divider, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar, TextField, Tooltip, Fab, Card, CardContent, Menu,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import GroupForm from '../components/GroupForm';
import { getMyGroups, deleteGroup, updateGroup } from '../Services/GroupServices';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton } from '@mui/material';
import AddUserForm from '../components/AddUserForm'; // correct the path
import UserCard from '../components/UserCard';
import { fetchGroupMembers } from '../Services/GroupServices';



const MyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);

  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editGroupData, setEditGroupData] = useState({ name: '' });
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [selectedGroupForAddUser, setSelectedGroupForAddUser] = useState(null);


  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const res = await getMyGroups();
    if (Array.isArray(res)) {
      setGroups(res);
      setFilteredGroups(res);
    } else {
      console.error('Response does not contain an array');
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = groups.filter((group) =>
      group.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredGroups(filtered);
  };

  const handleDelete = async () => {
    if (deleteTargetId) {
      await deleteGroup(deleteTargetId);
      fetchGroups();
      setSnackbarMessage('Group deleted successfully');
      setSnackbarOpen(true);
      setOpenDeleteDialog(false);
      setDeleteTargetId(null);
    }
  };

  const handleEditClick = (group) => {
    setEditGroupData({ _id: group._id, name: group.name });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    const trimmedName = editGroupData.name.trim().toLowerCase();

    const isDuplicate = groups.some(
      (g) =>
        g._id !== editGroupData._id &&
        g.name.trim().toLowerCase() === trimmedName
    );

    if (isDuplicate) {
      setSnackbarMessage('Group name already exists');
      setSnackbarOpen(true);
      return;
    }

    try {
      await updateGroup(editGroupData._id, {
        groupName: editGroupData.name,
      });

      const updated = groups.map((group) =>
        group._id === editGroupData._id
          ? { ...group, name: editGroupData.name }
          : group
      );

      setGroups(updated);
      setFilteredGroups(updated);

      if (selectedGroup?._id === editGroupData._id) {
        setSelectedGroup((prev) => ({ ...prev, name: editGroupData.name }));
      }

      setEditDialogOpen(false);
      setSnackbarMessage('Group name updated successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error updating group:', err);
      setSnackbarMessage('Error updating group');
      setSnackbarOpen(true);
    }
  };

  const handleToggle = () => {
    setSelectedGroupId(null);
    setOpenForm(true);
  };

  const handleView = (group) => {
    setSelectedGroup(group);
  };

  const fetchGroupMembersById = async (groupId) => {
    try {
      const members = await fetchGroupMembers(groupId); // this uses your frontend service function
      setGroupMembers(members); // update the state that holds members
    } catch (error) {
      console.error('Error fetching group members:', error);
      setSnack({
        open: true,
        message: 'Failed to refresh group members.',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    const getMembers = async () => {
      if (selectedGroup?._id) {
        try {
          const members = await fetchGroupMembers(selectedGroup._id);
          setGroupMembers(members);
        } catch (error) {
          console.error('Failed to fetch members', error);
        }
      }
    };

    getMembers();
  }, [selectedGroup]);




  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left Panel - Group List */}
      <Box
        sx={{
          width: '30%',
          height: '90%',
          borderRight: '1px solid #ccc',
          p: 2,
          bgcolor: '#727272ff',
          color: 'white',
          overflowY: 'auto'
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          My Groups
        </Typography>

        {/* Search */}
        <Paper
          sx={{
            p: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            borderRadius: 2
          }}
        >
          <SearchIcon sx={{ p: 1 }} />
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search Groups"
            value={searchTerm}
            onChange={handleSearch}
          />
        </Paper>

        {/* Group List */}
        <List>
          {filteredGroups.map((group) => (
            <React.Fragment key={group._id}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleView(group)}>
                  <ListItemText
                    primary={group.name}
                    secondary={`Tasks: ${group.tasks?.length ?? 0} | Members: ${group.members?.length ?? 0}`}
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Right Panel - Group Details */}
      <Box sx={{ flex: 1, p: 1, overflowY: 'auto' }}>
        {selectedGroup ? (
          <Card
            sx={{
              width: '100%',
              minHeight: '90%',
              p: 3,
              borderRadius: 3,
              boxShadow: 3,
              bgcolor: '#727272ff',
              color: '#ffffff',
              position: 'relative', // Important for positioning the menu icon
            }}
          >
            {/* Menu Icon at Top-Right */}
            <IconButton
              aria-label="more"
              onClick={(e) => setMenuAnchorEl(e.currentTarget)}
              sx={{ position: 'absolute', top: 16, right: 16 }}
            >
              <MoreVertIcon />
            </IconButton>


            <CardContent>
              <Typography variant="h5" gutterBottom>
                {selectedGroup.name}
              </Typography>
              <Typography variant="body1">
                Tasks: {selectedGroup.tasks?.length ?? 0}
              </Typography>
              <Typography variant="body1">
                Members: {selectedGroup.members?.length ?? 0}
              </Typography>

              <Menu
                anchorEl={menuAnchorEl}
                open={isMenuOpen}
                onClose={() => setMenuAnchorEl(null)}
              >
                <MenuItem
                  onClick={() => {
                    setSelectedGroupForAddUser(selectedGroup); // if you're using a dialog for adding users
                    setOpenAddUserDialog(true);
                    setMenuAnchorEl(null);
                  }}
                >
                  Add Person
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    handleEditClick(selectedGroup);
                    setMenuAnchorEl(null);
                  }}
                >
                  Edit Group Name
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    setDeleteTargetId(selectedGroup._id);
                    setOpenDeleteDialog(true);
                    setMenuAnchorEl(null);
                  }}
                  sx={{ color: 'red' }}
                >
                  Delete Group
                </MenuItem>


              </Menu>

            </CardContent>

            {/* 🧑‍💻 Render User Cards */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Group Members ({groupMembers.length})
              </Typography>
              {groupMembers.length > 0 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 2,
                    mt: 2
                  }}
                >
                  {groupMembers.map((member, index) => (
                    <UserCard
                      key={member.userId?._id || index}
                      member={member}
                      onAddTask={(member) => console.log('Add task for:', member)}
                      onEdit={(member) => console.log('Edit member:', member)}
                      onDelete={(member) => console.log('Delete member:', member)}
                    />
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    bgcolor: '#f5f5f5',
                    borderRadius: 2,
                    border: '2px dashed #ddd'
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No members in this group yet.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Use the "Add Person" option from the menu to invite members.
                  </Typography>
                </Box>
              )}
            </Box>

          </Card>
        ) : (
          <Typography variant="h6" color="text.secondary">
            Select a group to view its details.
          </Typography>
        )}
      </Box>

      {/* Floating Add Button */}
      <Tooltip title="Add Group">
        <Fab
          color="primary"
          onClick={handleToggle}
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      {/* Group Form Dialog */}
      <GroupForm
        open={openForm}
        handleClose={() => {
          setOpenForm(false);
          fetchGroups();
        }}
        groupId={selectedGroupId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this group? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Group Name"
            variant="standard"
            value={editGroupData.name}
            onChange={(e) =>
              setEditGroupData({ ...editGroupData, name: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

      <AddUserForm
        open={openAddUserDialog}
        group={selectedGroupForAddUser}
        onClose={() => setOpenAddUserDialog(false)}
        onUserAdded={() => fetchGroupMembersById(selectedGroupForAddUser._id)}
      />


    </Box>
  );
};

export default MyGroups;
