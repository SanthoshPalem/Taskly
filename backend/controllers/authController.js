const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Password validation function for auth controller
const validatePassword = (password, name = '') => {
  // Check for at least one special character
  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+/;
  // Check for at least one number
  const numberRegex = /[0-9]/;
  
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  
  // Check if password contains the user's name (case insensitive)
  if (name && password.toLowerCase().includes(name.toLowerCase())) {
    throw new Error('Password cannot contain your name');
  }
  
  if (!specialCharRegex.test(password)) {
    throw new Error('Password must contain at least one special character');
  }
  
  if (!numberRegex.test(password)) {
    throw new Error('Password must contain at least one number');
  }
  
  return true;
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    // Validate password before hashing
    validatePassword(password, name);
    
    const hashedPassword = await bcrypt.hash(password, 10);

    // If profilePic is uploaded using multer
    const profilePic = req.file ? req.file.filename : null;

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profilePic, // saved filename only
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePic: newUser.profilePic,
        status: newUser.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



const login = async (req, res) => {
  console.log('Login attempt with data:', { email: req.body.email });
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing credentials:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('Looking up user with email:', email);
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('User found, comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      throw new Error('Server configuration error');
    }

    console.log('Generating JWT token for user:', user._id);
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      status: user.status
    };

    console.log('Login successful for user:', user._id);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Login error:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      ...(err.code && { code: err.code }),
      ...(err.keyPattern && { keyPattern: err.keyPattern }),
      ...(err.keyValue && { keyValue: err.keyValue })
    });
    
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Validate new password
    validatePassword(newPassword, user.name);

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ 
      message: err.message.includes('Password') ? err.message : 'Error updating password',
      error: err.message 
    });
  }
};

module.exports = { 
  register, 
  login, 
  getCurrentUser, 
  changePassword 
};
