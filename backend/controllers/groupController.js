const Group = require("../models/Group");

// CREATE group
// CREATE new group
exports.createGroup = async (req, res) => {
  const { name } = req.body;

  try {
    // Check if a group with the same name already exists for the current user
    const existingGroup = await Group.findOne({ name, createdBy: req.user._id });
    if (existingGroup) {
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

// ADD user to group
exports.addUserToGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userId, role } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found." });

    const requestingUserId = req.user._id.toString();
    const requestingMember = group.members.find(m => m.userId.toString() === requestingUserId);

    if (!requestingMember || requestingMember.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can perform this action." });
    }

    // Check if user is already in the group
    const existing = group.members.find(m => m.userId.toString() === userId);
    if (existing) {
      return res.status(400).json({ message: "User already in group." });
    }

    group.members.push({ userId, role });
    await group.save();

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

