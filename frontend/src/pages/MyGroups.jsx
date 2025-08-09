import React, { useEffect, useState } from 'react';
import {
  Box, Typography, InputBase, Paper, List, ListItem, ListItemButton, ListItemText,
  Divider, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar, TextField, Tooltip, Fab, Card, CardContent, Menu,
  MenuItem, Avatar, Chip, Grid, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupForm from '../components/GroupForm';
import { getMyGroups, deleteGroup, updateGroup, removeUserFromGroup, fetchGroupMembers } from '../Services/GroupServices';
import CloseIcon from '@mui/icons-material/Close';
import AddUserForm from '../components/AddUserForm';
import UserCard from '../components/UserCard';

const MyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
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
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
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
      console.error('Expected array but got:', res);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = groups.filter(group =>
      group.name.toLowerCase().includes(term)
    );
    setFilteredGroups(filtered);
  };

  const handleToggle = () => {
    setSelectedGroupId(null);
    setOpenForm(true);
  };

  const handleDelete = async () => {
    if (deleteTargetId) {
      try {
        await deleteGroup(deleteTargetId);
        setSnackbarMessage('Group deleted successfully!');
        setSnackbarOpen(true);
        fetchGroups();
        setSelectedGroup(null);
      } catch (error) {
        setSnackbarMessage('Failed to delete group');
        setSnackbarOpen(true);
      }
    }
    setOpenDeleteDialog(false);
    setDeleteTargetId(null);
  };

  const handleEditClick = (group) => {
    setEditGroupData({ name: group.name });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (selectedGroup && editGroupData.name.trim()) {
      try {
        const isDuplicate = groups.some(
          group =>
            group._id !== selectedGroup._id &&
            group.name.toLowerCase() === editGroupData.name.trim().toLowerCase()
        );

        if (isDuplicate) {
          setSnackbarMessage('A group with this name already exists');
          setSnackbarOpen(true);
          return;
        }

        await updateGroup(selectedGroup._id, editGroupData);
        setSnackbarMessage('Group updated successfully!');
        setSnackbarOpen(true);
        fetchGroups();
        setSelectedGroup({ ...selectedGroup, name: editGroupData.name });
      } catch (error) {
        setSnackbarMessage(error.response?.data?.message || 'Failed to update group');
        setSnackbarOpen(true);
      }
    }
    setEditDialogOpen(false);
  };

  const handleView = (group) => {
    setSelectedGroup(group);
  };

  const fetchGroupMembersById = async (groupId) => {
    try {
      const members = await fetchGroupMembers(groupId);
      setGroupMembers(members);
    } catch (error) {
      console.error('Failed to fetch members', error);
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
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* Groups List Panel */}
      <Box
        sx={{
          width: '35%',
          height: '100%',
          borderRight: '1px solid #e0e0e0',
          p: 2,
          bgcolor: '#ffffff',
          color: '#000',
          overflowY: 'auto',
          boxShadow: '2px 0 4px rgba(0,0,0,0.05)'
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
                  <Avatar sx={{ bgcolor: '#1677ff', mr: 2 }}>
                    <GroupIcon />
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {group.name}
                        </Typography>
                        <>
                          <Chip
                            label={`${group.tasks?.length ?? 0} Tasks`}
                            size="small"
                            sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontSize: '0.7rem' }}
                          />
                          <Chip
                            label={`${group.members?.length ?? 0} Members`}
                            size="small"
                            sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', fontSize: '0.7rem' }}
                          />
                        </>
                      </Box>
                    }
                    secondary={`Created by ${group.createdBy?.name || 'Unknown'} • ${new Date(group.createdAt).toLocaleDateString()}`}
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Right Panel - Group Details */}
      <Box sx={{
        flex: 1,
        p: 2,
        overflowY: 'auto',
        height: '100%',
        bgcolor: '#f8f9fa'
      }}>
        {selectedGroup ? (
          <Card
            sx={{
              width: '100%',
              minHeight: '95%',
              borderRadius: 3,
              boxShadow: 3,
              bgcolor: '#ffffff',
              color: '#000000',
              position: 'relative',
              border: '1px solid #e0e0e0'
            }}
          >
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

              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<PersonIcon />}
                  onClick={() => {
                    if (!selectedGroup?._id) {
                      setSnackbarMessage('Error: No group selected');
                      setSnackbarOpen(true);
                      return;
                    }
                    setOpenAddUserDialog(true);
                  }}
                  disabled={!selectedGroup}
                >
                  Add Member
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditClick(selectedGroup)}
                  disabled={!selectedGroup}
                >
                  Edit Group
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    setDeleteTargetId(selectedGroup?._id);
                    setOpenDeleteDialog(true);
                  }}
                  disabled={!selectedGroup}
                >
                  Delete Group
                </Button>
              </Box>
            </CardContent>

            {/* Members */}
            <Box sx={{ mt: 3, p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Group Members ({groupMembers.length})
                </Typography>
                <Paper
                  component="form"
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    width: 300,
                    maxWidth: '100%',
                    bgcolor: 'background.paper',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2
                  }}
                >
                  <InputBase
                    sx={{ ml: 1, flex: 1, fontSize: '0.9rem' }}
                    placeholder="Search members..."
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                  />
                  {memberSearchTerm && (
                    <IconButton
                      size="small"
                      onClick={() => setMemberSearchTerm('')}
                      sx={{ p: '5px', color: 'text.secondary' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Paper>
              </Box>

              {groupMembers.length > 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    mt: 2,
                    width: '100%'
                  }}
                >
                  {groupMembers
                    .filter(member => {
                      if (!memberSearchTerm) return true;
                      const searchLower = memberSearchTerm.toLowerCase();
                      const name = member.userId?.name?.toLowerCase() || '';
                      const email = member.userId?.email?.toLowerCase() || '';
                      const role = member.role?.toLowerCase() || '';
                      return (
                        name.includes(searchLower) ||
                        email.includes(searchLower) ||
                        role.includes(searchLower)
                      );
                    })
                    .map((member, index) => {
                      const memberWithGroupId = {
                        ...member,
                        groupId: selectedGroup?._id
                      };

                      return (
                        <UserCard
                          key={member.userId?._id || index}
                          member={memberWithGroupId}
                          isGroupCreator={selectedGroup?.createdBy?._id === member.userId?._id}
                          onAddTask={async () => {
                            if (selectedGroup?._id) {
                              await fetchGroupMembersById(selectedGroup._id);
                            }
                          }}
                          onTaskUpdated={async () => {
                            if (selectedGroup?._id) {
                              await fetchGroupMembersById(selectedGroup._id);
                            }
                          }}
                          onEdit={() => {}}
                          onDelete={(member) => {
                            if (selectedGroup?.createdBy?._id === member.userId?._id) {
                              setSnackbarMessage('Group creator cannot be removed');
                              setSnackbarOpen(true);
                              return;
                            }
                            setUserToRemove(member);
                            setConfirmDialogOpen(true);
                          }}
                        />
                      );
                    })}
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
                    Use the "Add Person" option to invite members.
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

      {/* Add User Dialog */}
      <AddUserForm
        open={openAddUserDialog}
        onClose={() => setOpenAddUserDialog(false)}
        groupId={selectedGroup?._id || selectedGroupForAddUser?._id}
        onUserAdded={() => {
          fetchGroups();
          if (selectedGroup) {
            fetchGroupMembersById(selectedGroup._id);
          }
        }}
      />

      {/* Confirmation Dialog for User Removal */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Remove User from Group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove {userToRemove?.userId?.name || 'this user'} from the group?
            <strong> This action cannot be undone.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                if (!userToRemove?.groupId || !userToRemove?.userId?._id) {
                  throw new Error('Missing required user or group information');
                }

                await removeUserFromGroup(
                  userToRemove.groupId,
                  userToRemove.userId._id
                );

                if (selectedGroup) {
                  await fetchGroupMembersById(selectedGroup._id);
                }

                setSnackbarMessage('User removed from group successfully');
                setSnackbarOpen(true);

              } catch (error) {
                let errorMessage = 'Failed to remove user from group';
                if (error.response?.data?.message) {
                  errorMessage = error.response.data.message;
                } else if (error.message) {
                  errorMessage = error.message;
                }
                setSnackbarMessage(errorMessage);
                setSnackbarOpen(true);
              } finally {
                setConfirmDialogOpen(false);
                setUserToRemove(null);
              }
            }}
            color="error"
            autoFocus
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyGroups;
