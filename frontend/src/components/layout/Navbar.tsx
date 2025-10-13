import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Gavel,
  Add,
  Person,
  List,
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/api';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    <AppBar position="sticky" sx={{ backgroundColor: 'primary.main' }}>
      <Toolbar sx={{ minHeight: 56, px: { xs: 1, sm: 2 } }}>
        {/* Logo */}
        <Box
          display="flex"
          alignItems="center"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Gavel sx={{ mr: 1, color: 'accent.main', fontSize: '1.25rem' }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              color: 'white',
              fontSize: '1.125rem',
              '&:hover': { color: 'accent.main' },
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
            borderRadius: 1.5,
            backgroundColor: alpha('#fff', 0.1),
            '&:hover': {
              backgroundColor: alpha('#fff', 0.15),
            },
            marginLeft: 2,
            marginRight: 2,
            width: '100%',
            maxWidth: 300,
          }}
        >
          <Box
            sx={{
              padding: '0 12px',
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SearchIcon sx={{ color: 'white', fontSize: '1rem' }} />
          </Box>
          <InputBase
            placeholder="Search auctions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              color: 'white',
              padding: '6px 8px 6px 36px',
              width: '100%',
              fontSize: '0.8125rem',
              '& input::placeholder': {
                color: 'white',
                opacity: 0.8,
                fontSize: '0.8125rem',
              },
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/auctions')}
            size="small"
            sx={{
              color: 'white',
              fontWeight: isActive('/auctions') ? 600 : 400,
              backgroundColor: isActive('/auctions') ? alpha('#fff', 0.1) : 'transparent',
              fontSize: '0.8125rem',
              py: 0.75,
              px: 1.5,
              minHeight: 36,
            }}
          >
            Browse
          </Button>

          {isAuthenticated ? (
            <>
              {hasRole(UserRole.SELLER) && (
                <Button
                  color="inherit"
                  startIcon={<Add sx={{ fontSize: '1rem' }} />}
                  onClick={() => navigate('/create-auction')}
                  size="small"
                  sx={{
                    color: 'white',
                    fontWeight: isActive('/create-auction') ? 600 : 400,
                    backgroundColor: isActive('/create-auction') ? alpha('#fff', 0.1) : 'transparent',
                    fontSize: '0.8125rem',
                    py: 0.75,
                    px: 1.5,
                    minHeight: 36,
                  }}
                >
                  Create
                </Button>
              )}

              <Button
                color="inherit"
                startIcon={<List sx={{ fontSize: '1rem' }} />}
                onClick={() => navigate('/my-bids')}
                size="small"
                sx={{
                  color: 'white',
                  fontWeight: isActive('/my-bids') ? 600 : 400,
                  backgroundColor: isActive('/my-bids') ? alpha('#fff', 0.1) : 'transparent',
                  fontSize: '0.8125rem',
                  py: 0.75,
                  px: 1.5,
                  minHeight: 36,
                }}
              >
                My Bids
              </Button>

              {/* User Menu */}
              <IconButton
                size="small"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
                sx={{ width: 36, height: 36 }}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    backgroundColor: 'accent.main',
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: '0.75rem',
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
                sx={{ mt: 1 }}
                PaperProps={{
                  sx: {
                    '& .MuiMenuItem-root': {
                      fontSize: '0.8125rem',
                      py: 0.75,
                      px: 1.5,
                    }
                  }
                }}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                  <Person sx={{ mr: 1, fontSize: '1rem' }} />
                  Profile
                </MenuItem>
                {hasRole(UserRole.SELLER) && (
                  <MenuItem onClick={() => { navigate('/my-auctions'); handleMenuClose(); }}>
                    <Gavel sx={{ mr: 1, fontSize: '1rem' }} />
                    My Auctions
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1, fontSize: '1rem' }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                size="small"
                sx={{ 
                  color: 'white',
                  fontSize: '0.8125rem',
                  py: 0.75,
                  px: 1.5,
                  minHeight: 36,
                }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/register')}
                size="small"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  fontSize: '0.8125rem',
                  py: 0.75,
                  px: 1.5,
                  minHeight: 36,
                  '&:hover': {
                    borderColor: 'accent.main',
                    backgroundColor: alpha('#fff', 0.1),
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

export default Navbar;