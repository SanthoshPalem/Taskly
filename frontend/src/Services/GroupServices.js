// src/Services/GroupServices.js
import axios from '../utils/axios';

// Get all groups
export const getGroups = async () => {
  const res = await axios.get('/api/groups/allgroups');
  return res.data;
};

// Get groups created by the current user
export const getMyGroups = async () => {
  try {
    console.log('Sending request to /api/groups/my-groups');
    const response = await axios.get('/api/groups/my-groups');
    console.log('Raw API response:', response);
    
    const data = response.data;
    console.log('Response data:', data);

    // If the response is an array, filter to only include groups created by the current user
    if (Array.isArray(data)) {
      console.log('Filtering groups to only include those created by current user');
      // Assuming the current user's ID is available in the group's createdBy field
      return data.filter(group => group.createdBy?._id === JSON.parse(localStorage.getItem('user'))?._id);
    }
    
    // If the response has the expected structure with createdGroups/memberGroups
    if (data && (data.createdGroups || data.memberGroups)) {
      // Only return groups created by the current user
      const createdGroups = data.createdGroups || [];
      console.log('Returning only created groups:', createdGroups);
      return createdGroups;
    }
    
    // If we get here, the response structure is unexpected
    console.error('Unexpected response structure from /api/groups/my-groups:', data);
    return [];
    
  } catch (error) {
    console.error('Error in getMyGroups:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'No response',
      request: error.request ? 'Request was made but no response received' : 'No request was made',
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    
    // Re-throw the error to be handled by the component
    throw error;
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
  try {
    console.log(`[addUserToGroup] Adding user ${userData.email} to group ${groupId} with role ${userData.role}`);
    const res = await axios.post(`/api/groups/${groupId}/add-user`, userData);
    console.log('[addUserToGroup] Success:', res.data);
    return res.data;
  } catch (error) {
    console.error('[addUserToGroup] Error:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('[addUserToGroup] Response data:', error.response.data);
      console.error('[addUserToGroup] Response status:', error.response.status);
      
      // Handle specific error status codes
      let errorMessage = 'Failed to add user to group';
      
      if (error.response.status === 400) {
        errorMessage = error.response.data.message || 'Invalid request. Please check the email and try again.';
      } else if (error.response.status === 403) {
        errorMessage = 'You do not have permission to add users to this group.';
      } else if (error.response.status === 404) {
        errorMessage = error.response.data.message || 'Group or user not found.';
      } else if (error.response.status === 409) {
        errorMessage = 'This user is already a member of the group.';
      }
      
      const serverError = new Error(errorMessage);
      serverError.response = error.response;
      throw serverError;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('[addUserToGroup] No response received:', error.request);
      throw new Error('No response from server. Please check your connection and try again.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('[addUserToGroup] Request setup error:', error.message);
      throw new Error('Failed to process your request. Please try again.');
    }
  }
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