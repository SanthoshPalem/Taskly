const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createTask,
  getGroupTasks,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

router.post('/', protect, createTask);                      // Create task
router.get('/:groupId', protect, getGroupTasks);            // Get tasks by group
router.patch('/:taskId', protect, updateTask);              // Update task
router.delete('/:taskId', protect, deleteTask);             // Delete task

module.exports = router;
