import axios from '../utils/axios';

// Get all tasks assigned to the current user across all groups
export const getMyAssignedTasks = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      throw new Error('No authentication token found');
    }

    const res = await axios.get('http://localhost:5000/api/tasks/assigned/me', {
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Assigned tasks response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error in getMyAssignedTasks:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    throw error;
  }
};

// Get tasks by group
export const getGroupTasks = async (groupId) => {
  const res = await axios.get(`/api/tasks/${groupId}`);
  return res.data;
};

// Get tasks by user in a specific group
export const getTasksByUser = async (groupId, userId) => {
  const res = await axios.get(`/api/tasks/${groupId}/user/${userId}`);
  return res.data;
};

// Create a task
export const createTask = async (taskData, token) => {
  console.log('Sending task creation request with data:', {
    ...taskData,
    // Don't log sensitive data
    createdBy: taskData.createdBy ? '[REDACTED]' : undefined,
    assignedTo: taskData.assignedTo ? '[REDACTED]' : undefined
  });
  
  try {
    const res = await axios.post('/api/tasks', taskData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Task created successfully:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error creating task:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Update a task
export const updateTask = async (taskId, taskData) => {
  try {
    console.log('Updating task:', { taskId, taskData });
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const res = await axios.patch(`/api/tasks/${taskId}`, taskData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Task updated successfully:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error updating task:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const res = await axios.delete(`/api/tasks/${taskId}`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return res.data;
};
