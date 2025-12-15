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
  Skeleton,
  Grid,
} from '@mui/material';
import {
  Gavel,
  Person,
  Schedule,
  Share,
  Favorite,
  FavoriteBorder,
  ArrowBack,
  Timer,
  Verified,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import type { AuctionItem, Bid, PlaceBidRequest } from '../../types/api';
import { auctionService } from '../../services/auctionService';
import { bidService } from '../../services/bidService';
import { webSocketService } from '../../services/webSocketService';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentModal } from '../../components/payment/PaymentModal';

const ModernAuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (id) {
      loadAuctionDetails();

      // Subscribe to real-time updates
      webSocketService.connect();
      webSocketService.subscribeToAuction(id, (message: any) => {
        // Handle new bid notification
        if (message && message.amount) {
          setAuction(prev => prev ? ({
            ...prev,
            currentPrice: message.amount,
            totalBids: (prev.totalBids || 0) + 1,
            // If the message contains bidder info, we could update that too if needed
            // But typically the bid notification structure needs to match what we expect
          }) : null);

          // Add to bids list
          setBids(prev => [message, ...prev]);
        }
      });

      return () => {
        webSocketService.disconnect();
      };
    }
  }, [id]);

  const handlePaymentSuccess = () => {
    setSuccessMessage('Payment processed successfully! This item is now marked as paid.');
    if (auction) {
      setAuction({ ...auction, paid: true });
    }
  };

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
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, fontWeight: 600 }}
        >
          Back
        </Button>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={500} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={600} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!auction) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, fontWeight: 600 }}
        >
          Back
        </Button>
        <Alert severity="error">Auction not found</Alert>
      </Container>
    );
  }

  const canBid = isAuthenticated && auction?.status === 'ACTIVE' && user?.id !== auction?.seller?.id;

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, fontWeight: 600 }}
      >
        Back to Auctions
      </Button>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ mb: 3, borderRadius: 3 }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ mb: 3, borderRadius: 3 }}
        >
          {success}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
          {successMessage}
        </Alert>
      )}

      {auction.paid && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 3, display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" component="span" sx={{ fontWeight: 700, mr: 1 }}>
            ✓ PAID
          </Typography>
          This item has been paid for.
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Image Gallery */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
            {auction.imageUrls && auction.imageUrls.length > 0 ? (
              <CardMedia
                component="img"
                height="500"
                image={auction.imageUrls[0]}
                alt={auction.title}
                sx={{ objectFit: 'cover' }}
              />
            ) : (
              <Box
                sx={{
                  height: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'grey.100',
                }}
              >
                <Typography variant="h5" color="text.secondary">
                  No Image Available
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Auction Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
            <CardContent sx={{ py: 3, px: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      background: `linear-gradient(45deg, ${'#00796b'}, ${'#009688'})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {auction.title || 'Untitled Auction'}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={auction.status || 'Unknown'}
                      color={getStatusColor(auction.status) as any}
                      sx={{
                        fontWeight: 700,
                        borderRadius: 1.5,
                        mb: 1,
                      }}
                    />
                    {auction.status === 'ACTIVE' && (
                      <Chip
                        icon={<Timer />}
                        label={getTimeRemaining(auction.endDate)}
                        color="primary"
                        variant="outlined"
                        sx={{
                          fontWeight: 700,
                          borderRadius: 1.5,
                          mb: 1,
                        }}
                      />
                    )}
                  </Box>
                </Box>
                <Box display="flex" gap={1}>
                  <IconButton
                    onClick={() => setFavorited(!favorited)}
                    sx={{
                      color: favorited ? '#ff6b6b' : 'text.secondary',
                      backgroundColor: favorited ? 'rgba(255, 107, 107, 0.1)' : 'grey.100',
                      '&:hover': {
                        backgroundColor: favorited ? 'rgba(255, 107, 107, 0.2)' : 'grey.200',
                      },
                    }}
                  >
                    {favorited ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                  <IconButton
                    sx={{
                      color: 'text.secondary',
                      backgroundColor: 'grey.100',
                      '&:hover': {
                        backgroundColor: 'grey.200',
                      },
                    }}
                  >
                    <Share />
                  </IconButton>
                </Box>
              </Box>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mb: 3,
                  fontSize: '1.1rem',
                  lineHeight: 1.7,
                }}
              >
                {auction.description || 'No description available'}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 800,
                      color: 'primary.main',
                      mb: 0.5,
                    }}
                  >
                    {formatPrice(auction.currentPrice)}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    {auction.totalBids || 0} bids
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Starting Price
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700 }}
                  >
                    {formatPrice(auction.startingPrice)}
                  </Typography>
                  {auction.reservePrice && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Reserve: {formatPrice(auction.reservePrice)}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Schedule color="action" sx={{ fontSize: 28 }} />
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600 }}
                  >
                    Time Remaining
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: 'primary.main' }}
                  >
                    {auction.endDate ? getTimeRemaining(auction.endDate) : 'Unknown'}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={1} mb={4}>
                <Person color="action" sx={{ fontSize: 28 }} />
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600 }}
                  >
                    Seller
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700 }}
                    >
                      {auction.seller?.firstName} {auction.seller?.lastName}
                    </Typography>
                    <Verified sx={{ fontSize: 20, color: 'primary.main' }} />
                  </Box>
                </Box>
              </Box>

              {canBid && auction.status === 'ACTIVE' && user?.id !== auction.seller?.id && (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<Gavel />}
                  onClick={() => setBidDialogOpen(true)}
                  sx={{
                    py: 2,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    boxShadow: '0 6px 16px rgba(0, 121, 107, 0.3)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0, 121, 107, 0.4)',
                    },
                  }}
                >
                  Place Bid
                </Button>
              )}

              {!canBid || (auction.status !== 'ACTIVE' || user?.id === auction.seller?.id) && auction.status === 'ACTIVE' && (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 3,
                    py: 2,
                    '& .MuiAlert-message': {
                      width: '100%',
                      textAlign: 'center',
                      fontWeight: 600,
                    }
                  }}
                >
                  {user?.id === auction.seller?.id
                    ? "You can't bid on your own auction"
                    : 'You must be logged in to place a bid'}
                </Alert>
              )}

              {auction.status === 'ENDED' && (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 3,
                    py: 2,
                    '& .MuiAlert-message': {
                      width: '100%',
                      textAlign: 'center',
                      fontWeight: 600,
                    }
                  }}
                >
                  This auction has ended
                </Alert>
              )}

              {auction.status === 'ENDED' && !auction.paid && user?.id === auction.highestBidder?.id && (
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  sx={{
                    mt: 3,
                    py: 2,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    boxShadow: '0 6px 16px rgba(156, 39, 176, 0.3)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(156, 39, 176, 0.4)',
                    },
                  }}
                  onClick={() => setPaymentModalOpen(true)}
                >
                  Pay Now ({formatPrice(auction.currentPrice)})
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Box sx={{ mt: 5 }}>
        <Paper sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
          <Tabs
            value={tabValue}
            onChange={(_e, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '1rem',
                py: 2.5,
              },
              '& .Mui-selected': {
                color: 'primary.main',
              },
            }}
          >
            <Tab label="Bid History" sx={{ fontWeight: 700 }} />
            <Tab label="Auction Details" sx={{ fontWeight: 700 }} />
            <Tab label="Seller Info" sx={{ fontWeight: 700 }} />
          </Tabs>

          <Box sx={{ p: 4 }}>
            {tabValue === 0 && (
              <Box>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    background: `linear-gradient(45deg, ${'#00796b'}, ${'#009688'})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Recent Bids ({bids.length})
                </Typography>
                {bids.length > 0 ? (
                  <List>
                    {bids.map((bid) => (
                      <ListItem
                        key={bid.id}
                        divider
                        sx={{
                          py: 2,
                          '&:hover': {
                            backgroundColor: 'rgba(0, 121, 107, 0.03)',
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            mr: 3,
                            bgcolor: 'primary.main',
                            width: 56,
                            height: 56,
                            fontSize: '1.2rem',
                            fontWeight: 700,
                          }}
                        >
                          {bid.bidder?.firstName?.charAt(0) || bid.bidder?.username?.charAt(0) || 'B'}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography
                                  variant="h6"
                                  sx={{ fontWeight: 700 }}
                                >
                                  {bid.bidder?.firstName} {bid.bidder?.lastName}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {bid.timestamp ? new Date(bid.timestamp).toLocaleString() : 'Unknown date'}
                                </Typography>
                              </Box>
                              <Typography
                                variant="h4"
                                sx={{
                                  fontWeight: 800,
                                  color: 'primary.main',
                                }}
                              >
                                {formatPrice(bid.amount)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography
                    color="text.secondary"
                    sx={{
                      textAlign: 'center',
                      py: 6,
                      fontSize: '1.2rem',
                      fontWeight: 500,
                    }}
                  >
                    No bids yet. Be the first to bid!
                  </Typography>
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    background: `linear-gradient(45deg, ${'#00796b'}, ${'#009688'})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Auction Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Category
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700 }}
                    >
                      {auction.category || 'Unknown'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Start Date
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700 }}
                    >
                      {auction.startDate ? new Date(auction.startDate).toLocaleString() : 'Unknown'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      End Date
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700 }}
                    >
                      {auction.endDate ? new Date(auction.endDate).toLocaleString() : 'Unknown'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Created
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700 }}
                    >
                      {auction.createdAt ? new Date(auction.createdAt).toLocaleString() : 'Unknown'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {tabValue === 2 && (
              <Box>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    background: `linear-gradient(45deg, ${'#00796b'}, ${'#009688'})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Seller Information
                </Typography>
                <Box display="flex" alignItems="center" gap={3} mb={3}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 80,
                      height: 80,
                      fontSize: '2rem',
                      fontWeight: 700,
                    }}
                  >
                    {auction.seller?.firstName?.charAt(0) || auction.seller?.username?.charAt(0) || 'S'}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, mb: 0.5 }}
                    >
                      {auction.seller?.firstName} {auction.seller?.lastName}
                    </Typography>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      @{auction.seller?.username}
                    </Typography>
                    <Chip
                      label="Verified Seller"
                      icon={<Verified />}
                      color="success"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                </Box>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: '1.1rem' }}
                >
                  Member since {auction.seller?.createdAt ? new Date(auction.seller.createdAt).toLocaleDateString() : 'Unknown'}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Bid Dialog */}
      <Dialog
        open={bidDialogOpen}
        onClose={() => setBidDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1.5rem',
            pb: 1,
          }}
        >
          Place a Bid
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              fontWeight: 500,
              fontSize: '1.1rem',
            }}
          >
            Current highest bid:
            <Box component="span" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {' '}{formatPrice(auction.currentPrice)}
            </Box>
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
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setBidDialogOpen(false)}
            sx={{
              py: 1.5,
              px: 3,
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePlaceBid}
            variant="contained"
            disabled={!bidAmount || parseFloat(bidAmount) <= auction.currentPrice}
            sx={{
              py: 1.5,
              px: 3,
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            Confirm Bid
          </Button>
        </DialogActions>
      </Dialog>

      {auction && (
        <PaymentModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          auctionId={auction.id}
          amount={auction.currentPrice}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </Container>
  );
};

export default ModernAuctionDetailPage;