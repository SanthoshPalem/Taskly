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
} from '@mui/material';
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

  const handleLogin = async () => {
  try {
    setErrorMsg('');
    setLoading(true);

    const { user, token } = await loginUser(email, password);

    // 🔥 Merge token into user object
    const userWithToken = { ...user, token };

    // ✅ Save single object to localStorage
    localStorage.setItem('user', JSON.stringify(userWithToken));

    // ✅ Set it in context
    login(userWithToken);

    setLoading(false);
    navigate('/'); // Redirect to dashboard
  } catch (err) {
    setLoading(false);
    setErrorMsg(err.response?.data?.message || 'Login failed');
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
