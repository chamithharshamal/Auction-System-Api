import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Gavel,
  Google,
  Facebook,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ModernLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.username, formData.password);
      navigate('/');
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8)), url('https://www.royalmint.com/globalassets/__rebrand/_structure/collect/auction/spring-consignment-auction/t-_dt_page_spring-auction.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={8}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
            p: { xs: 2.5, sm: 4 },
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                mb: 2,
              }}
            >
              <Gavel sx={{ fontSize: 32, color: '#00796b' }} />
            </Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                color: '#00796b',
                textAlign: 'center',
                mb: 3,
              }}
            >
              Sign In to Your Account
            </Typography>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%', 
                  mb: 2.5,
                  borderRadius: 1.5,
                  py: 1,
                  px: 1.5,
                }}
                onClose={clearError}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                size="small"
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username or Email"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: 'primary.main', fontSize: '1rem' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 1.5,
                    fontSize: '0.875rem',
                  },
                }}
                sx={{ mb: 1.5, fontSize: '0.875rem' }}
              />
              <TextField
                size="small"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'primary.main', fontSize: '1rem' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 1.5,
                    fontSize: '0.875rem',
                  },
                }}
                sx={{ mb: 1.5, fontSize: '0.875rem' }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                size="small"
                sx={{
                  py: 1.2,
                  mt: 1.5,
                  mb: 1.5,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0, 121, 107, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0, 121, 107, 0.4)',
                  },
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              
              <Box textAlign="center" mb={1.5}>
                <Link 
                  component={RouterLink} 
                  to="/forgot-password"
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  Forgot password?
                </Link>
              </Box>
              
              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Or continue with
                </Typography>
              </Divider>
              
              <Box display="flex" gap={1.5} mb={2.5}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google sx={{ fontSize: '1rem' }} />}
                  size="small"
                  sx={{
                    py: 1,
                    fontWeight: 600,
                    borderRadius: 1.5,
                    borderColor: 'grey.300',
                    color: 'text.primary',
                    fontSize: '0.875rem',
                    '&:hover': {
                      borderColor: 'grey.400',
                      backgroundColor: 'grey.50',
                    },
                  }}
                >
                  Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Facebook sx={{ color: '#1877f2', fontSize: '1rem' }} />}
                  size="small"
                  sx={{
                    py: 1,
                    fontWeight: 600,
                    borderRadius: 1.5,
                    borderColor: 'grey.300',
                    color: 'text.primary',
                    fontSize: '0.875rem',
                    '&:hover': {
                      borderColor: 'grey.400',
                      backgroundColor: 'grey.50',
                    },
                  }}
                >
                  Facebook
                </Button>
              </Box>
              
              <Box textAlign="center">
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  Don't have an account?{' '}
                  <Link 
                    component={RouterLink} 
                    to="/register" 
                    variant="body2"
                    sx={{ 
                      fontWeight: 600,
                      color: 'primary.main',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                      fontSize: '0.875rem',
                    }}
                  >
                    Sign up here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
        
        <Box textAlign="center" mt={3}>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            © {new Date().getFullYear()} AuctionHub. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ModernLoginPage;