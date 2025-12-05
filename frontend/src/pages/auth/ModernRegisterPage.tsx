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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  IconButton,
  Divider,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  Lock,
  Gavel,
  Google,
  Facebook,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/api';

const ModernRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    roles: [UserRole.BIDDER],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) clearError();
  };

  const handleRoleChange = (event: any) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      roles: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        roles: formData.roles,
      });
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const passwordMatch = formData.password === formData.confirmPassword;
  const isUsernameValid = /^[a-zA-Z0-9_]{3,50}$/.test(formData.username);
  const isPasswordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,100}$/.test(formData.password);
  const isFormValid = formData.username && formData.email && formData.password &&
    formData.firstName && formData.lastName && passwordMatch &&
    isUsernameValid && isPasswordValid;

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
      <Container component="main" maxWidth="sm">
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
              Create Your Account
            </Typography>
            <Box
              sx={{
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderRadius: 1.5,
                p: 1.5,
                mb: 2.5,
                width: '100%',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#ff6b6b' }}>
                <strong>Username:</strong> 3-50 chars, letters, numbers, underscores<br />
                <strong>Password:</strong> 8+ chars with uppercase, lowercase, digit
              </Typography>
            </Box>

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
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    value={formData.firstName}
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
                    sx={{ fontSize: '0.875rem' }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    InputProps={{
                      sx: {
                        borderRadius: 1.5,
                        fontSize: '0.875rem',
                      },
                    }}
                    sx={{ fontSize: '0.875rem' }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    size="small"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange}
                    helperText="3-50 chars: letters, numbers, underscores"
                    error={!!formData.username && !isUsernameValid}
                    InputProps={{
                      sx: {
                        borderRadius: 1.5,
                        fontSize: '0.875rem',
                      },
                    }}
                    sx={{ fontSize: '0.875rem' }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    size="small"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'primary.main', fontSize: '1rem' }} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 1.5,
                        fontSize: '0.875rem',
                      },
                    }}
                    sx={{ fontSize: '0.875rem' }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    size="small"
                    fullWidth
                    id="phoneNumber"
                    label="Phone Number"
                    name="phoneNumber"
                    autoComplete="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: 'primary.main', fontSize: '1rem' }} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 1.5,
                        fontSize: '0.875rem',
                      },
                    }}
                    sx={{ fontSize: '0.875rem' }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="roles-label" sx={{ fontSize: '0.875rem' }}>Account Type</InputLabel>
                    <Select
                      labelId="roles-label"
                      id="roles"
                      value={formData.roles}
                      label="Account Type"
                      onChange={handleRoleChange}
                      sx={{ borderRadius: 1.5, fontSize: '0.875rem' }}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" sx={{ borderRadius: 1, height: 20, fontSize: '0.7rem' }} />
                          ))}
                        </Box>
                      )}
                    >
                      <MenuItem value={UserRole.BIDDER} sx={{ fontSize: '0.875rem' }}>Bidder Only</MenuItem>
                      <MenuItem value={UserRole.SELLER} sx={{ fontSize: '0.875rem' }}>Seller (Can create auctions)</MenuItem>
                      <MenuItem value={[UserRole.BIDDER, UserRole.SELLER]} sx={{ fontSize: '0.875rem' }}>Both Bidder & Seller</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    helperText="8+ chars with uppercase, lowercase, digit"
                    error={!!formData.password && !isPasswordValid}
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
                    sx={{ fontSize: '0.875rem' }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={formData.confirmPassword !== '' && !passwordMatch}
                    helperText={
                      formData.confirmPassword !== '' && !passwordMatch
                        ? 'Passwords do not match'
                        : ''
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={toggleConfirmPasswordVisibility}
                            edge="end"
                            size="small"
                          >
                            {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 1.5,
                        fontSize: '0.875rem',
                      },
                    }}
                    sx={{ fontSize: '0.875rem' }}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !isFormValid}
                size="small"
                sx={{
                  py: 1.2,
                  mt: 2.5,
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

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
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
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
                    Sign in here
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

export default ModernRegisterPage;