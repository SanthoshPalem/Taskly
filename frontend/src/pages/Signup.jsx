import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../Services/AuthServices';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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
      alert('Please fill in all the fields.');
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
      alert(error.response?.data?.message || 'Signup failed.');
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
              Upload Profile Picture
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

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

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
