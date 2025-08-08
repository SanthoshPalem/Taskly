const Task = require('../models/Task');
const Group = require('../models/Group');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create a task and assign to individual in a group
exports.createTask = async (req, res) => {
  console.log('Received task creation request:', {
    body: req.body,
    user: req.user ? { _id: req.user._id } : 'No user in request'
  });

  const {
    groupId,
    assignedTo,
    title,
    description,
    dueDate,
    priority = 'medium',
    difficulty = 'easy',
    status = 'not started'
  } = req.body;

  // Input validation
  if (!groupId) {
    console.error('Missing groupId in request');
    return res.status(400).json({ message: "Group ID is required" });
  }

  if (!assignedTo) {
    console.error('Missing assignedTo in request');
    return res.status(400).json({ message: "Assigned user is required" });
  }

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const createdBy = req.user?._id;
  if (!createdBy) {
    console.error('No user ID in request');
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    console.log(`Looking up group: ${groupId}`);
    const group = await Group.findById(groupId);
    
    if (!group) {
      console.error(`Group not found with ID: ${groupId}`);
      return res.status(404).json({ 
        message: "Group not found",
        groupId,
        availableGroups: await Group.find({}).select('_id name').lean()
      });
    }

    console.log('Group found:', {
      id: group._id,
      name: group.name,
      memberCount: group.members?.length || 0
    });

    const isMember = group.members.some(member => 
      member.userId && member.userId.toString() === assignedTo
    );

    if (!isMember) {
      console.error(`User ${assignedTo} is not a member of group ${groupId}`);
      console.log('Group members:', group.members);
      return res.status(403).json({ 
        message: "User is not a member of the group",
        groupId,
        assignedTo,
        groupMembers: group.members.map(m => ({
          userId: m.userId?.toString(),
          role: m.role
        }))
      });
    }

    // Check if user already has a task in this group
    const existingTask = await Task.findOne({
      groupId: groupId,
      assignedTo: assignedTo,
      status: { $ne: 'completed' } // Only check for non-completed tasks
    });

    if (existingTask) {
      console.error(`User ${assignedTo} already has an active task in group ${groupId}`);
      return res.status(400).json({
        message: "User already has an active task in this group",
        existingTaskId: existingTask._id
      });
    }

    const taskData = {
      groupId,
      assignedTo,
      createdBy,
      title,
      description,
      dueDate,
      priority,
      difficulty,
      status
    };

    console.log('Creating task with data:', taskData);
    const task = await Task.create(taskData);
    console.log('Task created successfully:', task._id);

    res.status(201).json(task);
  } catch (err) {
    console.error('Error in createTask:', {
      error: err.message,
      stack: err.stack,
      body: req.body,
      user: req.user?._id
    });
    
    // More specific error handling
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error",
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        message: "Invalid ID format",
        path: err.path,
        value: err.value
      });
    }

    res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  }
};

// Get all tasks in a group
exports.getGroupTasks = async (req, res) => {
  const { groupId } = req.params;

  try {
    const tasks = await Task.find({ groupId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id;
  const updates = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isAdmin = task.createdBy.toString() === userId.toString();
    const isAssignedUser = task.assignedTo.toString() === userId.toString();

    if (isAdmin) {
      // Admin can update any field
      Object.assign(task, updates);
    } else if (isAssignedUser) {
      // Assigned user can only update status
      if ('status' in updates && Object.keys(updates).length === 1) {
        task.status = updates.status;
      } else {
        return res.status(403).json({
          message: "You are only allowed to update the status of this task"
        });
      }
    } else {
      return res.status(403).json({ message: "You are not authorized to update this task" });
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get tasks for a specific user in a group
exports.getTasksByUserInGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    
    // Verify the requesting user is part of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    const isMember = group.members.some(member => 
      member.userId.toString() === req.user._id.toString() || 
      member.userId.toString() === userId
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to view these tasks' });
    }

    const tasks = await Task.find({ 
      groupId,
      assignedTo: userId 
    }).sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    console.error('Error in getTasksByUserInGroup:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all tasks assigned to the current user across all their groups
exports.getMyAssignedTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all groups where the user is a member
    const groups = await Group.find({
      'members.userId': userId
    });
    
    if (!groups || groups.length === 0) {
      return res.status(200).json([]);
    }
    
    // Get all group IDs where the user is a member
    const groupIds = groups.map(group => group._id);
    
    // Find all tasks assigned to the user in these groups
    const tasks = await Task.find({
      groupId: { $in: groupIds },
      assignedTo: userId
    })
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('groupId', 'name')
    .sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (err) {
    console.error('Error in getMyAssignedTasks:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Only the creator of the task or group admin can delete
    if (task.createdBy.toString() !== req.user._id.toString()) {
      const group = await Group.findOne({ _id: task.groupId, 'members.userId': req.user._id, 'members.role': 'admin' });
      if (!group) {
        return res.status(403).json({ message: 'Not authorized to delete this task' });
      }
    }

    // Use deleteOne() instead of the deprecated remove() method
    await Task.deleteOne({ _id: task._id });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
