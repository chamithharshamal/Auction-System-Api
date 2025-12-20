import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  alpha,
  Grid,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Person,
  Security,
  Edit,
  VerifiedUser,
  Gavel,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();

  if (!user) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return '#F43F5E';
      case UserRole.SELLER: return '#3B82F6';
      default: return '#10B981';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 8, md: 12 } }} className="page-fade-in">
      <Container maxWidth="lg">
        {/* Profile Header Block */}
        <Box sx={{ position: 'relative', mb: 10 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 8 },
              borderRadius: '32px',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 6, position: 'relative', zIndex: 1 }}>
              <Avatar
                sx={{
                  width: 160,
                  height: 160,
                  fontSize: '4rem',
                  fontWeight: 900,
                  bgcolor: 'primary.main',
                  boxShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                  border: `4px solid ${theme.palette.background.default}`
                }}
              >
                {user.firstName?.charAt(0) || user.username?.charAt(0)}
              </Avatar>

              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Typography variant="h2" sx={{ fontWeight: 900, lineHeight: 1 }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Chip
                    label={user.active ? 'Verified Account' : 'Pending'}
                    size="small"
                    sx={{ bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#10B981', fontWeight: 900, fontSize: '0.7rem' }}
                  />
                </Box>
                <Typography variant="h5" sx={{ color: 'text.secondary', mb: 3 }}>
                  @{user.username}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  {user.roles.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      sx={{
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                        color: getRoleColor(role as UserRole),
                        fontWeight: 900,
                        border: '1px solid',
                        borderColor: alpha(getRoleColor(role as UserRole), 0.3)
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ ml: { md: 'auto' }, display: 'flex', gap: 2 }}>
                <Button variant="contained" startIcon={<Edit />} sx={{ borderRadius: '12px', px: 4, fontWeight: 900 }}>
                  Edit Profile
                </Button>
                <IconButton className="glass-panel" sx={{ width: 48, height: 48 }}>
                  <Security fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Mesh Background for header */}
            <Box sx={{
              position: 'absolute',
              top: '-10%',
              right: '-10%',
              width: '40%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
              filter: 'blur(60px)',
              zIndex: 0
            }} />
          </Paper>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper className="glass-panel" sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Person className="emerald-gradient-text" /> Personal Information
              </Typography>

              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                      Primary Email
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{user.email}</Typography>
                  </Box>
                  <Divider sx={{ my: 3, opacity: 0.1 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                      Contact Number
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{user.phoneNumber || 'Not established'}</Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                      Joined On
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {new Date(user.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 3, opacity: 0.1 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                      System ID
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'monospace', opacity: 0.6 }}>
                      {user.id.slice(0, 18)}...
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Gavel color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>Bidding Stats</Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>24</Typography>
                    <Typography variant="body2" color="text.secondary">Active bids in current cycle</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <VerifiedUser color="secondary" />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>Trust Score</Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>98%</Typography>
                    <Typography variant="body2" color="text.secondary">Excellent marketplace rating</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper className="glass-panel" sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 4 }}>Account Security</Typography>

              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>Two-Factor Auth</Typography>
                    <Typography variant="caption" color="text.secondary">Active via Mobile</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>KYC Status</Typography>
                    <Typography variant="caption" color="text.secondary">Identity Fully Verified</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>Password Update</Typography>
                    <Typography variant="caption" color="text.secondary">Changed 3 months ago</Typography>
                  </Box>
                </Box>
              </Stack>

              <Divider sx={{ my: 4, opacity: 0.1 }} />

              <Button fullWidth variant="outlined" sx={{ borderRadius: '12px', mb: 2, fontWeight: 900, py: 1.5 }}>
                Download Activity Log
              </Button>
              <Button fullWidth color="error" sx={{ fontWeight: 800 }}>
                Deactivate Account
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserProfilePage;
