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
  getMyGroups
} = require("../controllers/groupController");

const { protect } = require("../middleware/authMiddleware");

// Group routes
router.post("/", protect, createGroup);
router.get("/", protect, getGroups);
router.get("/my-groups", protect, getMyGroups);
router.get("/:groupId", protect, getGroupById);
router.put("/:groupId", protect, updateGroup);
router.delete("/:groupId", protect, deleteGroup);

// Member routes
router.post('/:groupId/add-user', protect, addUserToGroup);
router.delete("/:groupId/users/:userId", protect, removeUserFromGroup);
router.patch("/:groupId/users/:userId", protect, updateUserInGroup);

module.exports = router;
