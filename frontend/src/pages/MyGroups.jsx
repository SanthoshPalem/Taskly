import React, { useEffect, useState } from 'react';
import {
  Box, Typography, InputBase, Paper, List, ListItem, ListItemButton, ListItemText,
  Divider, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar, TextField, Tooltip, Fab, Card, CardContent, Menu,
  MenuItem, Avatar, Chip, Grid, useTheme, useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupForm from '../components/GroupForm';
import { getMyGroups, deleteGroup, updateGroup, removeUserFromGroup } from '../Services/GroupServices';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import AddUserForm from '../components/AddUserForm';
import UserCard from '../components/UserCard';
import { fetchGroupMembers } from '../Services/GroupServices';

const MyGroups = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [selectedGroupForAddUser, setSelectedGroupForAddUser] = useState(null);
  const [openGroupDialog, setOpenGroupDialog] = useState(false);

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
        await updateGroup(selectedGroup._id, editGroupData);
        setSnackbarMessage('Group updated successfully!');
        setSnackbarOpen(true);
        fetchGroups();
        setSelectedGroup({ ...selectedGroup, name: editGroupData.name });
      } catch (error) {
        setSnackbarMessage('Failed to update group');
        setSnackbarOpen(true);
      }
    }
    setEditDialogOpen(false);
  };

  const handleView = (group) => {
    setSelectedGroup(group);
    if (isMobile) {
      setOpenGroupDialog(true);
    }
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
          width: isMobile ? '100%' : '35%',
          height: '100%',
          borderRight: isMobile ? 'none' : '1px solid #e0e0e0',
          p: isMobile ? 1.5 : 2,
          bgcolor: '#ffffff',
          color: '#000',
          overflowY: 'auto',
          boxShadow: isMobile ? 'none' : '2px 0 4px rgba(0,0,0,0.05)'
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

        {/* Group List - Same for Mobile and Desktop */}
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
                        {!isMobile && (
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
                        )}
                      </Box>
                    }
                    secondary={
                      isMobile 
                        ? `${group.tasks?.length ?? 0} Tasks • ${group.members?.length ?? 0} Members`
                        : `Created by ${group.createdBy?.name || 'Unknown'} • ${new Date(group.createdAt).toLocaleDateString()}`
                    }
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Right Panel - Group Details - Desktop Only */}
      {!isMobile && (
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
                      setSelectedGroupForAddUser(selectedGroup);
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

              {/* Render User Cards */}
              <Box sx={{ mt: 3, p: 2 }}>
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
                    {groupMembers.map((member, index) => {
                      // Add groupId to the member object
                      const memberWithGroupId = {
                        ...member,
                        groupId: selectedGroup?._id // Add the current group's ID
                      };
                      
                      return (
                        <UserCard
                          key={member.userId?._id || index}
                          member={memberWithGroupId}
                          isGroupCreator={selectedGroup?.createdBy?._id === member.userId?._id}
                          onAddTask={(member) => console.log('Add task for:', member)}
                          onEdit={(member) => console.log('Edit member:', member)}
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
      )}

      {/* Group Details Dialog - Mobile Only */}
      <Dialog
        open={openGroupDialog}
        onClose={() => setOpenGroupDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            maxHeight: isMobile ? '100%' : '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#1677ff',
          color: 'white'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {selectedGroup?.name || 'Group Details'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={(e) => setMobileMenuAnchorEl(e.currentTarget)}
              sx={{ color: 'white', mr: 1 }}
            >
              <MoreVertIcon />
            </IconButton>
            <IconButton
              onClick={() => setOpenGroupDialog(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {selectedGroup && (
            <Box sx={{ p: 2 }}>
              {/* Group Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Group Information
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip
                    icon={<AssignmentIcon />}
                    label={`${selectedGroup.tasks?.length ?? 0} Tasks`}
                    sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                  />
                  <Chip
                    icon={<PersonIcon />}
                    label={`${selectedGroup.members?.length ?? 0} Members`}
                    sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2' }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Created by {selectedGroup.createdBy?.name || 'Unknown'} on {new Date(selectedGroup.createdAt).toLocaleDateString()}
                </Typography>
              </Box>

              {/* Group Members */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Group Members ({groupMembers.length})
                </Typography>
                {groupMembers.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {groupMembers.map((member, index) => (
                      <UserCard key={index} member={member} />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No members found in this group.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
          <Button 
            onClick={() => {
              setSelectedGroupForAddUser(selectedGroup);
              setOpenAddUserDialog(true);
            }}
            startIcon={<PersonIcon />}
            variant="outlined"
          >
            Add Member
          </Button>
          <Button 
            onClick={() => {
              handleEditClick(selectedGroup);
              setOpenGroupDialog(false);
            }}
            startIcon={<AssignmentIcon />}
            variant="outlined"
          >
            Edit Group
          </Button>
          <Button 
            onClick={() => {
              setDeleteTargetId(selectedGroup._id);
              setOpenDeleteDialog(true);
              setOpenGroupDialog(false);
            }}
            color="error"
            variant="outlined"
          >
            Delete
          </Button>
        </DialogActions>
        
        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileMenuAnchorEl}
          open={isMobileMenuOpen}
          onClose={() => setMobileMenuAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              setSelectedGroupForAddUser(selectedGroup);
              setOpenAddUserDialog(true);
              setMobileMenuAnchorEl(null);
            }}
          >
            Add Person
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              handleEditClick(selectedGroup);
              setMobileMenuAnchorEl(null);
              setOpenGroupDialog(false);
            }}
          >
            Edit Group Name
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setDeleteTargetId(selectedGroup._id);
              setOpenDeleteDialog(true);
              setMobileMenuAnchorEl(null);
              setOpenGroupDialog(false);
            }}
            sx={{ color: 'red' }}
          >
            Delete Group
          </MenuItem>
        </Menu>
      </Dialog>

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
        groupId={selectedGroupForAddUser?._id}
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
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Remove User from Group
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
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
                console.log('Attempting to remove member:', {
                  groupId: userToRemove?.groupId,
                  userId: userToRemove?.userId?._id,
                  userToRemove
                });
                
                if (!userToRemove?.groupId || !userToRemove?.userId?._id) {
                  throw new Error('Missing required user or group information');
                }

                // Make the API call
                const response = await removeUserFromGroup(
                  userToRemove.groupId, 
                  userToRemove.userId._id
                );
                
                console.log('Remove user response:', response);
                
                // Refresh the group members after successful removal
                if (selectedGroup) {
                  console.log('Refreshing group members...');
                  await fetchGroupMembersById(selectedGroup._id);
                }
                
                setSnackbarMessage('User removed from group successfully');
                setSnackbarOpen(true);
                
              } catch (error) {
                console.error('Error removing user:', {
                  error,
                  response: error.response,
                  data: error.response?.data,
                  status: error.response?.status,
                  statusText: error.response?.statusText,
                });
                
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
