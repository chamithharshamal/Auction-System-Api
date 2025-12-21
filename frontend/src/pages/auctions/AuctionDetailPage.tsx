import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  CardMedia,
  Typography,
  Button,
  Chip,
  TextField,
  Alert,
  Divider,
  List,
  ListItem,
  Avatar,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  useTheme,
} from '@mui/material';
import {
  Gavel,
  Share,
  FavoriteBorder,
  TrendingUp,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import type { AuctionItem, Bid, PlaceBidRequest } from '../../types/api';
import { auctionService } from '../../services/auctionService';
import { bidService } from '../../services/bidService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import PriceTrendsChart from '../../components/auction/PriceTrendsChart';
import { webSocketService } from '../../services/webSocketService';
import { resolveImageUrl } from '../../utils/urlUtils';

const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [priceTrends, setPriceTrends] = useState<{ amount: number, timestamp: string, bidderName: string }[]>([]);

  useEffect(() => {
    if (id) {
      loadAuctionDetails();
      webSocketService.connect();
      webSocketService.subscribeToAuction(id, (newBid) => {
        setAuction(prev => prev ? {
          ...prev,
          currentPrice: newBid.amount,
          totalBids: (prev.totalBids || 0) + 1
        } : null);
        setBids(prev => [newBid, ...prev].slice(0, 10));
        setPriceTrends(prev => [...prev, {
          amount: newBid.amount,
          timestamp: newBid.timestamp,
          bidderName: `${newBid.bidder.firstName} ${newBid.bidder.lastName}`
        }]);
        setSuccess(`New bid: ${formatPrice(newBid.amount)}!`);
      });
    }
  }, [id]);

  const loadAuctionDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const auctionData = await auctionService.getAuctionById(id!);
      setAuction(auctionData);
      try {
        const [bidsData, trendsData] = await Promise.all([
          bidService.getRecentBidsForAuction(id!, 10),
          bidService.getPriceTrends(id!)
        ]);
        setBids(bidsData);
        setPriceTrends(trendsData);
      } catch (bidError) {
        setBids([]);
        setPriceTrends([]);
      }
    } catch (error: any) {
      setError('Loading failed');
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
      setSuccess('Bid successful!');
      setBidDialogOpen(false);
      setBidAmount('');
      loadAuctionDetails();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Bid failed');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) return <LoadingSpinner message="Loading details..." />;
  if (!auction) return <ErrorAlert open={true} message="Missing auction" onClose={() => { }} />;

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }} className="page-fade-in">
      <Container maxWidth="xl">
        {error && <ErrorAlert open={!!error} message={error} onClose={() => setError(null)} />}
        {success && <ErrorAlert open={!!success} message={success} onClose={() => setSuccess(null)} severity="success" />}

        <Grid container spacing={8}>
          {/* Visuals */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', mb: 6 }}>
              <CardMedia
                component="img"
                image={resolveImageUrl(auction.imageUrls?.[0]) || 'https://images.unsplash.com/photo-1579546678183-a84fe535194d'}
                sx={{ height: { xs: 400, md: 600 }, objectFit: 'cover' }}
              />
              <Box sx={{ position: 'absolute', top: 24, left: 24, display: 'flex', gap: 2 }}>
                <Chip label={auction.status} sx={{ fontWeight: 900, bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', color: '#10B981' }} />
                <Chip label={auction.category} sx={{ fontWeight: 900, bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', color: '#3B82F6' }} />
              </Box>
            </Box>

            <Paper className="glass-panel" sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp color="primary" /> Price Trends
              </Typography>
              <PriceTrendsChart data={priceTrends} startingPrice={auction.startingPrice} />
            </Paper>
          </Grid>

          {/* Controls */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: 'sticky', top: 120 }}>
              <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, lineHeight: 1.1 }}>
                {auction.title}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Avatar sx={{ width: 48, height: 48, border: '2px solid', borderColor: 'primary.main' }}>
                  {auction.seller.firstName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{auction.seller.firstName} {auction.seller.lastName}</Typography>
                  <Typography variant="caption" color="text.secondary">Trusted Collector</Typography>
                </Box>
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <IconButton className="glass-panel" sx={{ width: 44, height: 44 }}><Share fontSize="small" /></IconButton>
                  <IconButton className="glass-panel" sx={{ width: 44, height: 44 }}><FavoriteBorder fontSize="small" /></IconButton>
                </Box>
              </Box>

              <Divider sx={{ mb: 4 }} />

              <Paper className="glass-panel" sx={{ p: 4, mb: 4, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase' }}>Current Price</Typography>
                    <Typography variant="h1" className="emerald-gradient-text" sx={{ fontWeight: 900 }}>
                      {formatPrice(auction.currentPrice)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase' }}>Time Left</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#F43F5E' }}>
                      {getTimeRemaining(auction.endDate)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(241, 245, 249, 0.6)',
                  borderRadius: '16px',
                  p: 2,
                  mb: 4,
                  display: 'flex',
                  justifyContent: 'space-between',
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'}`
                }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Starting</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{formatPrice(auction.startingPrice)}</Typography>
                  </Box>
                  <Box sx={{ borderLeft: `1px solid ${theme.palette.divider}`, pl: 4 }}>
                    <Typography variant="caption" color="text.secondary">Bids</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{auction.totalBids || 0} Total</Typography>
                  </Box>
                </Box>

                {isAuthenticated && auction.status === 'ACTIVE' && user?.id !== auction.seller.id ? (
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<Gavel />}
                    onClick={() => setBidDialogOpen(true)}
                    sx={{
                      height: 64,
                      fontSize: '1.2rem',
                      fontWeight: 900,
                      borderRadius: '16px',
                      textTransform: 'none',
                      boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    Join Bidding
                  </Button>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: '16px', bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    {auction.status === 'ENDED' ? 'Auction Ended' :
                      user?.id === auction.seller.id ? 'Watching your item' : 'Join to place a bid'}
                  </Alert>
                )}
              </Paper>

              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                {auction.description}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Info Area */}
        <Box sx={{ mt: 10 }}>
          <Tabs
            value={tabValue}
            onChange={(_e, v) => setTabValue(v)}
            sx={{
              mb: 4,
              '& .MuiTabs-indicator': { height: 4, borderRadius: 2 },
              '& .MuiTab-root': { fontWeight: 900, fontSize: '1rem', px: 4 }
            }}
          >
            <Tab label="Bid History" />
            <Tab label="Details" />
            <Tab label="About Seller" />
          </Tabs>

          <Box className="glass-panel" sx={{ p: 4 }}>
            {tabValue === 0 && (
              <List sx={{ p: 0 }}>
                {bids.length > 0 ? bids.map((bid, i) => (
                  <ListItem key={bid.id} sx={{
                    borderRadius: '16px',
                    mb: 1,
                    bgcolor: i === 0 ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                    border: i === 0 ? '1px solid rgba(16, 185, 129, 0.2)' : 'none'
                  }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main', fontWeight: 900 }}>{bid.bidder.firstName?.[0]}</Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 800 }}>{bid.bidder.firstName} {bid.bidder.lastName}</Typography>
                      <Typography variant="caption" color="text.secondary">{new Date(bid.timestamp).toLocaleString()}</Typography>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: i === 0 ? 'primary.main' : 'text.primary' }}>
                      {formatPrice(bid.amount)}
                    </Typography>
                  </ListItem>
                )) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="text.secondary">No bids detected in the history.</Typography>
                  </Box>
                )}
              </List>
            )}

            {tabValue === 1 && (
              <Grid container spacing={3}>
                {[
                  { label: 'Category', value: auction.category },
                  { label: 'Start Date', value: new Date(auction.startDate).toLocaleString() },
                  { label: 'End Date', value: new Date(auction.endDate).toLocaleString() },
                  { label: 'ID', value: auction.id.slice(0, 12) + '...' }
                ].map((item) => (
                  <Grid size={{ xs: 6, md: 3 }} key={item.label}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase' }}>{item.label}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                  </Grid>
                ))}
              </Grid>
            )}

            {tabValue === 2 && (
              <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <Avatar sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'primary.main' }}>{auction.seller.firstName?.[0]}</Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{auction.seller.firstName} {auction.seller.lastName}</Typography>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>@{auction.seller.username}</Typography>
                  <Typography variant="body2">Member since {new Date(auction.seller.createdAt).toLocaleDateString()}</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      <Dialog open={bidDialogOpen} onClose={() => setBidDialogOpen(false)} PaperProps={{ className: 'glass-panel', sx: { p: 2, borderRadius: '24px' } }}>
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', pb: 1 }}>Place Bid</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 3, color: 'text.secondary' }}>Current High: <b style={{ color: theme.palette.primary.main }}>{formatPrice(auction.currentPrice)}</b></Typography>
          <TextField
            autoFocus
            fullWidth
            label="Your Bid Amount"
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            helperText={`Min possible: ${formatPrice(auction.currentPrice + 1)}`}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setBidDialogOpen(false)} sx={{ fontWeight: 800 }}>Cancel</Button>
          <Button
            onClick={handlePlaceBid}
            variant="contained"
            disabled={!bidAmount || parseFloat(bidAmount) <= auction.currentPrice}
            sx={{ borderRadius: '12px', px: 4, fontWeight: 900 }}
          >
            Confirm Bid
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuctionDetailPage;
