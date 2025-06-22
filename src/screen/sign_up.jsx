import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Avatar,
  Stack
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { signup } from '../service/api';

const Sign_up = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' }); // Clear error on change
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
      try {
        const res= await signup(form);
      } catch (error) {
        console.log(error);
      }

      
    }
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

        <Box component="form" onSubmit={handleSignup} sx={{ mt: 3 }}>
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
            sx={{ mt: 3 }}
          >
            Sign Up
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Sign_up;
