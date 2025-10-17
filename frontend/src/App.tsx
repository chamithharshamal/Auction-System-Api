import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import modernTheme from './theme/modernTheme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ModernNavbar from './components/layout/ModernNavbar';
import ModernHomePage from './pages/ModernHomePage';
import LoginPage from './pages/auth/LoginPage';  // Changed from ModernLoginPage
import ModernRegisterPage from './pages/auth/ModernRegisterPage';
import ModernAuctionListPage from './pages/auctions/ModernAuctionListPage';
import ModernAuctionDetailPage from './pages/auctions/ModernAuctionDetailPage';
import CreateAuctionPage from './pages/auctions/CreateAuctionPage';
import UserProfilePage from './pages/user/UserProfilePage';
import MyAuctionsPage from './pages/user/MyAuctionsPage';
import MyBidsPage from './pages/user/MyBidsPage';
import LoadingSpinner from './components/common/LoadingSpinner';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, hasRole, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole as any)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Main App Routes
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <ModernNavbar />
      <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<ModernHomePage />} />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}  // Changed from ModernLoginPage
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/" replace /> : <ModernRegisterPage />} 
          />
          <Route path="/auctions" element={<ModernAuctionListPage />} />
          <Route path="/auctions/:id" element={<ModernAuctionDetailPage />} />

          {/* Protected Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-auctions" 
            element={
              <ProtectedRoute requiredRole="SELLER">
                <MyAuctionsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-bids" 
            element={
              <ProtectedRoute>
                <MyBidsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-auction" 
            element={
              <ProtectedRoute requiredRole="SELLER">
                <CreateAuctionPage />
              </ProtectedRoute>
            } 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;