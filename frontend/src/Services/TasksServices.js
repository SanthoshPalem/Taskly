import axios from '../utils/axios';

// Get tasks by group
export const getGroupTasks = async (groupId) => {
  const res = await axios.get(`/api/tasks/${groupId}`);
  return res.data;
};

// Create a task
export const createTask = async (taskData) => {
  const res = await axios.post('/api/tasks', taskData);
  return res.data;
};

// Update a task
export const updateTask = async (taskId, taskData) => {
  const res = await axios.patch(`/api/tasks/${taskId}`, taskData);
  return res.data;
};

// Delete a task
export const deleteTask = async (taskId) => {
  const res = await axios.delete(`/api/tasks/${taskId}`);
  return res.data;
};
