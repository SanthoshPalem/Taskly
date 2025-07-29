import axios from 'axios';

const API_URL = 'http://localhost:5000/api/groups';

// Get all groups
export const getGroups = async (token) => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get groups for current user
export const getMyGroups = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/my-groups`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Response from /my-groups:", res.data); // ✅ LOG THIS

    if (Array.isArray(res.data)) {
      return res.data;
    } else if (Array.isArray(res.data.groups)) {
      return res.data.groups;
    } else {
      throw new Error("Response does not contain an array");
    }
  } catch (err) {
    console.error("Failed to fetch my-groups:", err.response?.data || err.message);
    return [];
  }
};



// Get a group by ID
export const getGroupById = async (groupId, token) => {
  const res = await axios.get(`${API_URL}/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Create a group
export const createGroup = async (groupData, token) => {
  const res = await axios.post(API_URL, groupData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update a group
export const updateGroup = async (groupId, groupData, token) => {
  const res = await axios.put(`${API_URL}/${groupId}`, groupData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Delete a group
export const deleteGroup = async (groupId, token) => {
  const res = await axios.delete(`${API_URL}/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Add user to group
export const addUserToGroup = async (groupId, userData, token) => {
  const res = await axios.post(`${API_URL}/${groupId}/add-user`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Remove user from group
export const removeUserFromGroup = async (groupId, userId, token) => {
  const res = await axios.delete(`${API_URL}/${groupId}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update user in group
export const updateUserInGroup = async (groupId, userId, userData, token) => {
  const res = await axios.patch(`${API_URL}/${groupId}/users/${userId}`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
