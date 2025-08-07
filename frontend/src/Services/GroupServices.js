// src/Services/GroupServices.js
import axios from '../utils/axios';

// Get all groups
export const getGroups = async () => {
  const res = await axios.get('/api/groups/allgroups');
  return res.data;
};

// Get groups for current user
export const getMyGroups = async () => {
  try {
    const response = await axios.get('/api/groups/my-groups');
    const data = response.data;

    // Backend returns { createdGroups: [], memberGroups: [] }
    if (data.createdGroups && data.memberGroups) {
      // Combine both arrays for display
      return [...data.createdGroups, ...data.memberGroups];
    } else if (Array.isArray(data)) {
      return data;
    } else {
      console.error('Failed to fetch my-groups: Unexpected response structure', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching my-groups:', error);
    return [];
  }
};

// Get a group by ID
export const getGroupById = async (groupId) => {
  const res = await axios.get(`/api/groups/${groupId}`);
  return res.data;
};

// Create a group
export const createGroup = async (groupData) => {
  const res = await axios.post('/api/groups/create-groups', groupData);
  return res.data;
};

// Update a group
export const updateGroup = async (groupId, groupData) => {
  const res = await axios.put(`/api/groups/${groupId}`, groupData);
  return res.data;
};

// Delete a group
export const deleteGroup = async (groupId) => {
  const res = await axios.delete(`/api/groups/${groupId}`);
  return res.data;
};

// Add user to group
export const addUserToGroup = async (groupId, userData) => {
  const res = await axios.post(`/api/groups/${groupId}/add-user`, userData);
  return res.data;
};

// Remove user from group
export const removeUserFromGroup = async (groupId, userId) => {
  const res = await axios.delete(`/api/groups/${groupId}/users/${userId}`);
  return res.data;
};



// Update user in group
export const updateUserInGroup = async (groupId, userId, userData) => {
  const res = await axios.patch(`/api/groups/${groupId}/users/${userId}`, userData);
  return res.data;
};

// Retrieve users from the group
export const fetchGroupMembers = async (groupId) => {
  try {
    const response = await axios.get(`/api/groups/${groupId}/group-members`);
    return response.data.members;
  } catch (error) {
    console.error('Error fetching group members:', error);
    throw error;
  }
};