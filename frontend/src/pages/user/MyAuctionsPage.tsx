import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Fab,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Paper,
  alpha,
} from '@mui/material';
import {
  Add,
  Gavel,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { AuctionItem, PaginatedResponse } from '../../types/api';
import { auctionService } from '../../services/auctionService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyAuctionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<PaginatedResponse<AuctionItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [auctionToDelete, setAuctionToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadMyAuctions();
    }
  }, [user]);

  const loadMyAuctions = async () => {
    try {
      setLoading(true);
      const data = await auctionService.getAuctionsBySeller(user!.id, 0, 20);
      setAuctions(data);
    } catch (error) {
      console.error('Error loading my auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#10B981';
      case 'ENDED': return '#64748B';
      case 'CANCELLED': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const handleDeleteClick = (auctionId: string) => {
    setAuctionToDelete(auctionId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (auctionToDelete) {
      try {
        setLoading(true);
        await auctionService.deleteAuction(auctionToDelete);
        await loadMyAuctions();
        setDeleteDialogOpen(false);
        setAuctionToDelete(null);
      } catch (error) {
        console.error('Failed to delete auction:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setAuctionToDelete(null);
  };

  if (loading) {
    return <LoadingSpinner message="Loading your auctions..." />;
  }

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 8, md: 12 } }} className="page-fade-in">
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-2px', fontFamily: 'Outfit, sans-serif' }}>
              My Auctions
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Manage your auctions and check bids.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/create-auction')}
            sx={{
              height: 56,
              px: 4,
              borderRadius: '16px',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
              display: { xs: 'none', sm: 'flex' }
            }}
          >
            Start New Auction
          </Button>
        </Box>

        {auctions && auctions.content.length > 0 ? (
          <Grid container spacing={4}>
            {auctions.content.map((auction) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={auction.id}>
                <Card
                  className="glass-panel"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: 'rgba(16, 185, 129, 0.3)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(16, 185, 129, 0.1)'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="240"
                      image={auction.imageUrls?.[0] || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80'}
                      alt={auction.title}
                      sx={{ transition: 'transform 0.5s ease' }}
                    />
                    <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                      <Chip
                        label={auction.status}
                        sx={{
                          bgcolor: alpha(getStatusColor(auction.status), 0.2),
                          color: getStatusColor(auction.status),
                          fontWeight: 800,
                          backdropFilter: 'blur(8px)',
                          border: `1px solid ${alpha(getStatusColor(auction.status), 0.3)}`
                        }}
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, fontFamily: 'Outfit, sans-serif' }} noWrap>
                      {auction.title}
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>Current Price</Typography>
                        <Typography variant="h6" sx={{ color: '#10B981', fontWeight: 900 }}>{formatPrice(auction.currentPrice)}</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>Ends In</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{getTimeRemaining(auction.endDate)}</Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                      <TrendingUp sx={{ fontSize: 18, color: '#3B82F6' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{auction.totalBids} bids recorded</Typography>
                    </Stack>
                  </CardContent>

                  <Box sx={{ p: 2, display: 'flex', gap: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/auctions/${auction.id}`)}
                      sx={{ borderRadius: '12px', fontWeight: 700 }}
                    >
                      View
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      startIcon={<Edit />}
                      onClick={() => navigate(`/edit-auction/${auction.id}`)}
                      sx={{ borderRadius: '12px', fontWeight: 700 }}
                    >
                      Edit
                    </Button>
                    <IconButton
                      color="error"
                      disabled={auction.totalBids > 0}
                      onClick={() => handleDeleteClick(auction.id)}
                      sx={{
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: 'error.main',
                        '&.Mui-disabled': { opacity: 0.4, borderColor: 'rgba(255,255,255,0.1)' }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            className="glass-panel"
            sx={{
              p: 10,
              textAlign: 'center',
              borderRadius: '32px',
              border: '2px dashed rgba(255,255,255,0.05)'
            }}
          >
            <Box sx={{ width: 100, height: 100, borderRadius: '30px', bgcolor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 4 }}>
              <Gavel sx={{ fontSize: 48, color: '#3B82F6' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, fontFamily: 'Outfit, sans-serif' }}>
              No Auctions Found
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 6, maxWidth: 400, mx: 'auto' }}>
              You haven't started any auctions yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="large"
              onClick={() => navigate('/create-auction')}
              sx={{
                height: 60,
                px: 6,
                borderRadius: '18px',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
              }}
            >
              Start Your First Auction
            </Button>
          </Paper>
        )}
      </Container>

      {/* FAB for Mobile */}
      <Fab
        onClick={() => navigate('/create-auction')}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          display: { xs: 'flex', sm: 'none' },
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          '&:hover': { transform: 'scale(1.1)' }
        }}
      >
        <Add />
      </Fab>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: '#0F172A',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', fontFamily: 'Outfit, sans-serif' }}>Delete Auction?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            This will permanently remove the listing from the system. You can't undo this.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDeleteDialog} sx={{ fontWeight: 700, px: 3 }}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            autoFocus
            sx={{ borderRadius: '12px', fontWeight: 900, px: 3 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyAuctionsPage;
