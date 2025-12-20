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
  IconButton,
  Grid,
  Stack,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Gavel,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/api';

const ModernRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', phoneNumber: '', roles: [UserRole.BIDDER],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return;
    setLoading(true);
    try {
      await register({
        username: formData.username, email: formData.email,
        password: formData.password, firstName: formData.firstName,
        lastName: formData.lastName, phoneNumber: formData.phoneNumber,
        roles: formData.roles,
      });
      navigate('/');
    } catch (error) { } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 8, md: 12 }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, position: 'relative', overflow: 'hidden' }}>
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper className="glass-panel" sx={{ p: { xs: 4, md: 8 }, borderRadius: '32px' }}>
          <Grid container spacing={8}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 4, display: 'inline-flex', p: 2, borderRadius: '20px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <Gavel sx={{ fontSize: 40, color: '#3B82F6' }} />
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-2px' }}>Create Account</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 6, lineHeight: 1.8 }}>Be part of the most advanced online auction platform. Gain access to exclusive items and real-time bidding.</Typography>

              <Stack spacing={3}>
                <Box sx={{ display: 'flex', gap: 2 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981', mt: 1 }} /><Typography variant="body2">Real-time auction updates</Typography></Box>
                <Box sx={{ display: 'flex', gap: 2 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3B82F6', mt: 1 }} /><Typography variant="body2">Live price trends and charts</Typography></Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }} onClose={clearError}>{error}</Alert>}
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}><TextField required fullWidth label="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} /></Grid>
                  <Grid size={{ xs: 6 }}><TextField required fullWidth label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} /></Grid>
                </Grid>
                <TextField required fullWidth label="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                <TextField required fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

                <FormControl fullWidth>
                  <InputLabel>Account Role</InputLabel>
                  <Select value={formData.roles[0]} label="Account Role" onChange={(e) => setFormData({ ...formData, roles: [e.target.value as UserRole] })}>
                    <MenuItem value={UserRole.BIDDER}>Bidder (Access to Buy)</MenuItem>
                    <MenuItem value={UserRole.SELLER}>Seller (Create Auctions)</MenuItem>
                  </Select>
                </FormControl>

                <TextField required fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} InputProps={{ endAdornment: <IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton> }} />
                <TextField required fullWidth label="Confirm" type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />

                <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2, height: 56, fontWeight: 900, borderRadius: '16px' }} disabled={loading}>
                  {loading ? 'Creating Account...' : 'Register'}
                </Button>

                <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                  Already have an account? <Link component={RouterLink} to="/login" sx={{ fontWeight: 900, color: '#10B981', textDecoration: 'none' }}>Sign In</Link>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Background Decor */}
      <Box sx={{ position: 'absolute', top: '10%', right: '5%', width: '35%', height: '45%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', filter: 'blur(90px)', zIndex: 0 }} />
      <Box sx={{ position: 'absolute', bottom: '5%', left: '5%', width: '40%', height: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />
    </Box>
  );
};

export default ModernRegisterPage;