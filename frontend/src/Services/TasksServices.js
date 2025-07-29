import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks';

// Get tasks by group
export const getGroupTasks = async (groupId, token) => {
  const res = await axios.get(`${API_URL}/${groupId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Create a task
export const createTask = async (taskData, token) => {
  const res = await axios.post(API_URL, taskData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update a task
export const updateTask = async (taskId, taskData, token) => {
  const res = await axios.patch(`${API_URL}/${taskId}`, taskData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Delete a task
export const deleteTask = async (taskId, token) => {
  const res = await axios.delete(`${API_URL}/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
