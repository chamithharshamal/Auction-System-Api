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
  Badge,
  Container,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useColorMode } from '../../contexts/ThemeContext';
import { UserRole } from '../../types/api';
import {
  Search as SearchIcon,
  Gavel,
  Add,
  Person,
  Logout,
  Notifications,
  Favorite,
  TrendingUp,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import notificationService from '../../services/notificationService';
import { webSocketService } from '../../services/webSocketService';

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#94A3B8' : '#475569',
  padding: '10px 20px',
  borderRadius: '12px',
  fontWeight: 700,
  fontSize: '0.9rem',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
    color: '#10B981',
    transform: 'translateY(-2px)',
  },
}));

const ModernNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
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
        backgroundColor: 'transparent',
        backgroundImage: 'none',
        boxShadow: 'none',
        color: mode === 'dark' ? 'inherit' : 'text.primary',
        top: 20,
        zIndex: theme => theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          sx={{
            py: 1,
            px: { xs: 2, sm: 4 },
            minHeight: { xs: 70, md: 80 },
            borderRadius: '24px',
            backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(16px)',
            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: mode === 'dark' ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 10px 30px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '10%',
              width: '80%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent)',
            }
          }}
        >
          {/* Logo */}
          <Box
            display="flex"
            alignItems="center"
            sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)',
              }}
            >
              <Gavel sx={{ color: 'white', fontSize: 26 }} />
            </Box>
            <Typography
              variant="h4"
              component="div"
              className="emerald-gradient-text"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.2rem', md: '1.6rem' },
                letterSpacing: '-0.03em',
              }}
            >
              AuctionHub
            </Typography>
          </Box>

          {/* Search Bar - Hidden on small screens */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: { xs: 'none', lg: 'flex' },
              position: 'relative',
              borderRadius: '16px',
              backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(241, 245, 249, 0.9)',
              border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(16, 185, 129, 0.1)',
              width: '100%',
              maxWidth: { md: 300, xl: 450 },
              transition: 'all 0.3s ease',
              '&:focus-within': {
                borderColor: 'rgba(16, 185, 129, 0.5)',
                boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1)',
                width: '100%',
                maxWidth: { md: 400, xl: 550 },
              },
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
              <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
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
                  color: '#64748B',
                  opacity: 1,
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            {isAuthenticated ? (
              <>
                {hasRole(UserRole.SELLER) && (
                  <NavButton
                    startIcon={<Add />}
                    onClick={() => navigate('/create-auction')}
                    sx={{
                      backgroundColor: location.pathname === '/create-auction' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      color: location.pathname === '/create-auction' ? '#10B981' : (mode === 'dark' ? '#94A3B8' : '#475569'),
                      display: { xs: 'none', md: 'flex' },
                      mr: 1
                    }}
                  >
                    Start Auction
                  </NavButton>
                )}
                <IconButton
                  onClick={() => navigate('/my-bids')}
                  sx={{
                    color: isActive('/my-bids') ? 'primary.main' : '#94A3B8',
                    display: { xs: 'none', md: 'flex' }
                  }}
                >
                  <TrendingUp />
                </IconButton>

                <IconButton
                  sx={{ color: '#94A3B8' }}
                >
                  <Badge badgeContent={unreadCount} color="primary" overlap="circular">
                    <Notifications />
                  </Badge>
                </IconButton>

                <IconButton
                  onClick={toggleColorMode}
                  sx={{ color: '#94A3B8' }}
                >
                  {mode === 'dark' ? <LightMode /> : <DarkMode />}
                </IconButton>

                <IconButton
                  onClick={handleMenuOpen}
                  sx={{ p: 0.5, border: '2px solid rgba(16, 185, 129, 0.2)' }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
                      fontSize: '1rem',
                      fontWeight: 800,
                    }}
                  >
                    {user?.firstName?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  sx={{ mt: 1.5 }}
                  PaperProps={{
                    sx: {
                      borderRadius: '20px',
                      backgroundColor: mode === 'dark' ? '#1E293B' : '#FFFFFF',
                      border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
                      minWidth: 220,
                      p: 1,
                    }
                  }}
                >
                  <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }} sx={{ borderRadius: '12px', mb: 0.5 }}>
                    <Person sx={{ mr: 2, color: 'primary.main' }} /> Profile Settings
                  </MenuItem>
                  {hasRole(UserRole.SELLER) && (
                    <MenuItem onClick={() => { navigate('/my-auctions'); handleMenuClose(); }} sx={{ borderRadius: '12px', mb: 0.5 }}>
                      <Gavel sx={{ mr: 2, color: 'secondary.main' }} /> My Auctions
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => { navigate('/watchlist'); handleMenuClose(); }} sx={{ borderRadius: '12px', mb: 0.5 }}>
                    <Favorite sx={{ mr: 2, color: '#F43F5E' }} /> Watchlist
                  </MenuItem>
                  <Divider sx={{ my: 1, opacity: 0.1 }} />
                  <MenuItem onClick={handleLogout} sx={{ borderRadius: '12px', color: '#F43F5E' }}>
                    <Logout sx={{ mr: 2 }} /> Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  onClick={() => navigate('/login')}
                  sx={{ color: mode === 'dark' ? '#F8FAFC' : 'text.primary', fontWeight: 700 }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                >
                  Join Us
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default ModernNavbar;