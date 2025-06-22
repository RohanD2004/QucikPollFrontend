import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Avatar,
  Stack,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { signup } from '../service/api';
import { useNavigate } from 'react-router-dom';

const Sign_up = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false); // <-- loading state
   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    let valid = true;
    const newErrors = { name: '', email: '', password: '' };

    if (form.name.trim().length < 3) {
      newErrors.name = 'Full Name must be at least 3 characters';
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      newErrors.email = 'Invalid email address';
      valid = false;
    }

    if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true); // Start loading
      try {
        const res = await signup(form);
        setSnackbar({ open: true, message: 'Sign Up successful!', severity: 'success' });
        navigate('/login');

      } catch (error) {
        console.error(error);
        setSnackbar({ open: true, message: error, severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 3 }}>
        <Stack spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <PersonAddIcon />
          </Avatar>
          <Typography variant="h5">Sign Up</Typography>
        </Stack>

        <Box component="form" sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Full Name"
            margin="normal"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            fullWidth
            label="Password"
            margin="normal"
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={handleSignup}
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Sign_up;
