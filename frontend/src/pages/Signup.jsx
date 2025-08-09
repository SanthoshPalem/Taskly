import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Avatar,
  Alert,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../Services/AuthServices';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Password requirements
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  // Check password against requirements
  const validatePassword = (password) => {
    const newRequirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+/.test(password),
    };
    setRequirements(newRequirements);
    return Object.values(newRequirements).every(Boolean);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  // Preview cleanup when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all the fields.');
      setShowError(true);
      return;
    }

    // Validate password before submission
    if (!validatePassword(password)) {
      setError('Please ensure your password meets all requirements.');
      setShowError(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      if (profilePic) {
        formData.append('profilePic', profilePic);
      }

      const response = await registerUser(formData);

      // Example response shape: { user: {...}, token: '...' }
      login(response.user); // Store in context
      navigate('/'); // Redirect after successful signup
    } catch (error) {
      console.error('Signup Error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      setShowError(true);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, mt: 8, borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create Account
        </Typography>

        <Box display="flex" flexDirection="column" gap={3} mt={2}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={preview}
              alt="Profile"
              sx={{ width: 100, height: 100, mb: 1 }}
            />
            <Button
              variant="outlined"
              component="label"
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#f0f0f0' },
              }}
            >
              {preview ? 'Change Profile Picture' : 'Upload Profile Picture'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleProfileChange}
              />
            </Button>
          </Box>

          <TextField
            label="Full Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Box width="100%">
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Collapse in={passwordFocused || password.length > 0}>
              <Box mt={1}>
                <Typography variant="caption" color="textSecondary">
                  Password must contain:
                </Typography>
                <List dense disablePadding>
                  {[/* eslint-disable */
                    { key: 'length', text: 'At least 8 characters' },
                    { key: 'uppercase', text: 'At least one uppercase letter' },
                    { key: 'lowercase', text: 'At least one lowercase letter' },
                    { key: 'number', text: 'At least one number' },
                    { key: 'specialChar', text: 'At least one special character' },
                  ].map((req) => (
                    <ListItem key={req.key} dense disableGutters>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        {requirements[req.key] ? (
                          <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                          <ErrorIcon color="error" fontSize="small" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={req.text}
                        primaryTypographyProps={{
                          variant: 'caption',
                          color: requirements[req.key] ? 'textSecondary' : 'error',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Collapse>
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
            onClick={handleSignup}
          >
            Sign Up
          </Button>

          {/* 🔗 Login Link */}
        <Typography variant="body2" align="center" mt={1}>
          Already have an account?{' '}
          <span
            style={{ color: '#1976d2', cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Signup;
