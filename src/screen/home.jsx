import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Button,
  Box,
  Stack,
  Divider,
  Card,
  CardContent,
  Slide,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Skeleton
} from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { useNavigate } from 'react-router-dom';
import { getUser, getAllpolls } from '../service/api';
import io from 'socket.io-client';
import MenuIcon from '@mui/icons-material/Menu';

const socket = io('https://quickpollbackend.onrender.com');

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state

  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const saved = localStorage.getItem("quick_poll_votes");
    return saved ? JSON.parse(saved) : {};
  });

  const handleVote = (pollId, index, isActive) => {
    if (isActive) {
      const updatedVotes = {
        ...selectedOptions,
        [pollId]: index,
      };
      setSelectedOptions(updatedVotes);
      localStorage.setItem("quick_poll_votes", JSON.stringify(updatedVotes));
      socket.emit('vote', { pollId, optionIndex: index });
    } else {
      setSnackbar({ open: true, message: "Poll Expired you can't vote", severity: 'error' });
    }
  };

  const fetchUser = async (id) => {
    try {
      const res = await getUser(id);
      setUser(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAllPolls = async () => {
    try {
      const res = await getAllpolls();
      setPolls(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); // Stop loading after fetch
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("quick_poll_user_id");
    if (userId) {
      fetchUser(userId);
    }
    fetchAllPolls();

    socket.on('pollUpdated', (updatedPoll) => {
      setPolls((prevPolls) =>
        prevPolls.map((poll) =>
          poll._id === updatedPoll._id ? updatedPoll : poll
        )
      );
    });

    return () => {
      socket.off('pollUpdated');
    };
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            QuickPoll
          </Typography>
          {isMobile ? (
            <>
              <IconButton edge="end" color="inherit" onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 250 }}>
                  <List>
                    {user && (
                      <ListItem>
                        <ListItemText
                          primary={`Welcome, ${user.name}`}
                          primaryTypographyProps={{ fontWeight: 'bold' }}
                        />
                      </ListItem>
                    )}
                    {user ? (
                      <>
                        <ListItem button onClick={() => { navigate('/dashboard'); setDrawerOpen(false); }}>
                          <ListItemText primary="Dashboard" />
                        </ListItem>
                        <ListItem button onClick={() => {
                          localStorage.removeItem('quick_poll_user_id');
                          localStorage.removeItem('token');
                          navigate('/login');
                          setDrawerOpen(false);
                        }}>
                          <ListItemText primary="Logout" />
                        </ListItem>
                      </>
                    ) : (
                      <>
                        <ListItem button onClick={() => { navigate('/login'); setDrawerOpen(false); }}>
                          <ListItemText primary="Login" />
                        </ListItem>
                        <ListItem button onClick={() => { navigate('/signup'); setDrawerOpen(false); }}>
                          <ListItemText primary="Sign Up" />
                        </ListItem>
                      </>
                    )}
                  </List>
                </Box>
              </Drawer>
            </>
          ) : (
            <>
              {user && (
                <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 2 }}>
                  Welcome, {user.name}
                </Typography>
              )}
              {user ? (
                <>
                  <Button color="inherit" onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </Button>
                  <Button color="inherit" onClick={() => {
                    localStorage.removeItem('quick_poll_user_id');
                    localStorage.removeItem('token');
                    navigate('/login');
                  }}>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button color="inherit" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button color="inherit" onClick={() => navigate('/signup')}>
                    Sign Up
                  </Button>
                </>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Poll Body */}
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Stack spacing={4}>
          {loading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <Paper key={index} elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Skeleton variant="text" height={30} width="80%" />
                <Skeleton variant="text" height={20} width="60%" />
                <Skeleton variant="text" height={20} width="50%" />
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={40} />
                  ))}
                </Stack>
              </Paper>
            ))
          ) : (
            polls.map((poll) => {
              const selectedOptionIndex = selectedOptions[poll._id];
              return (
                <Paper key={poll._id} elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {poll.question}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created by: {poll.createdBy?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Expires at: {new Date(poll.expiresAt).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Status: {poll.isActive ? 'Live' : 'Expired'}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {selectedOptionIndex === undefined ? (
                    <Stack spacing={2}>
                      {poll.options.map((opt, idx) => (
                        <Button
                          key={opt._id}
                          fullWidth
                          variant="contained"
                          onClick={() => handleVote(poll._id, idx, poll.isActive)}
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          {opt.text}
                        </Button>
                      ))}
                    </Stack>
                  ) : (
                    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
                      <Card elevation={4} sx={{ p: 3, borderRadius: 3 }}>
                        <CardContent>
                          <Typography align="center" variant="h6" gutterBottom>
                            Thank you for voting!
                          </Typography>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <ThumbUpAltIcon sx={{ color: 'primary.main', fontSize: 30 }} />
                            <Typography>You selected:</Typography>
                            <Typography fontWeight="bold" color="primary">
                              {poll.options[selectedOptionIndex].text}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Slide>
                  )}
                </Paper>
              );
            })
          )}
        </Stack>

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

export default Home;
