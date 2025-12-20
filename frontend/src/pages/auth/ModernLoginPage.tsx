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
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Gavel,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ModernLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.username, formData.password);
      navigate('/');
    } catch (error) { } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, position: 'relative', overflow: 'hidden' }}>
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper className="glass-panel" sx={{ p: { xs: 4, sm: 6 }, borderRadius: '32px', textAlign: 'center' }}>
          <Box sx={{ mb: 4, display: 'inline-flex', p: 2, borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <Gavel sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-1px' }}>Welcome Back</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 6 }}>Sign in to continue.</Typography>

          {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '12px', bgcolor: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E', border: '1px solid rgba(244, 63, 94, 0.2)' }} onClose={clearError}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              required fullWidth label="Username" name="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><Person color="primary" /></InputAdornment> }}
            />
            <TextField
              required fullWidth label="Password" name="password" type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock color="primary" /></InputAdornment>,
                endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
              }}
            />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mt: 2, height: 60, borderRadius: '16px', fontSize: '1.1rem', fontWeight: 900 }}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>New here?</Typography>
            <Link component={RouterLink} to="/register" sx={{ fontWeight: 900, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Join Now</Link>
          </Box>
        </Paper>
      </Container>

      {/* Background Decor */}
      <Box sx={{ position: 'absolute', top: '20%', left: '10%', width: '30%', height: '40%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />
      <Box sx={{ position: 'absolute', bottom: '10%', right: '5%', width: '40%', height: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />
    </Box>
  );
};

export default ModernLoginPage;