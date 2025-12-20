import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

import { ColorModeProvider, useColorMode } from './contexts/ThemeContext';
import { getModernTheme } from './theme/modernTheme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ModernNavbar from './components/layout/ModernNavbar';
import ModernHomePage from './pages/ModernHomePage';
import ModernLoginPage from './pages/auth/ModernLoginPage';
import ModernRegisterPage from './pages/auth/ModernRegisterPage';
import ModernAuctionListPage from './pages/auctions/ModernAuctionListPage';
import AuctionDetailPage from './pages/auctions/AuctionDetailPage';
import CreateAuctionPage from './pages/auctions/CreateAuctionPage';
import EditAuctionPage from './pages/auctions/EditAuctionPage';
import UserProfilePage from './pages/user/UserProfilePage';
import MyAuctionsPage from './pages/user/MyAuctionsPage';
import MyBidsPage from './pages/user/MyBidsPage';
import WatchlistPage from './pages/user/WatchlistPage';
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
            element={isAuthenticated ? <Navigate to="/" replace /> : <ModernLoginPage />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" replace /> : <ModernRegisterPage />}
          />
          <Route path="/auctions" element={<ModernAuctionListPage />} />
          <Route path="/auctions/:id" element={<AuctionDetailPage />} />

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
            path="/watchlist"
            element={
              <ProtectedRoute>
                <WatchlistPage />
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
          <Route
            path="/edit-auction/:id"
            element={
              <ProtectedRoute requiredRole="SELLER">
                <EditAuctionPage />
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

const AppContent: React.FC = () => {
  const { mode } = useColorMode();
  const theme = React.useMemo(() => getModernTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <PayPalScriptProvider options={{ clientId: "test", currency: "USD", intent: "capture" }}>
          <Router>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </Router>
        </PayPalScriptProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <ColorModeProvider>
      <AppContent />
    </ColorModeProvider>
  );
};

export default App;