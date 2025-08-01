
const Group = require('../models/Group');
const User = require('../models/User'); // ✅ This line is important


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

  try {
    await Group.findByIdAndDelete(groupId);
    res.json({ message: "Group deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
  const { email, role } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ status: 404, message: "Group not found." });
    }

    const requestingUserId = req.user._id.toString();
    const requestingMember = group.members.find(m => m.userId.toString() === requestingUserId);

    if (!requestingMember || requestingMember.role !== 'admin') {
      return res.status(403).json({ status: 403, message: "Only admins can perform this action." });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ status: 404, message: "User not found." });
    }

    const userId = userToAdd._id;
    const existingMember = group.members.find(m => m.userId.toString() === userId.toString());
    if (existingMember) {
      return res.status(400).json({ status: 400, message: "User already in group." });
    }

    group.members.push({ userId, role: role || 'member' });
    await group.save();

    const populatedGroup = await Group.findById(groupId)
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email');

    return res.status(200).json({
      status: 200,
      message: "User added successfully.",
      group: populatedGroup
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: err.message
    });
  }
};



// REMOVE user from group
exports.removeUserFromGroup = async (req, res) => {
  const { groupId, userId } = req.params;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found." });

    const requestingUserId = req.user._id.toString();
    const requestingMember = group.members.find(m => m.userId.toString() === requestingUserId);

    if (!requestingMember || requestingMember.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can perform this action." });
    }

    group.members = group.members.filter(member => member.userId.toString() !== userId);
    await group.save();

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
