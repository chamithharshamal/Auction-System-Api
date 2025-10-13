import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Fab,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Add,
  Gavel,
  Edit,
  Delete,
  Visibility,
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
      case 'ACTIVE':
        return 'success';
      case 'ENDED':
        return 'default';
      case 'CANCELLED':
        return 'error';
      default:
        return 'warning';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your auctions..." />;
  }

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          My Auctions
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/create-auction')}
        >
          Create Auction
        </Button>
      </Box>

      {auctions && auctions.content.length > 0 ? (
        <Grid container spacing={3}>
          {auctions.content.map((auction) => (
            <Grid item xs={12} sm={6} md={4} key={auction.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => navigate(`/auctions/${auction.id}`)}
              >
                {auction.imageUrls && auction.imageUrls.length > 0 && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={auction.imageUrls[0]}
                    alt={auction.title}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" component="h3" noWrap>
                      {auction.title}
                    </Typography>
                    <Chip
                      label={auction.status}
                      color={getStatusColor(auction.status) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {auction.description.substring(0, 100)}...
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="primary.main">
                      {formatPrice(auction.currentPrice)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getTimeRemaining(auction.endDate)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {auction.totalBids} bids
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/auctions/${auction.id}`);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Navigate to edit auction page
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Handle delete auction
                    }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={8}>
          <Gavel sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No auctions created yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start selling by creating your first auction
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/create-auction')}
          >
            Create Your First Auction
          </Button>
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="create auction"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => navigate('/create-auction')}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default MyAuctionsPage;
