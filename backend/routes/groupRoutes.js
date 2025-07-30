const express = require("express");
const router = express.Router();
const {
  createGroup,
  getGroups,
  updateGroup,
  deleteGroup,
  addUserToGroup,
  removeUserFromGroup,
  updateUserInGroup,
  getGroupById,
  getMyGroups,
  getGroupMembers
} = require("../controllers/groupController");

const { protect } = require("../middleware/authMiddleware");

// Group routes
router.post("/create-groups", protect, createGroup);
router.get("/allgroups", protect, getGroups);
router.get("/my-groups", protect, getMyGroups);
// router.get("/:groupId", protect, getGroupById);
router.put("/:groupId", protect, updateGroup);
router.delete("/:groupId", protect, deleteGroup);

// Member routes
router.get('/:groupId/group-members', protect, getGroupMembers);

router.post('/:groupId/add-user', protect, addUserToGroup);
router.delete("/:groupId/users/:userId", protect, removeUserFromGroup);
router.patch("/:groupId/users/:userId", protect, updateUserInGroup);

module.exports = router;
