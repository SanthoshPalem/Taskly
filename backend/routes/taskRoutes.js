const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createTask,
  getGroupTasks,
  updateTask,
  deleteTask,
  getTasksByUserInGroup,
  getMyAssignedTasks
} = require('../controllers/taskController');

router.get('/assigned/me', protect, getMyAssignedTasks);    // Get all tasks assigned to current user
router.post('/', protect, createTask);                      // Create task
router.get('/:groupId', protect, getGroupTasks);            // Get tasks by group
router.get('/:groupId/user/:userId', protect, getTasksByUserInGroup); // Get tasks by user in group
router.patch('/:taskId', protect, updateTask);              // Update task
router.delete('/:taskId', protect, deleteTask);             // Delete task

module.exports = router;
