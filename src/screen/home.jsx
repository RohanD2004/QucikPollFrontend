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
  useMediaQuery
} from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { useNavigate } from 'react-router-dom';
import { getUser, getAllpolls } from '../service/api'; // Make sure this is correctly defined
import io from 'socket.io-client';
import MenuIcon from '@mui/icons-material/Menu';
const socket = io('https://quickpollbackend.onrender.com');
const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [polls, setPolls] = useState([]);

  const [poll] = useState({
    _id: "sample123",
    question: "Which frontend framework do you prefer?",
    options: [
      { text: "React" },
      { text: "Vue" },
      { text: "Angular" },
      { text: "Svelte" }
    ]
  });

  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const saved = localStorage.getItem("quick_poll_votes");
    return saved ? JSON.parse(saved) : {};
  });


  const handleVote = (pollId, index) => {
    const updatedVotes = {
      ...selectedOptions,
      [pollId]: index,
    };

    setSelectedOptions(updatedVotes);
    localStorage.setItem("quick_poll_votes", JSON.stringify(updatedVotes));
    // emit vote via socket

    socket.emit('vote', { pollId, optionIndex: index });
  };



  const fetchUser = async (id) => {
    try {
      const res = await getUser(id);
      setUser(res.data.data); // assumes res.data contains user object
      fetchAllPolls();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAllPolls = async () => {
    try {
      const res = await getAllpolls();
      setPolls(res.data.data);

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const userId = localStorage.getItem("quick_poll_user_id");
    if (userId) {
      fetchUser(userId);

    }

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

  return (
    <>
      {/* Navbar */}
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            QuickPoll
          </Typography>

          {isMobile ? (
            <>
              <IconButton
                edge="end"
                color="inherit"
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
              >
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
                        <ListItem
                          button
                          onClick={() => {
                            navigate('/dashboard');
                            setDrawerOpen(false);
                          }}
                        >
                          <ListItemText primary="Dashboard" />
                        </ListItem>
                        <ListItem
                          button
                          onClick={() => {
                            localStorage.removeItem('quick_poll_user_id');
                            localStorage.removeItem('token');
                            navigate('/login');
                            setDrawerOpen(false);
                          }}
                        >
                          <ListItemText primary="Logout" />
                        </ListItem>
                      </>
                    ) : (
                      <>
                        <ListItem
                          button
                          onClick={() => {
                            navigate('/login');
                            setDrawerOpen(false);
                          }}
                        >
                          <ListItemText primary="Login" />
                        </ListItem>
                        <ListItem
                          button
                          onClick={() => {
                            navigate('/signup');
                            setDrawerOpen(false);
                          }}
                        >
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
                  <Button
                    color="inherit"
                    onClick={() => {
                      localStorage.removeItem('quick_poll_user_id');
                      localStorage.removeItem('token');
                      navigate('/login');
                    }}
                  >
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
          {polls.map((poll) => {
            const selectedOptionIndex = selectedOptions[poll._id];

            return (
              <Paper key={poll._id} elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {poll.question}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created by: {poll.createdBy?.name}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {selectedOptionIndex === undefined ? (
                  <Stack spacing={2}>
                    {poll.options.map((opt, idx) => (
                      <Button
                        key={opt._id}
                        fullWidth
                        variant="contained"
                        onClick={() => handleVote(poll._id, idx)}
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
          })}

        </Stack>
      </Container>

    </>
  );
};

export default Home;
