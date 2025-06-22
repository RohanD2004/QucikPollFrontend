import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Stack,
  Divider,
  Card,
  CardContent,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { addPoll, getpolls } from '../service/api';
import { useEffect } from 'react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [polls, setPolls] = useState([]);

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [expireDateTime, setExpireDateTime] = useState('');
  const [errors, setErrors] = useState({});

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!question.trim()) {
      newErrors.question = 'Question is required.';
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      newErrors.options = 'At least 2 options are required.';
    }

    if (!expireDateTime) {
      newErrors.expireDateTime = 'Expiry date/time is required.';
    } else if (new Date(expireDateTime) <= new Date()) {
      newErrors.expireDateTime = 'Expiry must be a future date/time.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreatePoll = async () => {
    if (validateForm()) {

      try {
        const newPoll = {

          createdBy: localStorage.getItem('quick_poll_user_id') || 'anonymous',
          expiresAt: expireDateTime,
          question,
          options: options
            .filter(opt => opt.trim() !== '')
            .map(opt => ({ text: opt, votes: 0 }))
        };

        const res = await addPoll(newPoll);
        if (res.status == 201) {
          setSnackbar({ open: true, message: res.data.message, severity: 'success' });
          setQuestion('');
          setOptions(['', '', '', '']);
          setExpireDateTime('');
          setErrors({});
        } else if (res.status == 400) {
          setSnackbar({ open: true, message: res.data.message, severity: 'success' });

        }

      } catch (error) {
        setSnackbar({ open: true, message: error, severity: 'success' });
      }

    };





  };
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  async function getAllPolls() {
    try {

      const res = await getpolls(localStorage.getItem('quick_poll_user_id'));
      if (res.status == 200) {
        setPolls([...res.data.data]);
      }

    } catch (error) {
      setSnackbar({ open: true, message: error, severity: 'success' });
    }
  }
  useEffect(() => {
    (async () => {
      await getAllPolls();
    })();


  }, [])

  useEffect(() => {
}, [polls]);

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            QuickPoll Dashboard
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>
            Home
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 5 }}>
          <Typography variant="h6" gutterBottom>Create a New Poll</Typography>

          <TextField
            fullWidth
            label="Poll Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            sx={{ mb: 2 }}
            error={!!errors.question}
            helperText={errors.question}
          />

          {options.map((opt, idx) => (
            <TextField
              key={idx}
              fullWidth
              label={`Option ${idx + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              sx={{ mb: 1 }}
            />
          ))}

          {errors.options && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errors.options}
            </Typography>
          )}

          <TextField
            label="Expiry Date & Time"
            type="datetime-local"
            fullWidth
            value={expireDateTime}
            onChange={(e) => setExpireDateTime(e.target.value)}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
            error={!!errors.expireDateTime}
            helperText={errors.expireDateTime}
          />

          <Button variant="contained" sx={{ mt: 3 }} onClick={handleCreatePoll}>
            Create Poll
          </Button>
        </Paper>

        {/* Display Polls */}
        <Typography variant="h5" sx={{ mb: 2 }}>Past Polls</Typography>
        <Stack spacing={3}>
          {polls.map((poll) => (
            <Card key={poll._id} elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{poll.question}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Expires at: {new Date(poll.expiresAt).toLocaleString()}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  {poll.options.map((opt, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        backgroundColor: '#f1f1f1',
                        borderRadius: 2,
                        px: 2,
                        py: 1
                      }}
                    >
                      <Typography>{opt.text}</Typography>
                      <Typography fontWeight="bold">{opt.votes} votes</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
        {/* Snackbar for feedback */}
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
    </>
  );
};

export default Dashboard;
