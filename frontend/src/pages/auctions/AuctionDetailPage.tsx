import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  TextField,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Gavel,
  Person,
  Schedule,
  Share,
  FavoriteBorder,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import type { AuctionItem, Bid, PlaceBidRequest } from '../../types/api';
import { auctionService } from '../../services/auctionService';
import { bidService } from '../../services/bidService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (id) {
      loadAuctionDetails();
    }
  }, [id]);

  const loadAuctionDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load auction details first
      const auctionData = await auctionService.getAuctionById(id!);
      setAuction(auctionData);
      
      // Then try to load bids (this might fail if no bids exist)
      try {
        const bidsData = await bidService.getRecentBidsForAuction(id!, 10);
        setBids(bidsData);
      } catch (bidError) {
        console.warn('No bids found for this auction:', bidError);
        setBids([]); // Set empty array if no bids found
      }
    } catch (error: any) {
      setError('Failed to load auction details');
      console.error('Error loading auction details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!auction || !user || !bidAmount) return;

    try {
      const bidData: PlaceBidRequest = {
        bidderId: user.id,
        amount: parseFloat(bidAmount),
      };

      await bidService.placeBid(auction.id, bidData);
      setSuccess('Bid placed successfully!');
      setBidDialogOpen(false);
      setBidAmount('');
      loadAuctionDetails(); // Refresh auction data
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to place bid');
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

    if (days > 0) return `${days} days ${hours} hours left`;
    if (hours > 0) return `${hours} hours ${minutes} minutes left`;
    return `${minutes} minutes left`;
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
    return <LoadingSpinner message="Loading auction details..." />;
  }

  if (!auction) {
    return (
      <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error">Auction not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {error && (
        <ErrorAlert
          open={!!error}
          message={error}
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <ErrorAlert
          open={!!success}
          message={success}
          onClose={() => setSuccess(null)}
          severity="success"
        />
      )}

      <Grid container spacing={4}>
        {/* Image Gallery */}
        <Grid item xs={12} md={6}>
          <Card>
            {auction.imageUrls && auction.imageUrls.length > 0 ? (
              <CardMedia
                component="img"
                height="400"
                image={auction.imageUrls[0]}
                alt={auction.title}
              />
            ) : (
              <Box
                sx={{
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'grey.100',
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No Image Available
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Auction Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Typography variant="h4" component="h1">
                  {auction.title}
                </Typography>
                <Box display="flex" gap={1}>
                  <IconButton>
                    <Share />
                  </IconButton>
                  <IconButton>
                    <FavoriteBorder />
                  </IconButton>
                </Box>
              </Box>

              <Chip
                label={auction.status}
                color={getStatusColor(auction.status) as any}
                sx={{ mb: 2 }}
              />

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {auction.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h3" color="primary.main">
                  {formatPrice(auction.currentPrice)}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {auction.totalBids} bids
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Starting Price: {formatPrice(auction.startingPrice)}
                {auction.reservePrice && (
                  <span> • Reserve Price: {formatPrice(auction.reservePrice)}</span>
                )}
              </Typography>

              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Schedule color="action" />
                <Typography variant="body1">
                  {getTimeRemaining(auction.endDate)}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Person color="action" />
                <Typography variant="body1">
                  Seller: {auction.seller.firstName} {auction.seller.lastName}
                </Typography>
              </Box>

              {isAuthenticated && auction.status === 'ACTIVE' && user?.id !== auction.seller.id && (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<Gavel />}
                  onClick={() => setBidDialogOpen(true)}
                  sx={{ py: 1.5 }}
                >
                  Place Bid
                </Button>
              )}

              {auction.status === 'ACTIVE' && (
                (!isAuthenticated || user?.id === auction.seller.id) ? (
                  <Alert severity="info">
                    {user?.id === auction.seller.id
                      ? "You can't bid on your own auction"
                      : 'You must be logged in to place a bid'}
                  </Alert>
                ) : null
              )}

              {auction.status === 'ENDED' && (
                <Alert severity="info">
                  This auction has ended
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Box sx={{ mt: 4 }}>
        <Paper>
          <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
            <Tab label="Bid History" />
            <Tab label="Auction Details" />
            <Tab label="Seller Info" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Recent Bids ({bids.length})
                </Typography>
                {bids.length > 0 ? (
                  <List>
                    {bids.map((bid) => (
                      <ListItem key={bid.id} divider>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {bid.bidder.firstName?.charAt(0) || bid.bidder.username?.charAt(0)}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="subtitle1">
                                {bid.bidder.firstName} {bid.bidder.lastName}
                              </Typography>
                              <Typography variant="h6" color="primary.main">
                                {formatPrice(bid.amount)}
                              </Typography>
                            </Box>
                          }
                          secondary={new Date(bid.timestamp).toLocaleString()}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">
                    No bids yet. Be the first to bid!
                  </Typography>
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Auction Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1">{auction.category}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(auction.startDate).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(auction.endDate).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body1">
                      {new Date(auction.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Seller Information
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {auction.seller.firstName?.charAt(0) || auction.seller.username?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {auction.seller.firstName} {auction.seller.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{auction.seller.username}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Member since {new Date(auction.seller.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Bid Dialog */}
      <Dialog open={bidDialogOpen} onClose={() => setBidDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Place a Bid</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Current highest bid: {formatPrice(auction.currentPrice)}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Your Bid Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            inputProps={{ min: auction.currentPrice + 1, step: 0.01 }}
            helperText={`Minimum bid: ${formatPrice(auction.currentPrice + 1)}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBidDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePlaceBid}
            variant="contained"
            disabled={!bidAmount || parseFloat(bidAmount) <= auction.currentPrice}
          >
            Place Bid
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AuctionDetailPage;
