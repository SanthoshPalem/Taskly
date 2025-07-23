const Task = require('../models/Task');
const Group = require('../models/Group');

// Create a task and assign to individual in a group
exports.createTask = async (req, res) => {
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

  const createdBy = req.user._id;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some(member => member.userId.toString() === assignedTo);
    if (!isMember) return res.status(403).json({ message: "User is not a member of the group" });

    const task = await Task.create({
      groupId,
      assignedTo,
      createdBy,
      title,
      description,
      dueDate,
      priority,
      difficulty,
      status
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// Delete a task
exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isAdmin = task.createdBy.toString() === userId.toString();
    if (!isAdmin) {
      return res.status(403).json({ message: "Only the task creator can delete this task" });
    }

    await Task.findByIdAndDelete(taskId);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
