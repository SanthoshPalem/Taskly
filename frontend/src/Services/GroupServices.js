// src/Services/GroupServices.js
import axios from '../utils/axios';

// Get all groups
export const getGroups = async (token) => {
  const res = await axios.get('/api/groups/allgroups', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get groups for current user
export const getMyGroups = async (token) => {
  try {
    const response = await axios.get('/api/groups/my-groups', {
      headers: { Authorization: `Bearer ${token}` },
    });

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
export const getGroupById = async (groupId, token) => {
  const res = await axios.get(`/api/groups/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Create a group
export const createGroup = async (groupData, token) => {
  const res = await axios.post('/api/groups/create-groups', groupData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update a group
export const updateGroup = async (groupId, groupData, token) => {
  const res = await axios.put(`/api/groups/${groupId}`, groupData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Delete a group
export const deleteGroup = async (groupId, token) => {
  const res = await axios.delete(`/api/groups/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Add user to group
export const addUserToGroup = async (groupId, userData, token) => {
  const res = await axios.post(`/api/groups/${groupId}/add-user`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Remove user from group
export const removeUserFromGroup = async (groupId, userId, token) => {
  const res = await axios.delete(`/api/groups/${groupId}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update user in group
export const updateUserInGroup = async (groupId, userId, userData, token) => {
  const res = await axios.patch(`/api/groups/${groupId}/users/${userId}`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};


//retrive users from the group
export const fetchGroupMembers = async (groupId) => {
  try {
    const response = await axios.get(`/api/groups/${groupId}/group-members`);
    return response.data.members;
  } catch (error) {
    console.error('Error fetching group members:', error);
    throw error;
  }
};