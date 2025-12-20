import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  InputBase,
  alpha,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Gavel,
  Add,
  Person,
  List,
  Logout,
  Notifications,
  Favorite,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/api';
import notificationService from '../../services/notificationService';
import { webSocketService } from '../../services/webSocketService';

const ModernNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnreadCount = async () => {
        try {
          const count = await notificationService.getUnreadCount();
          setUnreadCount(count);
        } catch (error) {
          console.error("Failed to fetch unread count:", error);
        }
      };
      fetchUnreadCount();

      // Subscribe to real-time notifications
      if (user?.username) {
        webSocketService.subscribeToNotifications(user.username, (_notification) => {
          setUnreadCount(prev => prev + 1);
        });
      }

      // Initializing a simple pollar as a fallback
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.username]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/auctions?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: 'background.paper',
        boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      }}
    >
      <Toolbar sx={{ minHeight: 72, px: { xs: 2, sm: 3 } }}>
        {/* Logo */}
        <Box
          display="flex"
          alignItems="center"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <Gavel sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 800,
              background: `linear-gradient(45deg, ${'#00796b'}, ${'#009688'})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            AuctionHub
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            position: 'relative',
            borderRadius: 50,
            backgroundColor: alpha('#00796b', 0.05),
            '&:hover': {
              backgroundColor: alpha('#00796b', 0.1),
            },
            marginLeft: 4,
            marginRight: 4,
            width: '100%',
            maxWidth: 450,
          }}
        >
          <Box
            sx={{
              padding: '0 16px',
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SearchIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          </Box>
          <InputBase
            placeholder="Search auctions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              color: 'text.primary',
              padding: '12px 16px 12px 52px',
              width: '100%',
              fontSize: '0.95rem',
              fontWeight: 500,
              '& input::placeholder': {
                color: 'text.secondary',
                opacity: 0.8,
                fontWeight: 400,
              },
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/auctions')}
            sx={{
              color: isActive('/auctions') ? 'primary.main' : 'text.secondary',
              fontWeight: isActive('/auctions') ? 700 : 500,
              fontSize: '0.95rem',
              py: 1,
              px: 2,
              borderRadius: 3,
              minHeight: 44,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: alpha('#00796b', 0.08),
              },
            }}
          >
            Browse
          </Button>

          {isAuthenticated ? (
            <>
              {hasRole(UserRole.SELLER) && (
                <Button
                  color="inherit"
                  startIcon={<Add sx={{ fontSize: 20 }} />}
                  onClick={() => navigate('/create-auction')}
                  sx={{
                    color: isActive('/create-auction') ? 'primary.main' : 'text.secondary',
                    fontWeight: isActive('/create-auction') ? 700 : 500,
                    fontSize: '0.95rem',
                    py: 1,
                    px: 2,
                    borderRadius: 3,
                    minHeight: 44,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: alpha('#00796b', 0.08),
                    },
                  }}
                >
                  Create
                </Button>
              )}

              <Button
                color="inherit"
                startIcon={<List sx={{ fontSize: 20 }} />}
                onClick={() => navigate('/my-bids')}
                sx={{
                  color: isActive('/my-bids') ? 'primary.main' : 'text.secondary',
                  fontWeight: isActive('/my-bids') ? 700 : 500,
                  fontSize: '0.95rem',
                  py: 1,
                  px: 2,
                  borderRadius: 3,
                  minHeight: 44,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: alpha('#00796b', 0.08),
                  },
                }}
              >
                My Bids
              </Button>

              {/* Notifications */}
              <IconButton
                size="large"
                sx={{
                  color: 'text.secondary',
                  width: 44,
                  height: 44,
                  '&:hover': {
                    backgroundColor: alpha('#00796b', 0.08),
                  },
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications sx={{ fontSize: 24 }} />
                </Badge>
              </IconButton>

              {/* User Menu */}
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                sx={{
                  width: 44,
                  height: 44,
                  '&:hover': {
                    backgroundColor: alpha('#00796b', 0.08),
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                >
                  {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                sx={{ mt: 1.5 }}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    minWidth: 200,
                    '& .MuiMenuItem-root': {
                      fontSize: '0.95rem',
                      py: 1.2,
                      px: 2,
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: alpha('#00796b', 0.08),
                      },
                    }
                  }
                }}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                  <Person sx={{ mr: 1.5, fontSize: 20 }} />
                  Profile
                </MenuItem>
                {hasRole(UserRole.SELLER) && (
                  <MenuItem onClick={() => { navigate('/my-auctions'); handleMenuClose(); }}>
                    <Gavel sx={{ mr: 1.5, fontSize: 20 }} />
                    My Auctions
                  </MenuItem>
                )}
                <MenuItem onClick={() => { navigate('/watchlist'); handleMenuClose(); }}>
                  <Favorite sx={{ mr: 1.5, fontSize: 20 }} />
                  Watchlist
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1.5, fontSize: 20 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  color: 'primary.main',
                  borderColor: 'primary.main',
                  fontSize: '0.95rem',
                  py: 1,
                  px: 2.5,
                  borderRadius: 3,
                  minHeight: 44,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: alpha('#00796b', 0.05),
                    borderWidth: 2,
                  },
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  fontSize: '0.95rem',
                  py: 1,
                  px: 2.5,
                  borderRadius: 3,
                  minHeight: 44,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(0, 121, 107, 0.25)',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    boxShadow: '0 6px 16px rgba(0, 121, 107, 0.35)',
                  },
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ModernNavbar;