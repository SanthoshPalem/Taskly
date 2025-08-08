const mongoose = require('mongoose');
const Group = require('../models/Group');
const User = require('../models/User');
const Task = require('../models/Task');


// CREATE group
// CREATE new group
exports.createGroup = async (req, res) => {
  const { name } = req.body;

  try {
    console.log('Creating group:', name);
    console.log('Current user ID:', req.user._id);
    console.log('Current user:', req.user.name, req.user.email);
    
    // Check if a group with the same name already exists for the current user
    const existingGroup = await Group.findOne({ name, createdBy: req.user._id });
    console.log('Existing group found:', existingGroup);
    
    if (existingGroup) {
      console.log('Duplicate group detected for user:', req.user._id);
      return res.status(400).json({ message: "Group with the same name already exists." });
    }

    // Create new group with creator as admin by default
    const newGroup = new Group({
      name,
      createdBy: req.user._id,
      members: [{ userId: req.user._id, role: 'admin' }]
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET groups created by user
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ createdBy: req.user._id }).populate("members.userId", "name email");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET group by ID
// exports.getGroupById = async (req, res) => {
//   try {
//     const group = await Group.findById(req.params.groupId).populate('members.userId', 'name email');
//     if (!group) return res.status(404).json({ message: 'Group not found' });
//     res.json(group);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// UPDATE group name
exports.updateGroup = async (req, res) => {
  const { groupId } = req.params;
  const { name } = req.body;

  try {
    const group = await Group.findByIdAndUpdate(groupId, { name }, { new: true });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE group
exports.deleteGroup = async (req, res) => {
  const { groupId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // First, delete all tasks associated with the group
    await Task.deleteMany({ groupId }).session(session);
    
    // Then delete the group
    await Group.findByIdAndDelete(groupId).session(session);
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    res.json({ message: "Group and all associated tasks deleted successfully" });
  } catch (err) {
    // If anything fails, abort the transaction
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error deleting group and tasks:', err);
    res.status(500).json({ 
      error: err.message,
      message: 'Failed to delete group and associated tasks' 
    });
  }
};

exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    // Groups created by the user
    const createdGroups = await Group.find({ createdBy: userId })
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email');

    // Groups where the user is a member but not the creator
    const memberGroups = await Group.find({
      members: { $elemMatch: { userId: userId } },
      createdBy: { $ne: userId }
    })
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email');

    res.json({
      createdGroups,
      memberGroups,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD user to group
exports.addUserToGroup = async (req, res) => {
  const { groupId } = req.params;
  const { email, role = 'member' } = req.body;

  console.log(`[addUserToGroup] Attempting to add user ${email} to group ${groupId} with role ${role}`);

  // Input validation
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    console.error('[addUserToGroup] Invalid email format:', email);
    return res.status(400).json({ 
      status: 400, 
      message: 'Please provide a valid email address.' 
    });
  }

  if (!['member', 'admin'].includes(role)) {
    console.error('[addUserToGroup] Invalid role:', role);
    return res.status(400).json({ 
      status: 400, 
      message: 'Invalid role. Must be either "member" or "admin".' 
    });
  }

  try {
    // Find the group and ensure it exists
    const group = await Group.findById(groupId);
    if (!group) {
      console.error(`[addUserToGroup] Group not found: ${groupId}`);
      return res.status(404).json({ 
        status: 404, 
        message: 'Group not found.' 
      });
    }

    // Verify requesting user is an admin of the group
    const requestingUserId = req.user._id.toString();
    const requestingMember = group.members.find(m => 
      m.userId && m.userId.toString() === requestingUserId
    );

    if (!requestingMember || requestingMember.role !== 'admin') {
      console.error(`[addUserToGroup] Unauthorized access attempt by user ${requestingUserId}`);
      return res.status(403).json({ 
        status: 403, 
        message: 'Only group admins can add members.' 
      });
    }

    // Find the user to add
    const userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
    if (!userToAdd) {
      console.error(`[addUserToGroup] User not found with email: ${email}`);
      return res.status(404).json({ 
        status: 404, 
        message: 'No user found with that email address.' 
      });
    }

    const userId = userToAdd._id;
    
    // Check if user is already in the group
    const existingMember = group.members.find(m => 
      m.userId && m.userId.toString() === userId.toString()
    );

    if (existingMember) {
      console.error(`[addUserToGroup] User ${userId} already in group ${groupId}`);
      return res.status(409).json({ 
        status: 409, 
        message: 'This user is already a member of the group.' 
      });
    }

    // Add user to group
    group.members.push({ 
      userId, 
      role: role.toLowerCase(),
      addedAt: new Date()
    });

    await group.save();
    console.log(`[addUserToGroup] Successfully added user ${userId} to group ${groupId}`);

    // Get updated group with populated data
    const populatedGroup = await Group.findById(groupId)
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email profilePic');

    return res.status(200).json({
      status: 200,
      message: 'User added successfully!',
      group: populatedGroup
    });

  } catch (err) {
    console.error('[addUserToGroup] Error:', err);
    return res.status(500).json({
      status: 500,
      message: 'Failed to add user to group. Please try again.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};



// REMOVE user from group
exports.removeUserFromGroup = async (req, res) => {
  const { groupId, userId } = req.params;
  
  console.log(`[removeUserFromGroup] Attempting to remove user ${userId} from group ${groupId}`);

  try {
    // Input validation
    if (!groupId || !userId) {
      console.error('[removeUserFromGroup] Missing required parameters');
      return res.status(400).json({ 
        status: 400, 
        message: 'Missing required parameters: groupId and userId are required' 
      });
    }

    // Find the group and ensure it exists
    const group = await Group.findById(groupId)
      .populate('members.userId', 'name email');
      
    if (!group) {
      console.error(`[removeUserFromGroup] Group not found: ${groupId}`);
      return res.status(404).json({ 
        status: 404, 
        message: 'Group not found.' 
      });
    }

    // Verify requesting user is an admin of the group
    const requestingUserId = req.user._id.toString();
    const requestingMember = group.members.find(m => 
      m.userId && m.userId._id.toString() === requestingUserId
    );

    if (!requestingMember || requestingMember.role !== 'admin') {
      console.error(`[removeUserFromGroup] Unauthorized access attempt by user ${requestingUserId}`);
      return res.status(403).json({ 
        status: 403, 
        message: 'Only group admins can remove members.' 
      });
    }

    // Check if the target user is actually in the group
    const initialMemberCount = group.members.length;
    group.members = group.members.filter(member => 
      member.userId && member.userId._id.toString() !== userId
    );

    if (group.members.length === initialMemberCount) {
      console.error(`[removeUserFromGroup] User ${userId} not found in group ${groupId}`);
      return res.status(404).json({ 
        status: 404, 
        message: 'User not found in this group.' 
      });
    }

    await group.save();
    console.log(`[removeUserFromGroup] Successfully removed user ${userId} from group ${groupId}`);

    // Get updated group with populated data
    const updatedGroup = await Group.findById(groupId)
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email profilePic');

    res.status(200).json({
      status: 200,
      message: 'User removed from group successfully',
      group: updatedGroup
    });
  } catch (err) {
    console.error('[removeUserFromGroup] Error:', err);
    res.status(500).json({ 
      status: 500, 
      message: 'Failed to remove user from group.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// UPDATE user inside group
exports.updateUserInGroup = async (req, res) => {
  const { groupId, userId } = req.params;
  const { role, status } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found." });

    const requestingUserId = req.user._id.toString();
    const requestingMember = group.members.find(m => m.userId.toString() === requestingUserId);

    if (!requestingMember || requestingMember.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can perform this action." });
    }

    const member = group.members.find(m => m.userId.toString() === userId);
    if (member) {
      if (role) member.role = role;
      if (status) member.status = status;
    } else {
      return res.status(404).json({ message: "User not in group." });
    }

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//retriev user from the group
 // Adjust the path if needed

// GET /api/groups/:groupId/members
exports.getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('members.userId', 'name email');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Only return the populated members array
    res.status(200).json({ members: group.members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
