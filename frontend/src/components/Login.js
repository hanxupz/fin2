import React, { useState } from 'react';
import apiService from '../services/api';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Box,
  Alert,
  Link
} from '@mui/material';
import { surfaceBoxSx } from '../theme/primitives';
import AnimatedBackground from './AnimatedBackground';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await apiService.register(username, password);
        setError('Registration successful. Please login.');
        setIsRegistering(false);
      } else {
        const data = await apiService.login(username, password);
        onLogin(data.access_token);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <AnimatedBackground />
      <Paper elevation={6} sx={(t) => ({
        ...surfaceBoxSx(t),
        p: { xs: 4, sm: 6 },
        maxWidth: 440,
        width: '100%',
        borderRadius: 4,
        backdropFilter: 'blur(10px)',
      })}>
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isRegistering ? 'Sign up to start managing your finances' : 'Sign in to continue'}
            </Typography>
          </Box>

            {error && (
              <Alert severity={error.includes('successful') ? 'success' : 'error'} variant="outlined">
                {error}
              </Alert>
            )}

          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
            autoComplete="username"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
          </Button>
          <Typography variant="body2" textAlign="center">
            {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            <Link component="button" type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); }}>
              {isRegistering ? 'Sign In' : 'Sign Up'}
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;