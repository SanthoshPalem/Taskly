const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/verifyToken');
const upload = require('../middleware/upload');

// Accept file in registration (like profilePic)
router.post('/register', upload.single('profilePic'), register);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
