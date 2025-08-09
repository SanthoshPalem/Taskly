const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Password validation function
const passwordValidator = function(value) {
  const MIN_LENGTH = 8;
  const errors = [];
  
  // Check minimum length
  if (value.length < MIN_LENGTH) {
    errors.push(`be at least ${MIN_LENGTH} characters long`);
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+/.test(value)) {
    errors.push('contain at least one special character');
  }
  
  // Check for at least one number
  if (!/[0-9]/.test(value)) {
    errors.push('contain at least one number');
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(value)) {
    errors.push('contain at least one uppercase letter');
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(value)) {
    errors.push('contain at least one lowercase letter');
  }
  
  // Check for common patterns and weak passwords
  const weakPasswords = ['password', '123456', 'qwerty', 'letmein'];
  if (weakPasswords.some(weak => value.toLowerCase().includes(weak))) {
    errors.push('avoid common weak passwords');
  }
  
  // Only check for name in password if this is an update to an existing user
  if (this.isModified('password') && this.name) {
    const name = this.name.trim();
    // Only check if name is meaningful (more than 3 characters)
    if (name.length > 3) {
      // Split name into parts and check each part
      const nameParts = name.toLowerCase().split(/\s+/);
      const passwordLower = value.toLowerCase();
      
      // Only check name parts that are at least 4 characters long
      const significantNameParts = nameParts.filter(part => part.length >= 4);
      
      if (significantNameParts.some(part => passwordLower.includes(part))) {
        errors.push('not contain your name or parts of your name');
      }
    }
  }
  
  // If there are any validation errors, throw them
  if (errors.length > 0) {
    const errorMessage = `Password must: ${errors.join(', ')}`;
    throw new Error(errorMessage);
  }
  
  return true;
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: passwordValidator,
      message: props => props.message || 'Invalid password format'
    },
    select: false // Don't return password in query results
  },
  profilePic: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'Hey there! I am using Task Manager'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
