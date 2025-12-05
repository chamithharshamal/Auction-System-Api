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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  alpha,
  Grid,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  CalendarToday,
  Security,
  Edit,
  VerifiedUser,
  Gavel,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/api';

const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();

  if (!user) {
    return <div>Loading...</div>;
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'error';
      case UserRole.SELLER:
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          mb: 6,
          borderRadius: 4,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          pt: 6,
          pb: 8,
          px: 4,
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            My Profile
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Manage your account settings and preferences
          </Typography>
        </Box>

        {/* Decorative circles */}
        <Box sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          bgcolor: 'white',
          opacity: 0.1
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -30,
          right: 100,
          width: 100,
          height: 100,
          borderRadius: '50%',
          bgcolor: 'white',
          opacity: 0.1
        }} />
      </Paper>

      <Grid container spacing={4} sx={{ mt: -10, position: 'relative', zIndex: 2, px: 2 }}>
        {/* Left Column: Avatar & Quick Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3} sx={{ borderRadius: 4, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', pt: 4, pb: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontSize: '3rem',
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: theme.shadows[3],
                }}
              >
                {user.firstName?.charAt(0) || user.username?.charAt(0)}
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                @{user.username}
              </Typography>

              <Box sx={{ mt: 2, mb: 3 }}>
                {user.roles.map((role) => (
                  <Chip
                    key={role}
                    label={role}
                    color={getRoleColor(role) as any}
                    size="small"
                    sx={{ mr: 1, mb: 1, fontWeight: 'bold' }}
                  />
                ))}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Button
                variant="contained"
                startIcon={<Edit />}
                fullWidth
                size="large"
                sx={{ borderRadius: 2, mb: 2 }}
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                startIcon={<Security />}
                fullWidth
                size="large"
                sx={{ borderRadius: 2 }}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Details & Stats */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={3}>
            {/* Stats Cards */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card elevation={2} sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <CalendarToday />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      MEMBER SINCE
                    </Typography>
                    <Typography variant="h6">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card elevation={2} sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <VerifiedUser />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      ACCOUNT STATUS
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {user.active ? 'Active' : 'Inactive'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Detailed Info */}
            <Grid size={12}>
              <Paper elevation={3} sx={{ borderRadius: 4, p: 4 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Person color="primary" sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Personal Information
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <List disablePadding>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Person color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Full Name"
                          secondary={`${user.firstName} ${user.lastName}`}
                          primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 'bold' }}
                          secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', mt: 0.5 }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Email color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Email Address"
                          secondary={user.email}
                          primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 'bold' }}
                          secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', mt: 0.5 }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <List disablePadding>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Phone color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Phone Number"
                          secondary={user.phoneNumber || 'Not provided'}
                          primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 'bold' }}
                          secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', mt: 0.5 }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Gavel color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="User ID"
                          secondary={user.id}
                          primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 'bold' }}
                          secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', mt: 0.5, sx: { fontFamily: 'monospace' } }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserProfilePage;
