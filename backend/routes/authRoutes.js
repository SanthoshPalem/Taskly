const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getCurrentUser, 
  changePassword 
} = require('../controllers/authController');
const authMiddleware = require('../middleware/verifyToken');
const upload = require('../middleware/upload');

// Public routes
router.post('/register', upload.single('profilePic'), register);
router.post('/login', login);

// Protected routes (require authentication)
router.use(authMiddleware);
router.get('/me', getCurrentUser);
router.patch('/change-password', changePassword);

module.exports = router;
