import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../Services/AuthServices';

const Login = () => {
  const { login } = useAuth(); // ✅ hook inside component
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false); // since `loading` is not in context
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      setErrorMsg('');
      setLoading(true);

      // Basic validation
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      try {
        const { user, token } = await loginUser(email, password);

        if (!user || !token) {
          throw new Error('Invalid response from server');
        }

        // Merge token into user object
        const userWithToken = { ...user, token };

        // Save user object to localStorage
        localStorage.setItem('user', JSON.stringify(userWithToken));

        // Update auth context
        login(userWithToken);
        
        // Clear any previous errors
        setErrorMsg('');
        
        // Redirect to dashboard on successful login
        navigate('/');
      } catch (error) {
        // Handle specific error messages from AuthService
        if (error.message.includes('Invalid email or password')) {
          setErrorMsg('The email or password you entered is incorrect. Please try again.');
        } else if (error.message.includes('No response from server')) {
          setErrorMsg('Unable to connect to the server. Please check your internet connection.');
        } else {
          // Generic error message for other cases
          setErrorMsg(error.message || 'An error occurred during login. Please try again.');
        }
        console.error('Login error:', error);
      }
    } catch (error) {
      setErrorMsg(error.message || 'An unexpected error occurred');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>

        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Box display="flex" flexDirection="column" gap={2} mt={2}>
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
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
          {/* 🔗 Sign up link */}
        <Typography variant="body2" align="center" mt={2}>
          Don&apos;t have an account?{' '}
          <span
            style={{ color: '#1976d2', cursor: 'pointer' }}
            onClick={() => navigate('/signup')}
          >
            Sign up
          </span>
        </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
